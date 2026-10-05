from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Issue, IssueUpdate, User, Category, Location
from ..services.auth import get_current_user

from pydantic import BaseModel
from passlib.context import CryptContext

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

class IssueUpdateRequest(BaseModel):
    status: str | None = None
    priority: str | None = None

class UserUpdateRequest(BaseModel):
    role: str | None = None
    specialization: str | None = None
    is_active: bool | None = None

class UserCreateRequest(BaseModel):
    username: str
    email: str
    password: str
    role: str = "student"
    specialization: str | None = None

class LocationRequest(BaseModel):
    block: str
    building: str | None = None
    room: str | None = None
    area: str | None = None


@router.post("/issues/{issue_id}/assign/{maintenance_user_id}")
def assign_issue(
    issue_id: int,
    maintenance_user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check admin role
    if current_user.role != "administrator":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    # Find issue
    issue = db.query(Issue).filter(Issue.id == issue_id).first()

    if not issue:
        raise HTTPException(
            status_code=404,
            detail="Issue not found"
        )

    # Find maintenance user
    maintenance_user = (
        db.query(User)
        .filter(
            User.id == maintenance_user_id,
            User.role == "maintenance"
        )
        .first()
    )

    if not maintenance_user:
        raise HTTPException(
            status_code=404,
            detail="Maintenance user not found"
        )

    # Assign issue
    issue.assigned_to_id = maintenance_user.id
    issue.status = "assigned"

    db.commit()
    db.refresh(issue)

    # Add history
    update = IssueUpdate(
        issue_id=issue.id,
        updated_by_id=current_user.id,
        status="assigned",
        comment=f"Issue assigned to {maintenance_user.username}."
    )

    db.add(update)
    db.commit()

    return {
        "message": "Issue assigned successfully",
        "ticket_id": issue.ticket_id,
        "assigned_to": maintenance_user.username,
        "status": issue.status
    }

@router.get("/dashboard-data")
def admin_dashboard_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "administrator":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    total_issues = db.query(Issue).count()

    open_issues = (
        db.query(Issue)
        .filter(
            Issue.status.in_([
                "reported",
                "reviewed",
                "assigned",
                "reopened"
            ])
        )
        .count()
    )

    in_progress_issues = (
        db.query(Issue)
        .filter(Issue.status == "in_progress")
        .count()
    )

    resolved_issues = (
        db.query(Issue)
        .filter(
            Issue.status.in_(["resolved", "closed"])
        )
        .count()
    )

    return {
        "total_issues": total_issues,
        "open_issues": open_issues,
        "in_progress_issues": in_progress_issues,
        "resolved_issues": resolved_issues
    }

@router.get("/issues-data")
def get_all_issues(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "administrator":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    issues = (
        db.query(Issue)
        .order_by(Issue.created_at.desc())
        .all()
    )

    return {
        "count": len(issues),
        "issues": [
            {
                "issue_id": issue.id,
                "ticket_id": issue.ticket_id,
                "title": issue.title,
                "description": issue.description,

                "category": issue.category.name,

                "location": {
                    "block": issue.location.block,
                    "building": issue.location.building,
                    "room": issue.location.room,
                    "area": issue.location.area
                },

                "priority": issue.priority,
                "status": issue.status,

                "reporter": issue.reporter.username,

                "assigned_to_id": issue.assigned_to_id,
                "assigned_to": (
                    issue.assigned_to.username
                    if issue.assigned_to
                    else None
                ),

                # Images
                "image": issue.image,
                "resolution_image": issue.resolution_image,

                # Resolution details
                "resolution_notes": issue.resolution_notes,

                # Student feedback
                "student_verified": issue.student_verified,
                "student_feedback": issue.student_feedback,
                "student_rating": issue.student_rating,

                # Dates
                "created_at": issue.created_at,
                "updated_at": issue.updated_at
            }
            for issue in issues
        ]
    }

@router.patch("/issues/{issue_id}")
def update_issue(
    issue_id: int,
    data: IssueUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "administrator":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    issue = db.query(Issue).filter(Issue.id == issue_id).first()

    if not issue:
        raise HTTPException(
            status_code=404,
            detail="Issue not found"
        )

    allowed_statuses = [
        "reported",
        "reviewed",
        "assigned",
        "in_progress",
        "resolved",
        "closed",
        "reopened"
    ]

    allowed_priorities = [
        "low",
        "medium",
        "high",
        "critical"
    ]

    if data.status is not None:
        if data.status not in allowed_statuses:
            raise HTTPException(
                status_code=400,
                detail="Invalid status"
            )

        issue.status = data.status

        update = IssueUpdate(
            issue_id=issue.id,
            updated_by_id=current_user.id,
            status=data.status,
            comment=f"Administrator changed issue status to {data.status}."
        )

        db.add(update)

    if data.priority is not None:
        if data.priority not in allowed_priorities:
            raise HTTPException(
                status_code=400,
                detail="Invalid priority"
            )

        issue.priority = data.priority

    db.commit()
    db.refresh(issue)

    return {
        "message": "Issue updated successfully",
        "ticket_id": issue.ticket_id,
        "status": issue.status,
        "priority": issue.priority
    }
@router.get("/maintenance-users")
def get_maintenance_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "administrator":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    users = (
        db.query(User)
        .filter(
            User.role == "maintenance",
            User.is_active == True
        )
        .order_by(User.username)
        .all()
    )

    return {
        "count": len(users),
        "users": [
            {
                "id": user.id,
                "username": user.username,
                "specialization": user.specialization
            }
            for user in users
        ]
    }

@router.post("/users")
def create_user(
    data: UserCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "administrator":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    # Check username
    existing_username = (
        db.query(User)
        .filter(User.username == data.username)
        .first()
    )

    if existing_username:
        raise HTTPException(
            status_code=400,
            detail="Username already exists"
        )

    # Check email
    existing_email = (
        db.query(User)
        .filter(User.email == data.email)
        .first()
    )

    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    allowed_roles = [
        "student",
        "faculty",
        "maintenance",
        "administrator"
    ]

    if data.role not in allowed_roles:
        raise HTTPException(
            status_code=400,
            detail="Invalid role"
        )

    allowed_specializations = [
        "electrical",
        "plumbing",
        "cleaning",
        "wifi_it",
        "classroom_equipment",
        "security",
        "other"
    ]

    if data.role == "maintenance":
        if not data.specialization:
            raise HTTPException(
                status_code=400,
                detail="Specialization is required for maintenance users"
            )

        if data.specialization not in allowed_specializations:
            raise HTTPException(
                status_code=400,
                detail="Invalid specialization"
            )

    hashed_password = pwd_context.hash(data.password)

    user = User(
        username=data.username,
        email=data.email,
        password=hashed_password,
        role=data.role,
        specialization=(
            data.specialization
            if data.role == "maintenance"
            else None
        ),
        is_active=True
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "message": "User created successfully",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "specialization": user.specialization,
            "is_active": user.is_active
        }
    }

@router.patch("/users/{user_id}")
def update_user(
    user_id: int,
    data: UserUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "administrator":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    allowed_roles = [
        "student",
        "faculty",
        "maintenance",
        "administrator"
    ]

    if data.role is not None:

        if data.role not in allowed_roles:
            raise HTTPException(
                status_code=400,
                detail="Invalid role"
            )

        user.role = data.role

    if data.specialization is not None:
        user.specialization = data.specialization

    if data.is_active is not None:
        user.is_active = data.is_active

    db.commit()
    db.refresh(user)

    return {
        "message": "User updated successfully",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "specialization": user.specialization,
            "is_active": user.is_active
        }
    }

@router.get("/users-data")
def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "administrator":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    users = (
        db.query(User)
        .order_by(User.id.asc())
        .all()
    )

    return {
        "count": len(users),
        "users": [
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role,
                "specialization": user.specialization,
                "is_active": user.is_active
            }
            for user in users
        ]
    }

@router.get("/categories-data")
def get_all_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["administrator", "student"]:
        raise HTTPException(
        status_code=403,
        detail="Access denied"
    )

    categories = (
        db.query(Category)
        .order_by(Category.id.asc())
        .all()
    )

    return {
        "count": len(categories),
        "categories": [
            {
                "id": category.id,
                "name": category.name,
                "description": category.description
            }
            for category in categories
        ]
    }

@router.get("/locations-data")
def get_all_locations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["administrator", "student"]:
        raise HTTPException(
        status_code=403,
        detail="Access denied"
    )

    locations = (
        db.query(Location)
        .order_by(Location.id.asc())
        .all()
    )

    return {
        "count": len(locations),
        "locations": [
            {
                "id": location.id,
                "block": location.block,
                "building": location.building,
                "room": location.room,
                "area": location.area
            }
            for location in locations
        ]
    }

@router.post("/locations")
def create_location(
    data: LocationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "administrator":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    if not data.block.strip():
        raise HTTPException(
            status_code=400,
            detail="Block is required"
        )

    location = Location(
        block=data.block.strip(),
        building=data.building.strip() if data.building else None,
        room=data.room.strip() if data.room else None,
        area=data.area.strip() if data.area else None
    )

    db.add(location)
    db.commit()
    db.refresh(location)

    return {
        "message": "Location created successfully",
        "location": {
            "id": location.id,
            "block": location.block,
            "building": location.building,
            "room": location.room,
            "area": location.area
        }
    }

@router.patch("/locations/{location_id}")
def update_location(
    location_id: int,
    data: LocationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "administrator":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    location = (
        db.query(Location)
        .filter(Location.id == location_id)
        .first()
    )

    if not location:
        raise HTTPException(
            status_code=404,
            detail="Location not found"
        )

    if not data.block.strip():
        raise HTTPException(
            status_code=400,
            detail="Block is required"
        )

    location.block = data.block.strip()
    location.building = (
        data.building.strip()
        if data.building else None
    )
    location.room = (
        data.room.strip()
        if data.room else None
    )
    location.area = (
        data.area.strip()
        if data.area else None
    )

    db.commit()
    db.refresh(location)

    return {
        "message": "Location updated successfully",
        "location": {
            "id": location.id,
            "block": location.block,
            "building": location.building,
            "room": location.room,
            "area": location.area
        }
    }

@router.delete("/locations/{location_id}")
def delete_location(
    location_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "administrator":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    location = (
        db.query(Location)
        .filter(Location.id == location_id)
        .first()
    )

    if not location:
        raise HTTPException(
            status_code=404,
            detail="Location not found"
        )

    issue_count = (
        db.query(Issue)
        .filter(Issue.location_id == location.id)
        .count()
    )

    if issue_count > 0:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete location because issues are using it"
        )

    db.delete(location)
    db.commit()

    return {
        "message": "Location deleted successfully"
    }