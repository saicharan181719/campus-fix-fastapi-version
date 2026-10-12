from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from ..database import get_db
from ..models import User, PasswordResetToken
from ..schemas.auth import UserCreate, UserLogin
from datetime import datetime, timedelta, timezone
from jose import jwt
import os
import re
from dotenv import load_dotenv
import hashlib
import secrets
from pydantic import BaseModel, EmailStr
from ..services.email_services import send_password_reset_email


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


# =========================
# Password Validation
# =========================

def validate_password(password: str):

    if len(password) < 8:
        return "Password must be at least 8 characters long"

    if not re.search(r"[A-Z]", password):
        return "Password must contain at least one uppercase letter"

    if not re.search(r"[a-z]", password):
        return "Password must contain at least one lowercase letter"

    if not re.search(r"\d", password):
        return "Password must contain at least one number"

    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        return "Password must contain at least one special character"

    return None


# =========================
# Register
# =========================

@router.post("/register")
def register(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):

    existing_user = db.query(User).filter(
        User.username == user_data.username
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Username already exists"
        )

    existing_email = db.query(User).filter(
        User.email == user_data.email
    ).first()

    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    # Validate password
    password_error = validate_password(user_data.password)

    if password_error:
        raise HTTPException(
            status_code=400,
            detail=password_error
        )

    # Hash password
    hashed_password = pwd_context.hash(
        user_data.password
    )

    user = User(
        username=user_data.username,
        email=user_data.email,
        password=hashed_password,
        role=user_data.role,
        specialization=user_data.specialization,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "message": "User registered successfully",
        "user_id": user.id,
        "username": user.username,
        "role": user.role,
    }


# =========================
# JWT Configuration
# =========================

load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET_KEY")

ALGORITHM = os.getenv(
    "JWT_ALGORITHM",
    "HS256"
)

ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv(
        "JWT_ACCESS_TOKEN_EXPIRE_MINUTES",
        "60"
    )
)


# =========================
# Login
# =========================

@router.post("/login")
def login(
    user_data: UserLogin,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.username == user_data.username
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    if not pwd_context.verify(
        user_data.password,
        user.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    expire = datetime.utcnow() + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    token_data = {
        "sub": str(user.id),
        "username": user.username,
        "role": user.role,
        "exp": expire,
    }

    access_token = jwt.encode(
        token_data,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "username": user.username,
        "role": user.role,
    }


@router.post("/forgot-password")
def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    generic_message = (
        "If an account exists for this email, "
        "a password reset link will be sent."
    )

    user = db.query(User).filter(
        User.email == request.email
    ).first()

    # Always return the same message for unknown email addresses.
    if not user:
        return {"message": generic_message}

    raw_token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(
        raw_token.encode("utf-8")
    ).hexdigest()

    now = datetime.now(timezone.utc)

    try:
        # Invalidate older reset links for this user.
        db.query(PasswordResetToken).filter(
            PasswordResetToken.user_id == user.id
        ).delete(synchronize_session=False)

        reset_record = PasswordResetToken(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=now + timedelta(minutes=30),
            created_at=now,
        )

        db.add(reset_record)
        db.commit()

        frontend_url = os.getenv(
            "FRONTEND_URL",
            "http://localhost:5173",
        ).rstrip("/")

        reset_link = (
            f"{frontend_url}/reset-password"
            f"?token={raw_token}"
        )

        send_password_reset_email(
            recipient_email=user.email,
            reset_link=reset_link,
        )

    except Exception:
        db.rollback()

        # Remove the newly created token if sending the email failed.
        if "reset_record" in locals():
            try:
                db.query(PasswordResetToken).filter(
                    PasswordResetToken.id == reset_record.id
                ).delete(synchronize_session=False)
                db.commit()
            except Exception:
                db.rollback()

        # Do not expose email delivery or account details.
        return {"message": generic_message}

    return {"message": generic_message}


@router.post("/reset-password")
def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    password_error = validate_password(request.new_password)

    if password_error:
        raise HTTPException(
            status_code=400,
            detail=password_error,
        )

    token_hash = hashlib.sha256(
        request.token.encode("utf-8")
    ).hexdigest()

    now = datetime.now(timezone.utc)

    try:
        reset_record = (
            db.query(PasswordResetToken)
            .filter(
                PasswordResetToken.token_hash == token_hash
            )
            .with_for_update()
            .first()
        )

        if not reset_record or reset_record.used_at is not None:
            raise HTTPException(
                status_code=400,
                detail="Invalid or expired reset link.",
            )

        # Handle a database driver that returns a naive datetime.
        expiry = reset_record.expires_at
        if expiry.tzinfo is None:
            expiry = expiry.replace(tzinfo=timezone.utc)

        if expiry <= now:
            raise HTTPException(
                status_code=400,
                detail="Invalid or expired reset link.",
            )

        user = db.query(User).filter(
            User.id == reset_record.user_id
        ).first()

        if not user:
            raise HTTPException(
                status_code=400,
                detail="Invalid or expired reset link.",
            )

        user.password = pwd_context.hash(
            request.new_password
        )
        reset_record.used_at = now

        # Invalidate any other outstanding reset tokens.
        other_tokens = db.query(PasswordResetToken).filter(
            PasswordResetToken.user_id == user.id,
            PasswordResetToken.id != reset_record.id,
            PasswordResetToken.used_at.is_(None),
        ).all()

        for other_token in other_tokens:
            other_token.used_at = now

        db.commit()

        return {
            "message": "Password reset successful. You can now log in."
        }

    except HTTPException:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Unable to reset password right now.",
        )

