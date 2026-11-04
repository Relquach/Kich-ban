@echo off
chcp 65001 >nul
cd /d "%~dp0"
set "OPEN_BROWSER=1"
py -3 --version >nul 2>&1
if not errorlevel 1 (
    py -3 server.py
) else (
    python --version >nul 2>&1
    if errorlevel 1 (
        echo Can cai Python 3.10 tro len. Khi cai, chon Add Python to PATH.
        pause
        exit /b 1
    )
    python server.py
)
if errorlevel 1 (
    echo Khong khoi dong duoc. Xem loi o tren.
    pause
)
