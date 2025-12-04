@echo off
chcp 65001 >nul
color 0C
title 🧹 Limpar TODOS os Service Workers

echo.
echo ========================================
echo  🧹 LIMPAR SERVICE WORKERS DO CHROME
echo ========================================
echo.
echo ⚠️  ATENÇÃO: Isso vai limpar TODOS os
echo     service workers registrados!
echo.
echo     Você terá que fazer login novamente
echo     em alguns sites (YouTube, Gmail, etc)
echo.
pause
echo.

REM Fechar Chrome/Edge
echo [1/4] 🔴 Fechando navegadores...
taskkill /F /IM chrome.exe 2>nul
taskkill /F /IM msedge.exe 2>nul
taskkill /F /IM firefox.exe 2>nul
timeout /t 2 /nobreak >nul
echo       ✅ Navegadores fechados
echo.

REM Limpar Service Workers do Chrome
echo [2/4] 🗑️  Limpando Service Workers do Chrome...
set CHROME_DATA=%LOCALAPPDATA%\Google\Chrome\User Data\Default
if exist "%CHROME_DATA%\Service Worker" (
    rmdir /s /q "%CHROME_DATA%\Service Worker"
    echo       ✅ Service Workers do Chrome removidos
) else (
    echo       ℹ️  Pasta não encontrada
)
echo.

REM Limpar Cache do Chrome
echo [3/4] 🗑️  Limpando Cache do Chrome...
if exist "%CHROME_DATA%\Cache" (
    rmdir /s /q "%CHROME_DATA%\Cache"
    echo       ✅ Cache do Chrome removido
) else (
    echo       ℹ️  Cache não encontrado
)
echo.

REM Limpar Service Workers do Edge
echo [4/4] 🗑️  Limpando Service Workers do Edge...
set EDGE_DATA=%LOCALAPPDATA%\Microsoft\Edge\User Data\Default
if exist "%EDGE_DATA%\Service Worker" (
    rmdir /s /q "%EDGE_DATA%\Service Worker"
    echo       ✅ Service Workers do Edge removidos
) else (
    echo       ℹ️  Pasta não encontrada
)
echo.

echo ========================================
echo  ✨ LIMPEZA CONCLUÍDA!
echo ========================================
echo.
echo 📋 PRÓXIMO PASSO:
echo.
echo    1. Abra o Chrome/Edge
echo    2. Vá em: chrome://serviceworker-internals
echo    3. Verifique se está vazio
echo    4. Acesse: http://localhost:8080
echo.
echo ⚠️  Você precisará fazer login novamente
echo     em sites como YouTube, Gmail, etc.
echo.
pause
