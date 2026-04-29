# Snake Social Arena - Backend

This is the FastAPI backend for the Snake Social Arena.

## Setup

Ensure you have `uv` installed, then sync the dependencies:

```bash
uv sync
```

## Running the Server

Start the development server with auto-reload:

```bash
uv run python main.py
```

The server will be available at `http://localhost:3000`.
- **Swagger UI**: [http://localhost:3000/docs](http://localhost:3000/docs)

## Running Tests

Run the full test suite using `pytest`:

```bash
PYTHONPATH=. uv run pytest tests/ -v
```
