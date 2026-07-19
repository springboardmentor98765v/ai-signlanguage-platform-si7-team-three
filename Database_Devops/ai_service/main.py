"""
Standalone AI Prediction microservice.

Per SRS Day 6 (Intern 3's task): "Wrap the detection + feature-extraction +
prediction pipeline as a callable service (FastAPI endpoint) that accepts a
frame/image and returns {predicted_sign, confidence} JSON."

This is a SEPARATE, independently deployable FastAPI app from the main
backend - its own container, its own port - matching the SRS's intended
microservice architecture (API Gateway -> ... -> AI/ML Prediction Layer as
its own service).

CURRENT STATE: reuses the same placeholder heuristic classifier from
app/services/ai_prediction.py (not a real trained model yet - see that
file's docstring). Once Intern 3 has a real model, its logic should live
here, in this standalone service - the main backend would then call this
service over HTTP instead of importing the function directly in-process.

Run standalone:
    uvicorn ai_service.main:app --reload --port 8001

Run via Docker:
    docker build -f Dockerfile.ai -t slp-ai-service .
    docker run -p 8001:8001 slp-ai-service
"""

import sys
from pathlib import Path

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

# Reuse the existing prediction logic rather than duplicating it.
# Once a real model exists, replace this import with the real implementation
# living directly in this service.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from app.services import ai_prediction  # noqa: E402

app = FastAPI(
    title="Sign Language AI Prediction Service",
    description="Standalone microservice: takes hand landmarks, returns a predicted sign + confidence.",
    version="1.0.0",
)


class LandmarksRequest(BaseModel):
    landmarks: list[list[float]] = Field(
        ..., description="21 MediaPipe hand landmarks, each [x, y, z] or [x, y]."
    )


class PredictionResponse(BaseModel):
    predicted_sign: str
    confidence: float


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "ai-prediction"}


@app.post("/predict", response_model=PredictionResponse)
def predict(payload: LandmarksRequest):
    try:
        result = ai_prediction.predict(payload.landmarks)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    return PredictionResponse(predicted_sign=result.predicted_sign, confidence=result.confidence)
