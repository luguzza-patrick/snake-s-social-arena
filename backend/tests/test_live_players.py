def test_get_live_players_empty(client):
    response = client.get("/api/live-players")
    assert response.status_code == 200
    assert len(response.json()) == 0
