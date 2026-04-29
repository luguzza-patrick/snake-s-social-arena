def test_get_leaderboard(client):
    response = client.get("/api/leaderboard")
    assert response.status_code == 200
    assert len(response.json()) == 5 # Initial mock data

def test_submit_score(client):
    response = client.post("/api/leaderboard", json={"score": 500, "mode": "walls", "username": "testuser"})
    assert response.status_code == 201
    assert response.json()["score"] == 500
    assert "id" in response.json()

def test_get_leaderboard_sorted(client):
    # Initial: 850, 620, 420, 350, 150
    client.post("/api/leaderboard", json={"score": 100, "mode": "walls", "username": "user1"})
    client.post("/api/leaderboard", json={"score": 900, "mode": "walls", "username": "user2"})
    
    response = client.get("/api/leaderboard")
    data = response.json()
    assert data[0]["score"] == 900
    assert data[1]["score"] == 850 # From mock data

def test_submit_invalid_mode(client):
    response = client.post("/api/leaderboard", json={"score": 500, "mode": "invalid_mode", "username": "testuser"})
    assert response.status_code == 422
