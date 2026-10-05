from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: str = "student"
    specialization: str | None = None

class UserLogin(BaseModel):
    username: str
    password: str