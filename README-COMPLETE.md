# 🚀 ScraperPro - Complete Integration Guide

Modern web scraping platform with Next.js frontend and FastAPI backend - **FULLY INTEGRATED!**

## ✅ What's Been Done

### Backend (FastAPI)
- ✅ All API endpoints working
- ✅ CORS configured for Next.js
- ✅ Database integration (Supabase)
- ✅ Real-time job tracking
- ✅ Export functionality (CSV/JSON)

### Frontend (Next.js)
- ✅ **Dashboard** - Real-time stats from backend
- ✅ **Search/Scraper** - Start jobs, monitor progress, view results
- ✅ **History** - Task management, export, delete
- ✅ **Statistics** - Database explorer, industry filter, search
- ✅ **Settings** - API key management, system status
- ✅ API Client - Complete integration with all endpoints

## 🎯 Quick Start (3 Commands!)

### Option 1: Automatic Startup (Recommended)

```bash
cd /home/bhargav/ender-main
./start-all.sh
```

This starts both backend and frontend automatically!

### Option 2: Manual Startup

**Terminal 1 - Backend:**
```bash
cd /home/bhargav/ender-main/ender-main
source venv/bin/activate
python run.py
```

**Terminal 2 - Frontend:**
```bash
cd /home/bhargav/ender-main/AyCQg221v6l
npm run dev
```

### Access the Application

Open browser: **http://localhost:3000**

## 📊 Features Overview

### 1. Dashboard (`/`)
- Real-time statistics from database
- Total businesses, emails, tasks
- Active jobs monitoring
- Success rate tracking
- Auto-refresh every 30 seconds

### 2. Search & Scrape (`/search`)
- Configure scraping jobs
- Enter search terms and zip codes
- Select scraping speed (Fast/Balanced/Quality)
- Real-time progress monitoring
- Live results table
- Export results (CSV/JSON)
- ETA and elapsed time tracking

### 3. Task History (`/history`)
- View all completed tasks
- Task statistics (Completed/Running/Failed)
- Export task results
- Delete tasks with confirmation
- Formatted dates and status badges

### 4. Statistics (`/statistics`)
- Complete database explorer
- Filter by industry
- Search across all fields
- View business details
- Export filtered data
- POS detection stats
- Email success rates

### 5. Settings (`/settings`)
- System status monitoring
- Backend connection check
- Database health status
- API key management
- Application information

## 🔧 Configuration

### Backend Environment (`.env` in `ender-main/`)
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
PORT=8000
ALLOWED_ORIGINS=http://localhost:8000,http://localhost:3000
```

### Frontend Environment (`.env.local` in `AyCQg221v6l/`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📁 Project Structure

```
/home/bhargav/ender-main/
│
├── ender-main/                    # FastAPI Backend
│   ├── app/
│   │   ├── main.py               # API endpoints
│   │   ├── scraper/              # Scraping logic
│   │   │   ├── google_maps.py
│   │   │   ├── email_extractor.py
│   │   │   ├── pos_detector.py
│   │   │   └── orchestrator.py
│   │   ├── database.py           # Supabase integration
│   │   ├── models.py             # Data models
│   │   └── config.py             # Configuration
│   ├── venv/                     # Python virtual environment
│   └── run.py                    # Backend entry point
│
├── AyCQg221v6l/                  # Next.js Frontend
│   ├── app/
│   │   ├── page.tsx              # Dashboard (integrated)
│   │   ├── search/page.tsx       # Scraper (integrated)
│   │   ├── history/page.tsx      # Tasks (integrated)
│   │   ├── statistics/page.tsx   # Database (integrated)
│   │   └── settings/page.tsx     # Settings (integrated)
│   ├── components/               # React components
│   ├── lib/
│   │   └── api.ts               # API Client (all endpoints)
│   └── .env.local               # Environment variables
│
└── start-all.sh                  # Startup script
```

## 🎨 API Integration Details

### API Client (`lib/api.ts`)

All backend endpoints integrated:

```typescript
// Scraping
apiClient.startScrape(data)
apiClient.getJobStatus(jobId)
apiClient.getAllJobs()

// Tasks
apiClient.getTasks()
apiClient.getTaskResults(jobId)
apiClient.deleteTask(jobId)

// Database
apiClient.getBusinessData(industry, limit)
apiClient.getIndustries()
apiClient.getStats()

// Export
apiClient.exportJobResults(jobId, format)
apiClient.exportTaskResults(jobId, format)
apiClient.exportDbData(format, industry)
```

## 🔄 Data Flow

```
User Action (Frontend)
    ↓
API Client (lib/api.ts)
    ↓
HTTP Request
    ↓
FastAPI Backend (localhost:8000)
    ↓
Database (Supabase)
    ↓
Response
    ↓
Frontend Update (React State)
    ↓
UI Refresh
```

## 🐛 Troubleshooting

### Backend not connecting?

```bash
# Check if backend is running
curl http://localhost:8000/api/stats

# Check logs
tail -f /home/bhargav/ender-main/ender-main/backend.log

# Restart backend
pkill -f 'python run.py'
cd /home/bhargav/ender-main/ender-main
source venv/bin/activate
python run.py
```

### Frontend errors?

```bash
# Check logs
tail -f /home/bhargav/ender-main/AyCQg221v6l/frontend.log

# Clear cache and restart
cd /home/bhargav/ender-main/AyCQg221v6l
rm -rf .next
npm run dev
```

### CORS errors?

Check `ender-main/app/main.py`:
```python
ALLOWED_ORIGINS = "http://localhost:8000,http://localhost:3000"
```

### Port already in use?

```bash
# Kill processes on ports
pkill -f 'python run.py'    # Backend (8000)
pkill -f 'next dev'          # Frontend (3000)
```

## 📝 Usage Examples

### 1. Start a Scraping Job

1. Go to **Search** page
2. Enter search terms (one per line):
   ```
   liquor stores
   wine shops
   ```
3. Enter zip codes:
   ```
   10001 New York NY USA
   90001 Los Angeles CA USA
   ```
4. Click "Start Scraping"
5. Watch real-time progress
6. Export results when complete

### 2. View Task History

1. Go to **History** page
2. See all completed tasks
3. Click export buttons for CSV/JSON
4. Delete old tasks if needed

### 3. Explore Database

1. Go to **Statistics** page
2. Filter by industry
3. Search for specific businesses
4. Export filtered data

### 4. Configure Settings

1. Go to **Settings** page
2. Check system status
3. Set API key (if required)
4. View database stats

## 🚀 Production Deployment

### Backend
```bash
# Use gunicorn with workers
cd /home/bhargav/ender-main/ender-main
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Frontend
```bash
# Build for production
cd /home/bhargav/ender-main/AyCQg221v6l
npm run build
npm start
```

Update `.env.local` with production URL:
```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

## 📊 Tech Stack

### Frontend
- **Next.js 16** - React framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Radix UI** - Component library
- **Recharts** - Data visualization
- **Lucide Icons** - Icon library

### Backend
- **FastAPI** - Python web framework
- **Playwright** - Browser automation
- **BeautifulSoup** - HTML parsing
- **Supabase** - PostgreSQL database
- **Pydantic** - Data validation

## 🎯 Key Features

✅ Real-time scraping with progress tracking
✅ Email extraction from multiple sources
✅ POS system detection
✅ Social media link extraction
✅ Duplicate detection
✅ Export to CSV/JSON
✅ Task history management
✅ Database explorer with search
✅ Industry filtering
✅ API key authentication
✅ System health monitoring
✅ Responsive design
✅ Dark theme with neon accents

## 📈 Performance

- **Concurrent Scraping**: 3 parallel browser instances
- **Request Timeout**: 20 seconds
- **Max Results**: Up to 100 per search
- **Speed Modes**: Fast/Balanced/Quality
- **Auto-refresh**: Dashboard updates every 30s

## 🔒 Security

- CORS configured for specific origins
- API key authentication (optional)
- Security headers middleware
- Input validation
- SQL injection prevention (Supabase)

## 🤝 Support

### Logs Location
- Backend: `/home/bhargav/ender-main/ender-main/backend.log`
- Frontend: `/home/bhargav/ender-main/AyCQg221v6l/frontend.log`

### Common Issues

1. **"Failed to load statistics"**
   - Backend not running
   - Check: `curl http://localhost:8000/api/stats`

2. **"CORS error"**
   - Check ALLOWED_ORIGINS in backend
   - Restart backend after changes

3. **"Job not found"**
   - Job completed and cleared from memory
   - Check History page for results

## 📄 License

MIT

---

## 🎉 You're All Set!

Run the startup script and enjoy your fully integrated scraping platform:

```bash
cd /home/bhargav/ender-main
./start-all.sh
```

Then open: **http://localhost:3000**

**Happy Scraping! 🚀**
