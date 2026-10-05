from fastapi import Depends, FastAPI
from sqlalchemy import text
from sqlalchemy.orm import Session

from .database import Base, engine, get_db
from .models import User, Category, Location, Issue, IssueUpdate

from .routers.auth import router as auth_router
from .routers.issues import router as issues_router
from .routers.maintenance import router as maintenance_router
from .routers.admin import router as admin_router
from .routers.faculty import router as faculty_router

from .services.auth import get_current_user


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Campus Fix API",
    description="Smart Campus Issue Reporting and Resolution Management System",
    version="1.0.0",
)


# =========================
# Routers
# =========================

app.include_router(auth_router)
app.include_router(issues_router)
app.include_router(maintenance_router)
app.include_router(admin_router)
app.include_router(faculty_router)


# =========================
# Basic routes
# =========================

@app.get("/")
def home():
    return {
        "message": "Campus Fix FastAPI is running!"
    }


@app.get("/test-db")
def test_db():
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))

        return {
            "database": result.scalar()
        }


@app.get("/test-auth")
def test_auth(current_user: User = Depends(get_current_user)):
    return {
        "message": "Authentication successful",
        "user_id": current_user.id,
        "username": current_user.username,
        "role": current_user.role,
    }


# =========================
# Seed data
# =========================

@app.post("/seed-data")
def seed_data(db: Session = Depends(get_db)):
    categories = [
        "Electrical",
        "Plumbing",
        "Cleaning",
        "Wi-Fi/IT",
        "Classroom Equipment",
        "Security",
        "Other",
    ]

    for category_name in categories:
        existing = db.query(Category).filter(
            Category.name == category_name
        ).first()

        if not existing:
            db.add(Category(name=category_name))

    location = db.query(Location).filter(
        Location.block == "Main Block"
    ).first()

    if not location:
        db.add(
            Location(
                block="Main Block",
                building="Academic Building",
                room="204",
                area="Classroom"
            )
        )

    db.commit()

    return {
        "message": "Seed data created successfully"
    }


# =========================
# Debug
# =========================

@app.get("/debug/users")
def debug_users(db: Session = Depends(get_db)):
    users = db.query(User).all()

    return [
        {
            "id": user.id,
            "username": user.username,
            "role": user.role,
            "specialization": user.specialization
        }
        for user in users
    ]