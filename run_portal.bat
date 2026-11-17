@echo off
title College Student ERP Portal Launcher
echo ========================================================
echo   Starting College ERP Portal (CampusERP)
echo ========================================================
echo.

echo Starting Django Backend Server (Port 8000)...
start "Django Backend Server" cmd /k "cd /d %~dp0backend && .\venv\Scripts\python manage.py runserver 0.0.0.0:8000"

echo Starting Vite React Frontend (Port 5173)...
start "React Frontend Server" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================================
echo   Both servers launched successfully!
echo   - Frontend: http://127.0.0.1:5173
echo   - Backend:  http://127.0.0.1:8000/api/
echo   - Admin DB: http://127.0.0.1:8000/admin/
echo ========================================================
timeout /t 3 >nul
start http://127.0.0.1:5173
pause
