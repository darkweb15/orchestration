# ScraperPro - Next.js Frontend + FastAPI Backend

Modern web scraping dashboard with Next.js frontend and FastAPI backend.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (for frontend)
- Python 3.10+ (for backend)
- npm or pnpm

### 1. Start Backend (FastAPI)

```bash
cd /home/bhargav/ender-main/ender-main

# Activate virtual environment
source venv/bin/activate  # or: . venv/bin/activate

# Start server
python run.py
```

Backend will run on: **http://localhost:8000**

### 2. Start Frontend (Next.js)

Open a NEW terminal:

```bash
cd /home/bhargav/ender-main/AyCQg221v6l

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

Frontend will run on: **http://localhost:3000**

### 3. Open Browser

Navigate to: **http://localhost:3000**

## 📁 Project Structure

```
/home/bhargav/ender-main/
├── ender-main/              # FastAPI Backend
│   ├── app/
│   │   ├── main.py         # API endpoints
│   │   ├── scraper/        # Scraping logic
│   │   └── database.py     # Supabase integration
│   ├── venv/               # Python virtual environment
│   └── run.py              # Backend entry point
│
└── AyCQg221v6l/            # Next.js Frontend
    ├── app/                # Pages
    ├── components/         # React components
    ├── lib/
    │   └── api.ts         # API client (connects to backend)
    └── .env.local         # Environment variables
```

## 🔧 Configuration

### Backend (.env in ender-main/)
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
PORT=8000
```

### Frontend (.env.local in AyCQg221v6l/)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🎯 Features

### Dashboard
- Real-time statistics from backend
- Total scraped records
- Email extraction stats
- Active jobs monitoring
- Success rate tracking

### API Integration
All data comes from FastAPI backend:
- `/api/stats` - Database statistics
- `/api/jobs` - Active scraping jobs
- `/api/tasks` - Task history
- `/api/data` - Business data

## 🐛 Troubleshooting

### Backend not connecting?
1. Check if backend is running: `curl http://localhost:8000/api/stats`
2. Check CORS settings in `app/main.py`
3. Verify `.env` file has correct Supabase credentials

### Frontend errors?
1. Clear Next.js cache: `rm -rf .next`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Check browser console for errors

### CORS errors?
Backend `app/main.py` already configured for `localhost:3000`. If using different port, update:
```python
ALLOWED_ORIGINS = "http://localhost:8000,http://localhost:3000"
```

## 📝 Development

### Adding New API Endpoints

1. **Backend** (`ender-main/app/main.py`):
```python
@app.get("/api/my-endpoint")
async def my_endpoint():
    return {"data": "value"}
```

2. **Frontend API Client** (`AyCQg221v6l/lib/api.ts`):
```typescript
async getMyData() {
  return this.request<{ data: string }>('/api/my-endpoint')
}
```

3. **Use in Component**:
```typescript
import { apiClient } from '@/lib/api'

const data = await apiClient.getMyData()
```

## 🚀 Production Deployment

### Backend
```bash
# Use gunicorn or uvicorn with workers
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Frontend
```bash
# Build for production
npm run build

# Start production server
npm start
```

Update `.env.local` with production API URL:
```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

## 📊 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/stats` | GET | Database statistics |
| `/api/scrape` | POST | Start scraping job |
| `/api/job/{id}` | GET | Job status |
| `/api/tasks` | GET | Task history |
| `/api/data` | GET | Business data |
| `/api/export/{id}/{format}` | GET | Export results |

## 🎨 UI Components

Built with:
- **Next.js 16** - React framework
- **Tailwind CSS** - Styling
- **Radix UI** - Component library
- **Recharts** - Data visualization
- **Lucide Icons** - Icon library

## 📦 Tech Stack

### Frontend
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Radix UI

### Backend
- FastAPI
- Python 3.12
- Playwright
- Supabase
- BeautifulSoup

## 🤝 Contributing

1. Backend changes: `ender-main/`
2. Frontend changes: `AyCQg221v6l/`
3. Test both servers running together
4. Check browser console for errors

## 📄 License

MIT

---

**Need Help?**
- Backend not starting? Check Python version and venv
- Frontend not starting? Check Node.js version
- API errors? Check both servers are running
- CORS errors? Check `ALLOWED_ORIGINS` in backend
