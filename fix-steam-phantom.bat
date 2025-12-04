@echo off
chcp 65001 >nul
color 0B
title 🛠️ Eliminar Página Fantasma da Steam

echo.
echo ========================================
echo  🛠️ ELIMINAR PÁGINA FANTASMA DA STEAM
echo ========================================
echo.

REM 1️⃣ Fechar processos do Steam
echo [1/6] 🔴 Fechando processos do Steam...
taskkill /F /IM steam.exe 2>nul
taskkill /F /IM steamwebhelper.exe 2>nul
timeout /t 2 /nobreak >nul
echo       ✅ Steam fechado
echo.

REM 2️⃣ Parar servidor Node se estiver rodando
echo [2/6] 🔴 Parando servidor Node...
taskkill /F /IM node.exe 2>nul
timeout /t 1 /nobreak >nul
echo       ✅ Node parado
echo.

REM 3️⃣ Limpar pasta dist
echo [3/6] 🗑️  Limpando pasta dist...
if exist "dist" (
    rmdir /s /q "dist"
    echo       ✅ Pasta dist removida
) else (
    echo       ℹ️  Pasta dist não existe
)
echo.

REM 4️⃣ Limpar cache do Vite
echo [4/6] 🗑️  Limpando cache do Vite...
if exist "node_modules\.vite" (
    rmdir /s /q "node_modules\.vite"
    echo       ✅ Cache do Vite removido
) else (
    echo       ℹ️  Cache do Vite não existe
)
echo.

REM 5️⃣ Iniciar servidor
echo [5/6] 🚀 Iniciando servidor de desenvolvimento...
start "GameVault Dev Server" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul
echo       ✅ Servidor iniciado
echo.

REM 6️⃣ Abrir navegador em modo anônimo
echo [6/6] 🌐 Abrindo navegador em modo anônimo...
echo.
echo       ⚠️  IMPORTANTE: Siga os passos manuais:
echo.
echo       1. Pressione Ctrl + Shift + N (aba anônima)
echo       2. Acesse: http://localhost:8080
echo       3. Pressione F12 (DevTools)
echo       4. Vá em Application ^> Storage
echo       5. Clique "Clear site data"
echo       6. Recarregue: Ctrl + Shift + R
echo.

REM Abrir navegador normal primeiro
start http://localhost:8080

echo.
echo ========================================
echo  ✨ LIMPEZA CONCLUÍDA!
echo ========================================
echo.
echo 📋 PRÓXIMOS PASSOS MANUAIS:
echo.
echo    1. Abra: chrome://extensions
echo    2. DESABILITE extensões do Steam
echo    3. Abra aba anônima (Ctrl + Shift + N)
echo    4. Acesse: http://localhost:8080/collections
echo    5. Pressione F12 ^> Application ^> Clear site data
echo.
echo ========================================
echo.
pause
