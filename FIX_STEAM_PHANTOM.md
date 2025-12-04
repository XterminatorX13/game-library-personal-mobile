# 🛠️ ELIMINAR PÁGINA FANTASMA DA STEAM - GUIA DEFINITIVO

## 🔍 Diagnóstico
Você está vendo requisições para: `https://steamloopback.host/library.js`

**Causa:** O Steam Client está injetando scripts no navegador via:
- Extensão do Steam no Chrome
- Steam Overlay ativo
- Cache persistente do navegador

---

## ✅ SOLUÇÃO DEFINITIVA - Siga TODOS os passos:

### 1️⃣ **Fechar TUDO relacionado ao Steam**
```powershell
# No PowerShell, execute:
Get-Process -Name "steam*" | Stop-Process -Force
```

### 2️⃣ **Limpar Extensões do Chrome/Edge**
1. Abra: `chrome://extensions` (ou `edge://extensions`)
2. Procure por **"Steam"** ou **"Enhanced Steam"**
3. **DESABILITE ou REMOVA** todas extensões relacionadas ao Steam

### 3️⃣ **Limpar Cache COMPLETO do Navegador**
**Chrome/Edge:**
1. Pressione: `Ctrl + Shift + Delete`
2. Selecione: **"Todo o período"** (não apenas 24h)
3. Marque TUDO:
   - ☑️ Histórico de navegação
   - ☑️ Cookies e outros dados de sites
   - ☑️ Imagens e arquivos em cache
4. Clique: **"Limpar dados"**

### 4️⃣ **Limpar Storage do Site (DevTools)**
1. Abra: `http://localhost:8080`
2. Pressione: `F12` (DevTools)
3. Vá em: **Application** → **Storage**
4. Clique: **"Clear site data"**
5. Confirme: **"Clear all"**

### 5️⃣ **Desabilitar Steam Overlay**
1. Abra o **Steam Client**
2. Vá em: **Steam** → **Settings** → **In-Game**
3. **DESMARQUE**: ☐ "Enable the Steam Overlay while in-game"

### 6️⃣ **Hard Reload do Navegador**
Pressione: `Ctrl + Shift + R` (ou `Cmd + Shift + R` no Mac)

---

## 🧪 TESTAR
1. Feche completamente o navegador
2. Execute: `npm run dev`
3. Execute: `.\open-browser.ps1`
4. Vá para: `http://localhost:8080/collections`

---

## 🔒 Proteções Adicionadas

### CSP (Content Security Policy)
O `index.html` agora bloqueia:
- ❌ Scripts de `steamloopback.host`
- ❌ Injeções externas não autorizadas
- ✅ Permite apenas: RAWG API, SteamGridDB

### Anti-Redirect
Se algum script tentar redirecionar para `steamloopback.host`, será bloqueado e redirecionado de volta para `localhost:8080`.

---

## ❓ Ainda vendo a página da Steam?

Execute este teste no Console do DevTools (F12):
```javascript
console.log(window.location.href);
console.log(document.querySelectorAll('script[src*="steam"]'));
```

Se ainda aparecer algo relacionado ao Steam, **feche o navegador completamente** e:
1. Abra uma **aba anônima** (Ctrl + Shift + N)
2. Acesse: `http://localhost:8080/collections`

---

## 📝 Prevenção Futura

**NUNCA**:
- ❌ Teste localhost com Steam Client aberto
- ❌ Use extensões do Steam no navegador de desenvolvimento

**SEMPRE**:
- ✅ Use aba anônima para desenvolvimento
- ✅ Mantenha Steam Overlay desabilitado durante dev
- ✅ Use diferentes perfis do Chrome para trabalho/games

---

## 🎯 Se NADA funcionar:

**Opção Nuclear:**
1. Crie um novo perfil no Chrome:
   - `chrome://settings/manageProfile`
   - "Add new profile"
   - Nome: "Dev - Game Library"
2. Use APENAS este perfil para desenvolvimento
3. **NUNCA** instale extensões do Steam neste perfil
