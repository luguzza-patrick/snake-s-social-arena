from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from ..models import SpectatedPlayer, SnakeState
from ..db_models import LivePlayerDB
from ..database import get_db

router = APIRouter(prefix="/live-players", tags=["live-players"])

@router.get("", response_model=List[SpectatedPlayer])
def get_live_players(db: Session = Depends(get_db)):
    players = db.query(LivePlayerDB).all()
    return [SpectatedPlayer(
        id=player.id,
        username=player.username,
        mode=player.mode,
        state=SnakeState(**player.state)
    ) for player in players]
