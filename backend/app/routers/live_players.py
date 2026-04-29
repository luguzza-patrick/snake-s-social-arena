from fastapi import APIRouter
from typing import List
from ..models import SpectatedPlayer
from .. import database

router = APIRouter(prefix="/live-players", tags=["live-players"])

@router.get("", response_model=List[SpectatedPlayer])
async def get_live_players():
    return [SpectatedPlayer(**player) for player in database.live_players]
