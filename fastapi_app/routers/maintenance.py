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
from ..models import Issue, IssueUpdate, User
from ..services.auth import get_current_user
from ..services.supabase_client import supabase

import uuid


router = APIRouter(
    prefix="/maintenance",
    tags=["Maintenance"]
)


@router.get("/issues")
def get_assigned_issues(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "maintenance":
        return {
            "message": "Access denied"
        }

    issues = (
        db.query(Issue)
        .filter(Issue.assigned_to_id == current_user.id)
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
                    "area": issue.location.area,
                },
                "priority": issue.priority,
                "status": issue.status,
                "created_at": issue.created_at,
                "image": issue.image,
                "resolution_image": issue.resolution_image,
            }
            for issue in issues
        ]
    }


@router.patch("/issues/{issue_id}/status")
def update_issue_status(
    issue_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "maintenance":
        raise HTTPException(
            status_code=403,
            detail="Maintenance access required"
        )

    issue = (
        db.query(Issue)
        .filter(
            Issue.id == issue_id,
            Issue.assigned_to_id == current_user.id
        )
        .first()
    )

    if not issue:
        raise HTTPException(
            status_code=404,
            detail="Assigned issue not found"
        )

    allowed_statuses = [
        "in_progress",
        "resolved"
    ]

    if status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail="Invalid status"
        )

    issue.status = status

    db.commit()
    db.refresh(issue)

    update = IssueUpdate(
        issue_id=issue.id,
        updated_by_id=current_user.id,
        status=status,
        comment=f"Maintenance updated issue status to {status}."
    )

    db.add(update)
    db.commit()

    return {
        "message": "Issue status updated successfully",
        "ticket_id": issue.ticket_id,
        "status": issue.status,
        "updated_by": current_user.username
    }


@router.patch("/issues/{issue_id}/resolve")
async def resolve_issue(
    issue_id: int,

    resolution_notes: str = Form(...),

    status: str = Form("resolved"),

    resolution_image: UploadFile | None = File(None),

    db: Session = Depends(get_db),

    current_user: User = Depends(get_current_user)
):

    # Check maintenance role
    if current_user.role != "maintenance":
        raise HTTPException(
            status_code=403,
            detail="Maintenance access required"
        )


    # Find assigned issue
    issue = (
        db.query(Issue)
        .filter(
            Issue.id == issue_id,
            Issue.assigned_to_id == current_user.id
        )
        .first()
    )


    if not issue:
        raise HTTPException(
            status_code=404,
            detail="Assigned issue not found"
        )


    # Only resolved status is allowed here
    if status != "resolved":
        raise HTTPException(
            status_code=400,
            detail="Resolution endpoint only supports resolved status"
        )


    # Resolution notes are required
    if not resolution_notes.strip():
        raise HTTPException(
            status_code=400,
            detail="Resolution notes are required"
        )


    # -----------------------------------------
    # Upload resolution image
    # -----------------------------------------

    resolution_image_url = None

    if resolution_image:

        allowed_types = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ]


        if resolution_image.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail="Only JPG, PNG, and WEBP images are allowed"
            )


        # Get file extension
        file_extension = (
            resolution_image.filename
            .split(".")[-1]
            .lower()
        )


        # Generate unique file name
        file_name = (
            f"resolutions/{uuid.uuid4()}.{file_extension}"
        )


        # Read image
        file_data = await resolution_image.read()


        try:

            # Upload to Supabase Storage
            supabase.storage.from_(
                "campus-fix-images"
            ).upload(
                file_name,
                file_data,
                {
                    "content-type":
                        resolution_image.content_type
                }
            )


            # Get public URL
            resolution_image_url = (
                supabase.storage
                .from_("campus-fix-images")
                .get_public_url(file_name)
            )


        except Exception as e:

            raise HTTPException(
                status_code=500,
                detail=f"Resolution image upload failed: {str(e)}"
            )


    # -----------------------------------------
    # Update issue
    # -----------------------------------------

    issue.status = "resolved"

    issue.resolution_notes = resolution_notes

    issue.resolution_image = resolution_image_url


    db.commit()

    db.refresh(issue)


    # -----------------------------------------
    # Add issue history
    # -----------------------------------------

    update = IssueUpdate(
        issue_id=issue.id,
        updated_by_id=current_user.id,
        status="resolved",
        comment=f"Resolution completed: {resolution_notes}"
    )


    db.add(update)

    db.commit()


    # -----------------------------------------
    # Response
    # -----------------------------------------

    return {
        "message": "Issue resolved successfully",

        "ticket_id": issue.ticket_id,

        "status": issue.status,

        "resolution_notes":
            issue.resolution_notes,

        "resolution_image":
            issue.resolution_image,

        "resolved_by":
            current_user.username
    }