import pytest
from fastapi.testclient import TestClient
from app.main import app
from app import database

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture(autouse=True)
def run_before_and_after_tests():
    # Setup: Reset DB before each test
    database.reset_db()
    yield
    # Teardown: (if needed)
