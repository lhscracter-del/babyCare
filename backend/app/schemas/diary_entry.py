from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel


class DiaryEntryCreate(BaseModel):
    entry_date: date
    mood: Optional[str] = None
    content: str
    image_path: Optional[str] = None
    original_image_path: Optional[str] = None


class DiaryEntryUpdate(BaseModel):
    entry_date: Optional[date] = None
    mood: Optional[str] = None
    content: Optional[str] = None
    image_path: Optional[str] = None
    original_image_path: Optional[str] = None


class DiaryEntryResponse(BaseModel):
    id: int
    child_id: int
    entry_date: date
    mood: Optional[str]
    content: str
    image_path: Optional[str]
    original_image_path: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}
