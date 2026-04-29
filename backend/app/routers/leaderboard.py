import uuid
from fastapi import APIRouter, status, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List
from ..models import LeaderboardEntry, ScoreSubmission
from ..db_models import LeaderboardDB
from ..database import get_db

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])

@router.get("", response_model=List[LeaderboardEntry])
def get_leaderboard(db: Session = Depends(get_db)):
    entries = db.query(LeaderboardDB).order_by(desc(LeaderboardDB.score)).all()
    return [LeaderboardEntry(
        id=entry.id,
        username=entry.username,
        score=entry.score,
        mode=entry.mode
    ) for entry in entries]

@router.post("", response_model=LeaderboardEntry, status_code=201)
def submit_score(submission: ScoreSubmission, db: Session = Depends(get_db)):
    entry_id = f"l-{uuid.uuid4().hex[:8]}"
    username = submission.username or "Guest Snake"
    
    new_entry = LeaderboardDB(
        id=entry_id,
        username=username,
        score=submission.score,
        mode=submission.mode.value
    )
    
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    
    return LeaderboardEntry(
        id=new_entry.id,
        username=new_entry.username,
        score=new_entry.score,
        mode=new_entry.mode
    )
