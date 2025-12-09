# 🚀 Atualizar Deploy Vercel

## Opção 1: Reconectar ao Novo Repositório (Recomendado)

### No Vercel Dashboard:
1. Vá em **Settings** (já está lá ✅)
2. Role até **Git**
3. Clique em **Disconnect** (desconectar do repo antigo)
4. Clique em **Connect Git Repository**
5. Selecione: `XterminatorX13/game-library-personal-mobile`
6. Branch: `main`
7. Clique em **Deploy**

---

## Opção 2: Novo Deploy (Mais Simples)

### Criar novo projeto:
1. Vá para: https://vercel.com/new
2. Selecione: `XterminatorX13/game-library-personal-mobile`
3. **Project Name:** `game-library-personal-mobile`
4. **Framework Preset:** Vite
5. **Build Command:** `npm run build`
6. **Output Directory:** `dist`
7. Clique em **Deploy**

### Depois:
- Delete o projeto antigo `game-library-personal` (se quiser)
- Ou mantenha os dois

---

## Configurações do Projeto:

```
Framework: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
Node Version: 18.x
```

---

## Após Deploy:

1. ✅ Acesse a URL do Vercel
2. ✅ Teste Collections (`/collections`)
3. ✅ Teste navegação desktop
4. ✅ Teste mobile (bottom nav)
5. ✅ Teste i18n (trocar idioma no código)

---

## Próximos Passos:

Depois do deploy, continuamos com:
- Mobile optimization Phase 1
- Resolver flickering em tablet
- Bottom sheet para filtros
- Safe area support
