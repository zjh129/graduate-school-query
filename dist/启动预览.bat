@echo off
chcp 65001 >nul
cd /d "%~dp0"
start "" "%~dp0serve.exe"
timeout /t 2 /nobreak >nul
start http://localhost:8080
