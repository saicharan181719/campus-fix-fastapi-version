from pydantic import BaseModel


class IssueCreate(BaseModel):
    title: str
    description: str
    category_id: int
    location_id: int
    priority: str = "medium"