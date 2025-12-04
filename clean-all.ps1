# 🧹 Script de Limpeza Total - Game Library

Write-Host "🧹 Iniciando limpeza completa..." -ForegroundColor Cyan

# 1. Parar servidor se estiver rodando
Write-Host "`n1️⃣ Verificando processos Node..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "   Parando processos Node..." -ForegroundColor Gray
    Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

# 2. Deletar pasta dist
Write-Host "`n2️⃣ Removendo pasta dist..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Path "dist" -Recurse -Force
    Write-Host "   ✅ Pasta dist removida" -ForegroundColor Green
}

# 3. Deletar cache do Vite
Write-Host "`n3️⃣ Removendo cache do Vite..." -ForegroundColor Yellow
if (Test-Path "node_modules/.vite") {
    Remove-Item -Path "node_modules/.vite" -Recurse -Force
    Write-Host "   ✅ Cache do Vite removido" -ForegroundColor Green
}

# 4. Deletar .vite (se existir na raiz)
if (Test-Path ".vite") {
    Remove-Item -Path ".vite" -Recurse -Force
    Write-Host "   ✅ .vite removido" -ForegroundColor Green
}

# 5. Limpar package-lock se necessário
Write-Host "`n4️⃣ Verificando package-lock.json..." -ForegroundColor Yellow
if (Test-Path "package-lock.json") {
    Write-Host "   ℹ️  Package-lock existe (mantendo)" -ForegroundColor Gray
}

Write-Host "`n✨ Limpeza completa finalizada!`n" -ForegroundColor Green
Write-Host "📋 PRÓXIMOS PASSOS MANUAIS:" -ForegroundColor Cyan
Write-Host "   1. No navegador, pressione: Ctrl + Shift + Delete" -ForegroundColor White
Write-Host "   2. Selecione: 'Últimas 24 horas'" -ForegroundColor White
Write-Host "   3. Marque: 'Cookies' e 'Cache'" -ForegroundColor White
Write-Host "   4. Clique: 'Limpar dados'" -ForegroundColor White
Write-Host "`n   5. Abra DevTools (F12) > Application > Storage" -ForegroundColor White
Write-Host "   6. Clique: 'Clear site data'" -ForegroundColor White
Write-Host "`n   7. Execute: npm run dev" -ForegroundColor White
Write-Host "`n🔥 Isso deve eliminar a página fantasma da Steam!`n" -ForegroundColor Yellow
