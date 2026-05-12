@echo off
echo ============================================
echo   BexieMart Unified Dev Server
echo ============================================
echo.
echo This will start:
echo   1. Backend API server (port 3000) — PostgreSQL + Better Auth
echo   2. Metro Bundler (port 8082) — React Native bundling
echo   3. Unified Proxy (port 8081) — Single entry point
echo.
echo Auth: Email + Google + Facebook
echo Database: PostgreSQL (Neon)
echo Payments: Paystack
echo.
echo Press Ctrl+C to stop all servers.
echo ============================================
echo.
cd /d "%~dp0"
npm run dev
pause
