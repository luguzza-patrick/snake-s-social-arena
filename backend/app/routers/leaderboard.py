import uuid
from fastapi import APIRouter, status
from typing import List
from ..models import LeaderboardEntry, ScoreSubmission
from .. import database

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])

@router.get("", response_model=List[LeaderboardEntry])
async def get_leaderboard():
    # Sort by score descending
    sorted_leaderboard = sorted(database.leaderboard, key=lambda x: x["score"], reverse=True)
    return [LeaderboardEntry(**entry) for entry in sorted_leaderboard]

@router.post("", response_model=LeaderboardEntry, status_code=201)
async def submit_score(submission: ScoreSubmission):
    entry_id = f"l-{uuid.uuid4().hex[:8]}"
    username = submission.username or "Guest Snake"
    
    new_entry = {
        "id": entry_id,
        "username": username,
        "score": submission.score,
        "mode": submission.mode.value
    }
    
    database.leaderboard.append(new_entry)
    return LeaderboardEntry(**new_entry)
