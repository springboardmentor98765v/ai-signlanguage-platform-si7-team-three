from fastapi import FastAPI

app = FastAPI(
    title="AI Sign Language Platform API",
    version="1.0.0"
)

@app.get("/")
def home():
    return {"message": "Welcome to AI Sign Language Platform"}

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service":"Backend API",
        "version": "1.0.0"
    }    