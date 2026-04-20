"""Entry point to run the FastAPI application."""

import os
from pathlib import Path

import uvicorn

# Load .env file if it exists
env_file = Path(__file__).parent / ".env"
if env_file.exists():
    with open(env_file) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                os.environ.setdefault(key.strip(), value.strip())

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    dev_mode = os.environ.get("DEV_MODE", "").lower() in ("1", "true", "yes")
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=dev_mode)
