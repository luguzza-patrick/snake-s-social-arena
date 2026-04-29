from sqlalchemy import Column, Integer, String, JSON
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class UserDB(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)

class SessionDB(Base):
    __tablename__ = "sessions"
    
    token = Column(String, primary_key=True, index=True)
    username = Column(String, index=True, nullable=False)

class LeaderboardDB(Base):
    __tablename__ = "leaderboard"
    
    id = Column(String, primary_key=True, index=True)
    username = Column(String, index=True, nullable=False)
    score = Column(Integer, nullable=False)
    mode = Column(String, nullable=False)

class LivePlayerDB(Base):
    __tablename__ = "live_players"
    
    id = Column(String, primary_key=True, index=True)
    username = Column(String, index=True, nullable=False)
    mode = Column(String, nullable=False)
    state = Column(JSON, nullable=False)
