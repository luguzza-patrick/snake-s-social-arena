import hashlib
import uuid
from typing import Dict, List, Optional
from .models import LeaderboardEntry, User, SnakeMode, SnakeStatus, Direction

# In-memory data storage
# users: username -> {id, username, password_hash}
users: Dict[str, dict] = {}
# sessions: session_token -> username
sessions: Dict[str, str] = {}
# leaderboard: list of LeaderboardEntry
leaderboard: List[dict] = [
    {"id": "l-1", "username": "NeonNoodle", "score": 420, "mode": "walls"},
    {"id": "l-2", "username": "SlitherStar", "score": 350, "mode": "pass-through"},
    {"id": "l-3", "username": "PixelPioneer", "score": 850, "mode": "walls"},
    {"id": "l-4", "username": "SnakeCharmer", "score": 620, "mode": "pass-through"},
    {"id": "l-5", "username": "PythonPro", "score": 150, "mode": "walls"},
]
# live_players: list of SpectatedPlayer
live_players: List[dict] = [
    {
        "id": "s-1",
        "username": "NeonNoodle",
        "mode": "walls",
        "state": {
            "gridSize": 18,
            "snake": [{"x": 5, "y": 5}, {"x": 4, "y": 5}, {"x": 3, "y": 5}],
            "food": {"x": 10, "y": 10},
            "direction": "right",
            "nextDirection": "right",
            "score": 120,
            "mode": "walls",
            "status": "playing"
        }
    },
    {
        "id": "s-2",
        "username": "SnakeCharmer",
        "mode": "pass-through",
        "state": {
            "gridSize": 18,
            "snake": [{"x": 10, "y": 10}, {"x": 10, "y": 11}],
            "food": {"x": 2, "y": 2},
            "direction": "up",
            "nextDirection": "up",
            "score": 45,
            "mode": "pass-through",
            "status": "game-over"
        }
    }
]

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def reset_db():
    global users, sessions, leaderboard, live_players
    users.clear()
    sessions.clear()
    leaderboard[:] = [
        {"id": "l-1", "username": "NeonNoodle", "score": 420, "mode": "walls"},
        {"id": "l-2", "username": "SlitherStar", "score": 350, "mode": "pass-through"},
        {"id": "l-3", "username": "PixelPioneer", "score": 850, "mode": "walls"},
        {"id": "l-4", "username": "SnakeCharmer", "score": 620, "mode": "pass-through"},
        {"id": "l-5", "username": "PythonPro", "score": 150, "mode": "walls"},
    ]
    live_players[:] = [
        {
            "id": "s-1",
            "username": "NeonNoodle",
            "mode": "walls",
            "state": {
                "gridSize": 18,
                "snake": [{"x": 5, "y": 5}, {"x": 4, "y": 5}, {"x": 3, "y": 5}],
                "food": {"x": 10, "y": 10},
                "direction": "right",
                "nextDirection": "right",
                "score": 120,
                "mode": "walls",
                "status": "playing"
            }
        },
        {
            "id": "s-2",
            "username": "SnakeCharmer",
            "mode": "pass-through",
            "state": {
                "gridSize": 18,
                "snake": [{"x": 10, "y": 10}, {"x": 10, "y": 11}],
                "food": {"x": 2, "y": 2},
                "direction": "up",
                "nextDirection": "up",
                "score": 45,
                "mode": "pass-through",
                "status": "game-over"
            }
        }
    ]
