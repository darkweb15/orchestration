#!/bin/bash

# ScraperPro - Complete Startup Script
# This script starts both Backend (FastAPI) and Frontend (Next.js)

set -e

echo "🚀 Starting ScraperPro..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if backend is already running
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${YELLOW}⚠️  Backend already running on port 8000${NC}"
else
    echo -e "${BLUE}📦 Starting Backend (FastAPI)...${NC}"
    cd /home/bhargav/ender-main/ender-main
    source venv/bin/activate
    nohup python run.py > backend.log 2>&1 &
    BACKEND_PID=$!
    echo -e "${GREEN}✅ Backend started (PID: $BACKEND_PID)${NC}"
    echo "   Logs: /home/bhargav/ender-main/ender-main/backend.log"
    echo "   URL: http://localhost:8000"
    echo ""
    sleep 3
fi

# Check if frontend is already running
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${YELLOW}⚠️  Frontend already running on port 3000${NC}"
else
    echo -e "${BLUE}🎨 Starting Frontend (Next.js)...${NC}"
    cd /home/bhargav/ender-main/AyCQg221v6l
    nohup npm run dev > frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo -e "${GREEN}✅ Frontend started (PID: $FRONTEND_PID)${NC}"
    echo "   Logs: /home/bhargav/ender-main/AyCQg221v6l/frontend.log"
    echo "   URL: http://localhost:3000"
    echo ""
fi

echo ""
echo -e "${GREEN}🎉 ScraperPro is running!${NC}"
echo ""
echo "📊 Access Points:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "📝 Logs:"
echo "   Backend:  tail -f /home/bhargav/ender-main/ender-main/backend.log"
echo "   Frontend: tail -f /home/bhargav/ender-main/AyCQg221v6l/frontend.log"
echo ""
echo "🛑 To stop:"
echo "   pkill -f 'python run.py'"
echo "   pkill -f 'next dev'"
echo ""
