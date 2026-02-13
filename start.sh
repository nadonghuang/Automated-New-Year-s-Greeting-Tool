#!/bin/bash

echo "🎯 自动化拜年助手 - 启动脚本"
echo ""

# Kill ports 8000 and 3000 just in case
lsof -ti:8000 | xargs kill -9 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null

# Start Backend
echo "🚀 启动后端服务 (FastAPI)..."
cd backend
python main.py &
BACKEND_PID=$!
cd ..

echo "✅ 后端已启动 (PID: $BACKEND_PID)"
echo ""

# Start Frontend (if not already running)
if ! lsof -ti:3000 > /dev/null 2>&1; then
    echo "🎨 启动前端界面 (Next.js)..."
    cd frontend
    npm run dev -- -p 3000 &
    FRONTEND_PID=$!
    cd ..

    echo "✅ 前端已启动 (PID: $FRONTEND_PID)"
    echo ""
else
    echo "ℹ️ 前端已在运行"
    FRONTEND_PID=""
fi

echo "============================================================"
echo "🎉 服务已启动！"
echo ""
echo "📊 后端 API: http://127.0.0.1:8000"
echo "🎨 前端界面: http://localhost:3000"
echo ""
echo "⌨️  按 Ctrl+C 停止所有服务"
echo "============================================================"
echo ""

# Wait for user to exit
wait
