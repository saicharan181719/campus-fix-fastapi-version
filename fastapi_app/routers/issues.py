from fastapi_app.schemas import issues
from fastapi_app.schemas import issues
from fastapi_app.schemas import issues
from fastapi_app.schemas import issues
from fastapi_app.schemas import issues
from fastapi_app.schemas import issues
from fastapi_app.schemas import issues
from fastapi_app.schemas import issues

from datetime import datetime
import uuid

from ..services.supabase_client import supabase

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    UploadFile,
    File,
    Form
)

from sqlalchemy.orm import Session

from ..database import get_db

from ..models import (
    Issue,
    Category,
    Location,
    IssueUpdate,
    User
)

from ..schemas.issues import IssueCreate
from ..services.auth import get_current_user

from pydantic import BaseModel

import os
from dotenv import load_dotenv


load_dotenv()


SUPABASE_URL = os.getenv("SUPABASE_URL")


router = APIRouter(
    prefix="/issues",
    tags=["Issues"]
)


# =========================================================
# Feedback Request
# =========================================================

class FeedbackRequest(BaseModel):

    verified: bool

    rating: int | None = None

    feedback: str | None = None


# =========================================================
# Create Issue
# =========================================================

@router.post("/")
async def create_issue(

    title: str = Form(...),

    description: str = Form(...),

    category_id: int = Form(...),

    location_id: int = Form(...),

    priority: str = Form("medium"),

    image: UploadFile | None = File(None),

    db: Session = Depends(get_db),

    current_user: User = Depends(get_current_user)

):

    if current_user.role not in ["student", "faculty"]:

        raise HTTPException(
            status_code=403,
            detail="Only students and faculty can report issues"
        )


    # -----------------------------------------------------
    # Check category
    # -----------------------------------------------------

    category = (
        db.query(Category)
        .filter(Category.id == category_id)
        .first()
    )


    if not category:

        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )


    # -----------------------------------------------------
    # Check location
    # -----------------------------------------------------

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


    # -----------------------------------------------------
    # Upload issue image
    # -----------------------------------------------------

    image_url = None


    if image:

        allowed_types = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ]


        if image.content_type not in allowed_types:

            raise HTTPException(
                status_code=400,
                detail="Only JPG, PNG, and WEBP images are allowed"
            )


        file_extension = (
            image.filename
            .split(".")[-1]
            .lower()
        )


        file_name = (
            f"issues/{uuid.uuid4()}.{file_extension}"
        )


        file_data = await image.read()


        try:

            supabase.storage.from_(
                "campus-fix-images"
            ).upload(
                file_name,
                file_data,
                {
                    "content-type":
                        image.content_type
                }
            )


            image_url = (
                f"{SUPABASE_URL}/storage/v1/object/public/"
                f"campus-fix-images/{file_name}"
            )


        except Exception as e:

            raise HTTPException(
                status_code=500,
                detail=f"Image upload failed: {str(e)}"
            )


    # -----------------------------------------------------
    # Validate priority
    # -----------------------------------------------------

    allowed_priorities = [
        "low",
        "medium",
        "high",
        "critical"
    ]


    if priority not in allowed_priorities:

        raise HTTPException(
            status_code=400,
            detail="Invalid priority"
        )


    # -----------------------------------------------------
    # Category → Maintenance specialization
    # -----------------------------------------------------

    category_specialization = {

        "Electrical": "electrical",

        "Plumbing": "plumbing",

        "Cleaning": "cleaning",

        "Wi-Fi/IT": "wifi_it",

        "Classroom Equipment": "classroom_equipment",

        "Security": "security",

        "Other": "other"

    }


    specialization = (
        category_specialization.get(category.name)
    )


    # -----------------------------------------------------
    # Find matching maintenance user
    # -----------------------------------------------------

    maintenance_user = None


    if specialization:

        maintenance_user = (
            db.query(User)
            .filter(
                User.role == "maintenance",
                User.specialization == specialization,
                User.is_active == True
            )
            .first()
        )


    # -----------------------------------------------------
    # Determine initial status
    # -----------------------------------------------------

    if maintenance_user:

        initial_status = "assigned"

    else:

        initial_status = "reported"


    # -----------------------------------------------------
    # Create issue
    # -----------------------------------------------------

    issue = Issue(

        ticket_id="TEMP",

        title=title,

        description=description,

        category_id=category_id,

        location_id=location_id,

        priority=priority,

        status=initial_status,

        reporter_id=current_user.id,

        assigned_to_id=(
            maintenance_user.id
            if maintenance_user
            else None
        ),

        image=image_url

    )


    db.add(issue)

    db.commit()

    db.refresh(issue)


    # -----------------------------------------------------
    # Generate ticket ID
    # -----------------------------------------------------

    issue.ticket_id = (
        f"CF-{datetime.now().year}-{issue.id:05d}"
    )


    db.commit()

    db.refresh(issue)


    # -----------------------------------------------------
    # Create initial history entry
    # -----------------------------------------------------

    if maintenance_user:

        comment = (
            f"Issue automatically assigned to "
            f"{maintenance_user.username} "
            f"based on category {category.name}."
        )

    else:

        comment = (
            "Issue reported. No matching maintenance "
            "user is currently available."
        )


    update = IssueUpdate(

        issue_id=issue.id,

        updated_by_id=current_user.id,

        status=initial_status,

        comment=comment

    )


    db.add(update)

    db.commit()


    return {

        "message":
            "Issue created successfully",

        "ticket_id":
            issue.ticket_id,

        "issue_id":
            issue.id,

        "title":
            issue.title,

        "status":
            issue.status,

        "priority":
            issue.priority,

        "reporter":
            current_user.username,

        "assigned_to":
            (
                maintenance_user.username
                if maintenance_user
                else None
            )

    }


# =========================================================
# Get Categories
# =========================================================

@router.get("/categories")
def get_categories(

    db: Session = Depends(get_db),

    current_user: User = Depends(get_current_user)

):

    if current_user.role not in [
        "student",
        "faculty"
    ]:

        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )


    categories = (
        db.query(Category)
        .order_by(Category.id.asc())
        .all()
    )


    return [

        {
            "id": category.id,
            "name": category.name
        }

        for category in categories

    ]


# =========================================================
# Get Locations
# =========================================================

@router.get("/locations")
def get_locations(

    db: Session = Depends(get_db),

    current_user: User = Depends(get_current_user)

):

    if current_user.role not in [
        "student",
        "faculty"
    ]:

        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )


    locations = (
        db.query(Location)
        .order_by(Location.id.asc())
        .all()
    )


    return [

        {
            "id": location.id,

            "block": location.block,

            "building": location.building,

            "room": location.room,

            "area": location.area
        }

        for location in locations

    ]


# =========================================================
# Get My Issues
# =========================================================

@router.get("/")
def get_my_issues(

    db: Session = Depends(get_db),

    current_user: User = Depends(get_current_user)

):

    issues = (

        db.query(Issue)

        .filter(
            Issue.reporter_id == current_user.id
        )

        .order_by(
            Issue.created_at.desc()
        )

        .all()

    )


    return {

        "count":
            len(issues),

        "issues": [

            {

                "issue_id":
                    issue.id,

                "ticket_id":
                    issue.ticket_id,

                "title":
                    issue.title,

                "description":
                    issue.description,

                "category":
                    issue.category.name,

                "location": {

                    "block":
                        issue.location.block,

                    "building":
                        issue.location.building,

                    "room":
                        issue.location.room,

                    "area":
                        issue.location.area

                },

                "priority":
                    issue.priority,

                "status":
                    issue.status,

                "created_at":
                    issue.created_at,

                "updated_at":
                    issue.updated_at,

                "image":
                    issue.image,

                "resolution_image":
                    issue.resolution_image

            }

            for issue in issues

        ]

    }


# =========================================================
# Get Single Issue
# =========================================================

@router.get("/{issue_id}")
def get_issue(

    issue_id: int,

    db: Session = Depends(get_db),

    current_user: User = Depends(get_current_user)

):

    issue = (

        db.query(Issue)

        .filter(

            Issue.id == issue_id,

            Issue.reporter_id == current_user.id

        )

        .first()

    )


    if not issue:

        raise HTTPException(
            status_code=404,
            detail="Issue not found"
        )


    history = [

        {

            "status":
                update.status,

            "comment":
                update.comment,

            "updated_by":
                (
                    update.updated_by_id
                    if update.updated_by_id
                    else None
                ),

            "created_at":
                update.created_at

        }

        for update in issue.updates

    ]


    return {
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

    "reporter": current_user.username,

    "assigned_to": (
        issue.assigned_to.username
        if issue.assigned_to
        else None
    ),

    # Issue image
    "image": issue.image,

    # Resolution image
    "resolution_image": issue.resolution_image,

    "resolution_notes": issue.resolution_notes,

    "student_verified": issue.student_verified,

    "student_feedback": issue.student_feedback,

    "student_rating": issue.student_rating,

    "created_at": issue.created_at,

    "updated_at": issue.updated_at,

    "history": history
}


# =========================================================
# Submit Feedback
# Supports Student + Faculty
# =========================================================

@router.patch("/{issue_id}/feedback")
def submit_feedback(

    issue_id: int,

    data: FeedbackRequest,

    db: Session = Depends(get_db),

    current_user: User = Depends(get_current_user)

):

    # -----------------------------------------------------
    # Student and Faculty are allowed
    # -----------------------------------------------------

    if current_user.role not in [
        "student",
        "faculty"
    ]:

        raise HTTPException(
            status_code=403,
            detail="Only students and faculty can submit feedback"
        )


    # -----------------------------------------------------
    # Only reporter can submit feedback
    # -----------------------------------------------------

    issue = (

        db.query(Issue)

        .filter(

            Issue.id == issue_id,

            Issue.reporter_id == current_user.id

        )

        .first()

    )


    if not issue:

        raise HTTPException(
            status_code=404,
            detail="Issue not found"
        )


    # -----------------------------------------------------
    # Feedback only after resolution
    # -----------------------------------------------------

    if issue.status != "resolved":

        raise HTTPException(
            status_code=400,
            detail="Only resolved issues can receive feedback"
        )


    # -----------------------------------------------------
    # Validate rating
    # -----------------------------------------------------

    if data.rating is not None:

        if data.rating < 1 or data.rating > 5:

            raise HTTPException(
                status_code=400,
                detail="Rating must be between 1 and 5"
            )


    # -----------------------------------------------------
    # Save feedback
    # -----------------------------------------------------

    issue.student_verified = data.verified

    issue.student_rating = data.rating

    issue.student_feedback = data.feedback


    # -----------------------------------------------------
    # Confirm or reopen
    # -----------------------------------------------------

    if data.verified:

        issue.status = "closed"


        comment = (
            f"{current_user.role.title()} "
            "confirmed that the issue was resolved."
        )


        if data.feedback:

            comment += (
                f" Feedback: {data.feedback}"
            )


    else:

        issue.status = "reopened"


        comment = (
            f"{current_user.role.title()} "
            "reopened the issue because it was not resolved."
        )


        if data.feedback:

            comment += (
                f" Feedback: {data.feedback}"
            )


    # -----------------------------------------------------
    # Add history entry
    # -----------------------------------------------------

    update = IssueUpdate(

        issue_id=issue.id,

        updated_by_id=current_user.id,

        status=issue.status,

        comment=comment

    )


    db.add(update)

    db.commit()

    db.refresh(issue)


    return {

        "message": (

            "Issue closed successfully"

            if data.verified

            else "Issue reopened successfully"

        ),

        "ticket_id":
            issue.ticket_id,

        "status":
            issue.status,

        "verified":
            issue.student_verified,

        "rating":
            issue.student_rating,

        "feedback":
            issue.student_feedback

    }


# =========================================================
# Issue History
# =========================================================

@router.get("/{issue_id}/history")
def get_issue_history(

    issue_id: int,

    db: Session = Depends(get_db),

    current_user: User = Depends(get_current_user)

):

    issue = (

        db.query(Issue)

        .filter(
            Issue.id == issue_id
        )

        .first()

    )


    if not issue:

        raise HTTPException(
            status_code=404,
            detail="Issue not found"
        )


    # -----------------------------------------------------
    # Students + Faculty
    # -----------------------------------------------------

    if current_user.role in [
        "student",
        "faculty"
    ]:

        if issue.reporter_id != current_user.id:

            raise HTTPException(

                status_code=403,

                detail=
                    "You can only view your own issue history"

            )


    # -----------------------------------------------------
    # Maintenance
    # -----------------------------------------------------

    elif current_user.role == "maintenance":

        if issue.assigned_to_id != current_user.id:

            raise HTTPException(

                status_code=403,

                detail=
                    "You can only view assigned issue history"

            )


    # -----------------------------------------------------
    # Administrator
    # -----------------------------------------------------

    elif current_user.role != "administrator":

        raise HTTPException(

            status_code=403,

            detail="Access denied"

        )


    updates = (

        db.query(IssueUpdate)

        .filter(
            IssueUpdate.issue_id == issue.id
        )

        .order_by(
            IssueUpdate.created_at.asc()
        )

        .all()

    )


    return {

        "ticket_id":
            issue.ticket_id,

        "history": [

            {

                "id":
                    update.id,

                "status":
                    update.status,

                "comment":
                    update.comment,

                "updated_by_id":
                    update.updated_by_id,

                "created_at":
                    update.created_at

            }

            for update in updates

        ]

    }