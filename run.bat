@echo off
title Meta Ads & Gemini Chatbot 2.5
echo =======================================================
echo         Meta Ads & Gemini AI Chatbot v2.5
echo =======================================================
echo.

cd /d "%~dp0"

echo Launching AdBot FastAPI Backend Server & Frontend...
echo Server running on http://127.0.0.1:8000
echo (Do not close this window while using the chatbot)
echo.

start "" http://127.0.0.1:8000
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000

pause
