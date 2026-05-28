"""FastAPI application for the Restaurant Leads Scraper."""

import logging
import os
import secrets
from datetime import datetime, timezone
from pathlib import Path

from fastapi import FastAPI, Request, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, StreamingResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from starlette.middleware.base import BaseHTTPMiddleware

from app.models import ScrapeRequest, LeadResult
from app.config import MAX_CONCURRENT_BROWSERS
from app.scraper.orchestrator import (
    run_scrape_job,
    get_job,
    get_all_jobs,
    parse_us_location_line,
)
from app.exporter import export_to_csv, export_to_json
from app.utils import db_row_to_lead
from app import database as db

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

# ─── Rate Limiter ────────────────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="Restaurant Leads Scraper", version="2.0.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ─── CORS Configuration ───────────────────────────────────────────────
ALLOWED_ORIGINS = os.environ.get(
    "ALLOWED_ORIGINS", "http://localhost:8000,http://localhost:3000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in ALLOWED_ORIGINS],
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "X-API-Key"],
)


# ─── Security Headers Middleware ──────────────────────────────────────
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response


app.add_middleware(SecurityHeadersMiddleware)


# ─── API Key Authentication ───────────────────────────────────────────

def get_configured_api_key() -> str:
    """Return the currently configured API key, if any."""
    return os.environ.get("API_KEY", "")


def verify_api_key(request: Request) -> None:
    """Verify API key for protected endpoints. Skipped if API_KEY is not set."""
    api_key = get_configured_api_key()
    if not api_key:
        return
    provided = request.headers.get("X-API-Key", "")
    if not secrets.compare_digest(provided, api_key):
        raise HTTPException(status_code=403, detail="Invalid or missing API key")


def require_api_key(request: Request) -> None:
    """Verify API key — always required (for destructive endpoints)."""
    api_key = get_configured_api_key()
    if not api_key:
        raise HTTPException(
            status_code=403,
            detail="API_KEY env variable must be set to use this endpoint.",
        )
    provided = request.headers.get("X-API-Key", "")
    if not secrets.compare_digest(provided, api_key):
        raise HTTPException(status_code=403, detail="Invalid or missing API key")


# ─── Static Files & Templates ────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent
app.mount("/static", StaticFiles(directory=str(BASE_DIR / "static")), name="static")
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))


# ─── Core Routes ─────────────────────────────────────────────────────

@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    """Render the main dashboard."""
    return templates.TemplateResponse("index.html", {"request": request})


@app.get("/api/health")
async def healthcheck():
    """Lightweight health endpoint for load balancers."""
    db_status = db.get_connection_status()
    return {
        "status": "ok",
        "service": app.title,
        "version": app.version,
        "api_key_required": bool(get_configured_api_key()),
        "database": {
            "configured": db_status["configured"],
            "connected": db_status["connected"],
        },
    }


# ─── Scraping Endpoints ──────────────────────────────────────────────

@app.post("/api/scrape")
@limiter.limit("10/minute")
async def start_scrape(request: Request, body: ScrapeRequest, _auth: None = Depends(verify_api_key)):
    """Start a new scraping job. Rate limited to 10 requests/minute per IP."""
    body.search_terms = [s.strip() for s in body.search_terms if s.strip()]
    body.zip_codes = [z.strip() for z in body.zip_codes if z.strip()]

    if not body.search_terms or not body.zip_codes:
        return JSONResponse(
            status_code=400,
            content={"error": "Please provide at least one search term and one US ZIP target."},
        )

    normalized_locations = []
    try:
        for raw_line in body.zip_codes:
            normalized_locations.append(parse_us_location_line(raw_line)["location"])
    except ValueError as exc:
        return JSONResponse(
            status_code=400,
            content={"error": f"Only US locations are supported. {exc}"},
        )

    body.zip_codes = normalized_locations
    job_id = await run_scrape_job(body)
    return {"job_id": job_id, "message": "Scraping job started!"}


@app.get("/api/job/{job_id}")
async def get_job_status(job_id: str, _auth: None = Depends(verify_api_key)):
    """Get the status of a scraping job (real-time from memory)."""
    job = get_job(job_id)
    if not job:
        return JSONResponse(status_code=404, content={"error": "Job not found"})

    eta_seconds = None
    elapsed_seconds = None
    if job.started_at:
        elapsed_seconds = (datetime.now(timezone.utc) - job.started_at).total_seconds()
        if job.leads_per_combination and job.completed < job.total:
            avg_time = sum(job.leads_per_combination) / len(job.leads_per_combination)
            remaining = job.total - job.completed
            eta_seconds = round(avg_time * remaining / max(MAX_CONCURRENT_BROWSERS, 1))

    return {
        "job_id": job.job_id,
        "status": job.status,
        "total": job.total,
        "completed": job.completed,
        "results_count": len(job.results),
        "errors": job.errors,
        "results": [r.model_dump() for r in job.results],
        "duplicates_skipped": job.duplicates_skipped,
        "eta_seconds": eta_seconds,
        "elapsed_seconds": round(elapsed_seconds) if elapsed_seconds else None,
    }


@app.get("/api/jobs")
async def list_jobs(_auth: None = Depends(verify_api_key)):
    """List all scraping jobs (current session, from memory)."""
    jobs = get_all_jobs()
    return [
        {
            "job_id": j.job_id,
            "status": j.status,
            "total": j.total,
            "completed": j.completed,
            "results_count": len(j.results),
        }
        for j in jobs
    ]


# ─── Task History Endpoints ──────────────────────────────────────────

@app.get("/api/tasks")
async def list_tasks(_auth: None = Depends(verify_api_key)):
    """Get all task history from database."""
    tasks = await db.get_all_tasks()
    return {"tasks": tasks}


@app.delete("/api/tasks/{job_id}")
async def delete_task(job_id: str, _auth: None = Depends(verify_api_key)):
    """Delete a task and all its associated data from database."""
    ok = await db.delete_task(job_id)
    if ok:
        return {"message": f"Task {job_id} deleted."}
    return JSONResponse(status_code=500, content={"error": "Failed to delete task."})


@app.get("/api/tasks/{job_id}/results")
async def get_task_results(job_id: str, _auth: None = Depends(verify_api_key)):
    """Get all results for a specific task from database."""
    results = await db.get_task_results(job_id)
    return {"results": results, "count": len(results)}


# ─── Business Data Endpoints ─────────────────────────────────────────

@app.get("/api/data")
async def get_business_data(
    industry: str = "",
    limit: int = 5000,
    _auth: None = Depends(verify_api_key),
):
    """Get all business data, optionally filtered by industry."""
    limit = min(limit, 10000)
    data = await db.get_all_business_data(industry=industry, limit=limit)
    return {"data": data, "count": len(data)}


@app.get("/api/industries")
async def get_industries(_auth: None = Depends(verify_api_key)):
    """Get list of unique industries/search queries in database."""
    industries = await db.get_industries()
    return {"industries": industries}


@app.get("/api/stats")
async def get_stats(_auth: None = Depends(verify_api_key)):
    """Get overall database statistics."""
    stats = await db.get_stats()
    return stats


@app.delete("/api/data")
async def delete_all_data(_auth: None = Depends(require_api_key)):
    """Delete ALL business data and tasks. Always requires API key."""
    ok = await db.delete_all_data()
    if ok:
        return {"message": "All data deleted successfully."}
    return JSONResponse(status_code=500, content={"error": "Failed to delete data."})


# ─── Export Endpoints ────────────────────────────────────────────────

@app.get("/api/export-task/{job_id}/{fmt}")
async def export_task_results(job_id: str, fmt: str, _auth: None = Depends(verify_api_key)):
    """Export task results from database as CSV or JSON."""
    results = await db.get_task_results(job_id)
    if not results:
        return JSONResponse(status_code=400, content={"error": "No results for this task"})

    leads = [db_row_to_lead(row) for row in results]

    if fmt == "csv":
        return StreamingResponse(
            iter([export_to_csv(leads)]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=task_{job_id}.csv"},
        )
    elif fmt == "json":
        return StreamingResponse(
            iter([export_to_json(leads)]),
            media_type="application/json",
            headers={"Content-Disposition": f"attachment; filename=task_{job_id}.json"},
        )
    return JSONResponse(status_code=400, content={"error": "Invalid format. Use 'csv' or 'json'."})


@app.get("/api/export/{job_id}/{fmt}")
async def export_results(job_id: str, fmt: str, _auth: None = Depends(verify_api_key)):
    """Export job results as CSV or JSON (from memory)."""
    job = get_job(job_id)
    if not job:
        return JSONResponse(status_code=404, content={"error": "Job not found"})
    if not job.results:
        return JSONResponse(status_code=400, content={"error": "No results to export"})

    if fmt == "csv":
        return StreamingResponse(
            iter([export_to_csv(job.results)]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=leads_{job_id}.csv"},
        )
    elif fmt == "json":
        return StreamingResponse(
            iter([export_to_json(job.results)]),
            media_type="application/json",
            headers={"Content-Disposition": f"attachment; filename=leads_{job_id}.json"},
        )
    return JSONResponse(status_code=400, content={"error": "Invalid format. Use 'csv' or 'json'."})


@app.get("/api/export-db/{fmt}")
async def export_db_data(fmt: str, industry: str = "", _auth: None = Depends(verify_api_key)):
    """Export database data as CSV or JSON, optionally filtered by industry."""
    data = await db.get_all_business_data(industry=industry)
    if not data:
        return JSONResponse(status_code=400, content={"error": "No data to export"})

    leads = [db_row_to_lead(row) for row in data]
    suffix = f"_{industry}" if industry else "_all"

    if fmt == "csv":
        return StreamingResponse(
            iter([export_to_csv(leads)]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=leads{suffix}.csv"},
        )
    elif fmt == "json":
        return StreamingResponse(
            iter([export_to_json(leads)]),
            media_type="application/json",
            headers={"Content-Disposition": f"attachment; filename=leads{suffix}.json"},
        )
    return JSONResponse(status_code=400, content={"error": "Invalid format. Use 'csv' or 'json'."})
