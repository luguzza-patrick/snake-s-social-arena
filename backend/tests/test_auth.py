def test_signup_success(client):
    response = client.post("/api/auth/signup", json={"username": "newuser", "password": "password123"})
    assert response.status_code == 201
    assert response.json()["username"] == "newuser"
    assert "id" in response.json()
    assert "session_token" in response.cookies

def test_signup_duplicate(client):
    client.post("/api/auth/signup", json={"username": "testuser", "password": "password123"})
    response = client.post("/api/auth/signup", json={"username": "testuser", "password": "password123"})
    assert response.status_code == 400

def test_signup_short_password(client):
    response = client.post("/api/auth/signup", json={"username": "testuser", "password": "12"})
    assert response.status_code == 422

def test_login_success(client):
    client.post("/api/auth/signup", json={"username": "testuser", "password": "password123"})
    response = client.post("/api/auth/login", json={"username": "testuser", "password": "password123"})
    assert response.status_code == 200
    assert response.json()["username"] == "testuser"
    assert "session_token" in response.cookies

def test_login_wrong_password(client):
    client.post("/api/auth/signup", json={"username": "testuser", "password": "password123"})
    response = client.post("/api/auth/login", json={"username": "testuser", "password": "wrongpassword"})
    assert response.status_code == 401

def test_login_nonexistent_user(client):
    response = client.post("/api/auth/login", json={"username": "ghost", "password": "password123"})
    assert response.status_code == 401

def test_get_session_authenticated(client):
    client.post("/api/auth/signup", json={"username": "testuser", "password": "password123"})
    response = client.get("/api/auth/session")
    assert response.status_code == 200
    assert response.json()["username"] == "testuser"

def test_get_session_unauthenticated(client):
    response = client.get("/api/auth/session")
    assert response.status_code == 401

def test_logout(client):
    client.post("/api/auth/signup", json={"username": "testuser", "password": "password123"})
    response = client.post("/api/auth/logout")
    assert response.status_code == 200
    
    # Verify session is gone
    session_response = client.get("/api/auth/session")
    assert session_response.status_code == 401
