from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel


class ChildCreate(BaseModel):
    name: str
    birth_date: date
    gender: str  # M or F


class ChildUpdate(BaseModel):
    name: Optional[str] = None
    birth_date: Optional[date] = None
    gender: Optional[str] = None


class ChildResponse(BaseModel):
    id: int
    name: str
    birth_date: date
    gender: str
    created_at: datetime

    model_config = {"from_attributes": True}
