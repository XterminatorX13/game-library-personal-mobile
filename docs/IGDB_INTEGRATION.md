"""
IGDB Integration Service
Requires Twitch API credentials (free)

1. Create app: https://dev.twitch.tv/console/apps
2. Get Client ID & Client Secret
3. Add to .env:
   VITE_TWITCH_CLIENT_ID=your_client_id
   VITE_TWITCH_SECRET=your_secret
"""

# NOTA: IGDB exige backend - não funciona direto do browser
# Opções:
# 1. Adicionar ao FastAPI atual (hltb_api.py)
# 2. Criar Vercel Serverless Function
# 3. Supabase Edge Function

# Código de exemplo para FastAPI:
"""
@app.get("/api/igdb")
async def search_igdb(game: str = Query(...)):
    # 1. Get OAuth token
    token_response = await client.post(
        "https://id.twitch.tv/oauth2/token",
        data={
            "client_id": TWITCH_CLIENT_ID,
            "client_secret": TWITCH_CLIENT_SECRET,
            "grant_type": "client_credentials"
        }
    )
    access_token = token_response.json()["access_token"]
    
    # 2. Query IGDB
    response = await client.post(
        "https://api.igdb.com/v4/games",
        headers={
            "Client-ID": TWITCH_CLIENT_ID,
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/json"
        },
        data=f'search "{game}"; fields name,summary,aggregated_rating,genres.name;'
    )
    
    return response.json()
"""
