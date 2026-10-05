from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from ..services.auth import get_current_user


router = APIRouter(
    prefix="/faculty",
    tags=["Faculty"]
)


@router.get("/dashboard-data")
def faculty_dashboard_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "faculty":
        raise HTTPException(
            status_code=403,
            detail="Faculty access required"
        )

    return {
        "message": "Faculty dashboard is working",
        "user_id": current_user.id,
        "username": current_user.username,
        "role": current_user.role
    }