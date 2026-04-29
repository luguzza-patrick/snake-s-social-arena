def test_get_live_players(client):
    response = client.get("/api/live-players")
    assert response.status_code == 200
    assert len(response.json()) == 2 # Initial mock data
    assert response.json()[0]["username"] == "NeonNoodle"
    assert "state" in response.json()[0]
