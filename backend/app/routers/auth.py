import uuid
from fastapi import APIRouter, HTTPException, Response, Cookie, Depends, status
from typing import Optional
from ..models import User, Credentials
from .. import database

router = APIRouter(prefix="/auth", tags=["auth"])

def get_current_user(session_token: Optional[str] = Cookie(None)):
    if not session_token or session_token not in database.sessions:
        raise HTTPException(status_code=401, detail="Not authenticated")
    username = database.sessions[session_token]
    user_data = database.users[username]
    return User(id=user_data["id"], username=user_data["username"])

@router.get("/session", response_model=User)
async def get_session(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/login", response_model=User)
async def login(credentials: Credentials, response: Response):
    if credentials.username not in database.users:
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    
    user_data = database.users[credentials.username]
    if user_data["password_hash"] != database.hash_password(credentials.password):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    
    session_token = str(uuid.uuid4())
    database.sessions[session_token] = credentials.username
    response.set_cookie(key="session_token", value=session_token, httponly=True)
    
    return User(id=user_data["id"], username=user_data["username"])

@router.post("/signup", response_model=User, status_code=201)
async def signup(credentials: Credentials, response: Response):
    if credentials.username in database.users:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    user_id = f"u-{credentials.username}"
    database.users[credentials.username] = {
        "id": user_id,
        "username": credentials.username,
        "password_hash": database.hash_password(credentials.password)
    }
    
    session_token = str(uuid.uuid4())
    database.sessions[session_token] = credentials.username
    response.set_cookie(key="session_token", value=session_token, httponly=True)
    
    return User(id=user_id, username=credentials.username)

@router.post("/logout")
async def logout(response: Response, session_token: Optional[str] = Cookie(None)):
    if session_token and session_token in database.sessions:
        del database.sessions[session_token]
    response.delete_cookie(key="session_token")
    return {"success": True}
