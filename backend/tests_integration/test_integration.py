import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db_models import Base
from app.database import engine

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_database():
    # Setup test database (SQLite)
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    # Cleanup after tests
    Base.metadata.drop_all(bind=engine)

def test_full_user_and_game_flow():
    # 1. Sign up a new user
    signup_data = {
        "username": "IntegrationSnake",
        "password": "securepassword123"
    }
    response = client.post("/api/auth/signup", json=signup_data)
    assert response.status_code == 201
    assert response.json()["username"] == "IntegrationSnake"
    
    # 2. Get current session to verify cookie
    response = client.get("/api/auth/session")
    assert response.status_code == 200
    assert response.json()["username"] == "IntegrationSnake"
    
    # 3. Log out
    response = client.post("/api/auth/logout")
    assert response.status_code == 200
    
    # 4. Verify session is gone
    response = client.get("/api/auth/session")
    assert response.status_code == 401
    
    # 5. Log back in
    response = client.post("/api/auth/login", json=signup_data)
    assert response.status_code == 200
    
    # 6. Submit a leaderboard score
    score_data = {
        "score": 1500,
        "mode": "walls",
        "username": "IntegrationSnake"
    }
    response = client.post("/api/leaderboard", json=score_data)
    assert response.status_code == 201
    assert response.json()["score"] == 1500
    
    # 7. Retrieve the leaderboard
    response = client.get("/api/leaderboard")
    assert response.status_code == 200
    scores = response.json()
    assert len(scores) == 1
    assert scores[0]["username"] == "IntegrationSnake"
    assert scores[0]["score"] == 1500
    
    # 8. Get live players (should be empty initially)
    response = client.get("/api/live-players")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
