import uvicorn

if __name__ == "__main__":
    # In production, you might want to use host="0.0.0.0"
    uvicorn.run("app.main:app", host="0.0.0.0", port=3000, reload=True)
