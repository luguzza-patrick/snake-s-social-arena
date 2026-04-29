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
        }
    ]
