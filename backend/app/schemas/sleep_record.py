from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class SleepRecordCreate(BaseModel):
    sleep_at: datetime
    wake_at: Optional[datetime] = None
    quality: Optional[int] = None  # 1-5
    note: Optional[str] = None


class SleepRecordUpdate(BaseModel):
    sleep_at: Optional[datetime] = None
    wake_at: Optional[datetime] = None
    quality: Optional[int] = None
    note: Optional[str] = None


class SleepRecordResponse(BaseModel):
    id: int
    child_id: int
    sleep_at: datetime
    wake_at: Optional[datetime]
    quality: Optional[int]
    note: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}
