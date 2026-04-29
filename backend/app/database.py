import os
import hashlib
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .db_models import Base, UserDB, SessionDB, LeaderboardDB, LivePlayerDB

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./sql_app.db")

if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL)

Base.metadata.create_all(bind=engine)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def reset_db():
    # Only for testing purposes
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Initial Leaderboard Data
        leaderboard_data = [
            {"id": "l-1", "username": "NeonNoodle", "score": 420, "mode": "walls"},
            {"id": "l-2", "username": "SlitherStar", "score": 350, "mode": "pass-through"},
            {"id": "l-3", "username": "PixelPioneer", "score": 850, "mode": "walls"},
            {"id": "l-4", "username": "SnakeCharmer", "score": 620, "mode": "pass-through"},
            {"id": "l-5", "username": "PythonPro", "score": 150, "mode": "walls"},
        ]
        for entry in leaderboard_data:
            db.add(LeaderboardDB(**entry))
            
        # Initial Live Players Data
        live_players_data = [
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
        for entry in live_players_data:
            db.add(LivePlayerDB(**entry))
            
        db.commit()
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()
