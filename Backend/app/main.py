from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.instructor_student import router as instructor_router
from app.routers.admin import router as admin_router

from app.routers.auth import router as auth_router
from app.routers.course import router as course_router

from app.middleware.logger import LoggingMiddleware
from app.middleware.rate_limit import RateLimitMiddleware

from app.database import Base, engine

# Import all models so SQLAlchemy knows about them
from app.models.user import User
from app.models.instructor_student import InstructorStudent

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Sign Language Platform API",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(LoggingMiddleware)
app.add_middleware(RateLimitMiddleware)

app.include_router(auth_router)
app.include_router(course_router)
app.include_router(instructor_router)
app.include_router(admin_router)


@app.get("/")
def home():
    return {"message": "Welcome to AI Sign Language Platform"}


@app.get("/health")
def health():
    return {"status": "Healthy"}