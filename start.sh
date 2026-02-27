#!/bin/bash
# Run this script to start both backend and frontend (opens 2 terminal tabs on macOS)

cd "$(dirname "$0")"

echo "Starting backend on http://localhost:3001 ..."
cd backend && npm run dev &
BACKEND_PID=$!
cd ..

sleep 3
echo "Starting frontend on http://localhost:5173 ..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "Open in browser: http://localhost:5173"
echo "Press Ctrl+C to stop both."
wait
