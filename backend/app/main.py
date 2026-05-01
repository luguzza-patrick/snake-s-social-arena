import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from .routers import auth, leaderboard, live_players

app = FastAPI(
    title="Snake Social Arena API",
    description="Backend API for the real-time multiplayer Snake game platform.",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://127.0.0.1:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers with /api prefix
app.include_router(auth.router, prefix="/api")
app.include_router(leaderboard.router, prefix="/api")
app.include_router(live_players.router, prefix="/api")

# Serve static files
# Check if the static directory exists (it will be created during Docker build)
static_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static")

@app.get("/api")
async def api_root():
    return {"message": "Welcome to Snake Social Arena API", "docs": "/api/docs"}

# Serve assets (JS, CSS, images)
if os.path.exists(os.path.join(static_dir, "assets")):
    app.mount("/assets", StaticFiles(directory=os.path.join(static_dir, "assets")), name="assets")

# Catch-all route for SPA
@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    # If the path starts with api, don't serve index.html (should have been handled by routers)
    if full_path.startswith("api"):
        return {"error": "Not Found"}
    
    index_path = os.path.join(static_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    
    return {"message": "Welcome to Snake Social Arena API", "docs": "/api/docs"}
