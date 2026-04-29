import uuid
from fastapi import APIRouter, HTTPException, Response, Cookie, Depends, status
from sqlalchemy.orm import Session
from typing import Optional
from ..models import User, Credentials
from ..db_models import UserDB, SessionDB
from ..database import get_db, hash_password

router = APIRouter(prefix="/auth", tags=["auth"])

def get_current_user(session_token: Optional[str] = Cookie(None), db: Session = Depends(get_db)):
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
        
    session = db.query(SessionDB).filter(SessionDB.token == session_token).first()
    if not session:
        raise HTTPException(status_code=401, detail="Not authenticated")
        
    user_data = db.query(UserDB).filter(UserDB.username == session.username).first()
    if not user_data:
        raise HTTPException(status_code=401, detail="Not authenticated")
        
    return User(id=user_data.id, username=user_data.username)

@router.get("/session", response_model=User)
def get_session(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/login", response_model=User)
def login(credentials: Credentials, response: Response, db: Session = Depends(get_db)):
    user_data = db.query(UserDB).filter(UserDB.username == credentials.username).first()
    
    if not user_data or user_data.password_hash != hash_password(credentials.password):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    
    session_token = str(uuid.uuid4())
    new_session = SessionDB(token=session_token, username=credentials.username)
    db.add(new_session)
    db.commit()
    
    response.set_cookie(key="session_token", value=session_token, httponly=True)
    
    return User(id=user_data.id, username=user_data.username)

@router.post("/signup", response_model=User, status_code=201)
def signup(credentials: Credentials, response: Response, db: Session = Depends(get_db)):
    existing_user = db.query(UserDB).filter(UserDB.username == credentials.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    user_id = f"u-{credentials.username}"
    new_user = UserDB(
        id=user_id,
        username=credentials.username,
        password_hash=hash_password(credentials.password)
    )
    db.add(new_user)
    
    session_token = str(uuid.uuid4())
    new_session = SessionDB(token=session_token, username=credentials.username)
    db.add(new_session)
    
    db.commit()
    
    response.set_cookie(key="session_token", value=session_token, httponly=True)
    
    return User(id=user_id, username=credentials.username)

@router.post("/logout")
def logout(response: Response, session_token: Optional[str] = Cookie(None), db: Session = Depends(get_db)):
    if session_token:
        session = db.query(SessionDB).filter(SessionDB.token == session_token).first()
        if session:
            db.delete(session)
            db.commit()
    
    response.delete_cookie(key="session_token")
    return {"success": True}
