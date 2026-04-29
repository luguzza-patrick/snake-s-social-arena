from typing import List, Optional
from pydantic import BaseModel, Field
from enum import Enum

class User(BaseModel):
    id: str = Field(..., json_schema_extra={"example": "u-pixel"})
    username: str = Field(..., json_schema_extra={"example": "pixel"})

class Credentials(BaseModel):
    username: str = Field(..., json_schema_extra={"example": "pixel"})
    password: str = Field(..., min_length=3)

class SnakeMode(str, Enum):
    PASS_THROUGH = "pass-through"
    WALLS = "walls"

class Direction(str, Enum):
    UP = "up"
    DOWN = "down"
    LEFT = "left"
    RIGHT = "right"

class Point(BaseModel):
    x: int = Field(..., json_schema_extra={"example": 5})
    y: int = Field(..., json_schema_extra={"example": 5})

class SnakeStatus(str, Enum):
    READY = "ready"
    PLAYING = "playing"
    PAUSED = "paused"
    GAME_OVER = "game-over"

class SnakeState(BaseModel):
    gridSize: int = Field(..., json_schema_extra={"example": 18})
    snake: List[Point]
    food: Point
    direction: Direction
    nextDirection: Direction
    score: int = Field(..., json_schema_extra={"example": 120})
    mode: SnakeMode
    status: SnakeStatus

class LeaderboardEntry(BaseModel):
    id: str = Field(..., json_schema_extra={"example": "l-1"})
    username: str = Field(..., json_schema_extra={"example": "NeonNoodle"})
    score: int = Field(..., json_schema_extra={"example": 420})
    mode: SnakeMode

class SpectatedPlayer(BaseModel):
    id: str = Field(..., json_schema_extra={"example": "s-1"})
    username: str = Field(..., json_schema_extra={"example": "NeonNoodle"})
    mode: SnakeMode
    state: SnakeState

class ScoreSubmission(BaseModel):
    score: int = Field(..., ge=0)
    mode: SnakeMode
    username: Optional[str] = None
