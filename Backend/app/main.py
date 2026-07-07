from fastapi import FastAPI

app = FastAPI(
    title="AI-Powered Sign Language Learning & Assessment Platform",
    version="1.0.0"
)

@app.get("/")
def root():
    return {
        "message": "Backend API is running successfully!"
    }

@app.get("/health")
def health():
    return {
        "status": "healthy"
    }