@echo off
title MONOLOG - Anime Platform
echo ==========================================
echo   Iniciando servidor de MONOLOG...
echo ==========================================
cd /d "C:\Users\Dell\.gemini\antigravity\scratch\untitled-anime-platform"

echo Abriendo navegador en http://localhost:3000 ...
start http://localhost:3000

echo Servidor en ejecucion. Deja esta ventana abierta mientras uses la pagina.
echo (Para cerrarla, simplemente cierra esta ventana).
echo.
node server.js
pause
