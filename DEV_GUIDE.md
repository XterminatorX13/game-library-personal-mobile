# GameVault - Dev Environment

## Running the app

### Option 1: Single command (recommended)
```bash
bun run dev:full
```
This runs both Vite (port 8080) and FastAPI HLTB proxy (port 3001) together.

### Option 2: Separate terminals
**Terminal 1 - Frontend:**
```bash
bun run dev
```

**Terminal 2 - HLTB API:**
```bash
cd "../HTLB API"
uvicorn hltb_api:app --reload --port 3001
```

## Available Scripts

- `bun run dev:full` - Run frontend + HLTB API together
- `bun run dev` - Run frontend only (Vite on port 8080)
- `bun run dev:api` - Run HLTB API only (FastAPI on port 3001)
- `bun run build` - Build for production
- `bun run preview` - Preview production build
