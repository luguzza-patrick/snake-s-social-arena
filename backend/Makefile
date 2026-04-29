.PHONY: run sync test format help

help:
	@echo "Available commands:"
	@echo "  make run    - Start the FastAPI development server on port 3000"
	@echo "  make sync   - Sync dependencies using uv"
	@echo "  make test   - Run tests with pytest"

run:
	uv run python main.py

sync:
	uv sync

test:
	PYTHONPATH=. uv run pytest tests/ tests_integration/ -v
