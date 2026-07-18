"""
main.py - Application entrypoint.

Wires together every layer described in the PDF architecture into one
FastAPI app: Auth -> Users -> Courses -> Practice/Assessment/Feedback ->
Analytics -> Certificates. This is PDF Outcome 7: "a complete
end-to-end platform ... Users will be able to move seamlessly from
registration to learning, practice, assessment, feedback, and
certification within one platform."
"""

import logging
import time

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator

from app.database import init_db
from app.routers import auth_router, users_router, courses_router, practice_router, analytics_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
)
logger = logging.getLogger("sign_language_platform")

app = FastAPI(
    title="AI-Powered Sign Language Learning & Assessment Platform",
    description="Backend API implementing all 7 project outcomes from the platform spec.",
    version="1.0.0",
)

# Frontend runs on a different origin during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten this to specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    """
    Minimal API Gateway-style request logging (PDF Step 3: "Logging -
    Records user activities for monitoring"). A real deployment would
    ship these logs to Prometheus/Grafana per the Infrastructure Layer.
    """
    start = time.time()
    response = await call_next(request)
    duration_ms = round((time.time() - start) * 1000, 2)
    logger.info(f"{request.method} {request.url.path} -> {response.status_code} ({duration_ms}ms)")
    return response


@app.on_event("startup")
def on_startup():
    init_db()
    logger.info("Database initialized. Sign Language Platform API is starting up.")


@app.get("/health", tags=["System"])
def health_check():
    """Used by Docker/Kubernetes/monitoring to verify the service is alive."""
    return {"status": "ok"}


# PDF Infrastructure Layer: "Monitoring & Logging (Prometheus / Grafana)".
# Exposes request counts, latencies, and status codes at GET /metrics in
# Prometheus's scrape format. See prometheus.yml + docker-compose.yml for
# the full stack (Prometheus scraping this endpoint, Grafana visualizing it).
Instrumentator().instrument(app).expose(app, endpoint="/metrics", tags=["System"])


app.include_router(auth_router.router)
app.include_router(users_router.router)
app.include_router(courses_router.router)
app.include_router(practice_router.router)
app.include_router(analytics_router.router)
