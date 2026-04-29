from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, leaderboard, live_players

app = FastAPI(
    title="Snake Social Arena API",
    description="Backend API for the real-time multiplayer Snake game platform.",
    version="1.0.0"
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

@app.get("/")
async def root():
    return {"message": "Welcome to Snake Social Arena API", "docs": "/docs"}
