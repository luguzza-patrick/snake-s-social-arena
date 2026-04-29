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

