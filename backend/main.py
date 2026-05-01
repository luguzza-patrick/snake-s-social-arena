import uvicorn

if __name__ == "__main__":
    import os
    port = int(os.getenv("PORT", 3000))
    # In production, reload should be False
    reload = os.getenv("ENV", "development") == "development"
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=reload)
