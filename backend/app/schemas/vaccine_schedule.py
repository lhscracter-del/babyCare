from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel


class VaccineScheduleCreate(BaseModel):
    vaccine_name: str
    scheduled_at: date


class VaccineScheduleUpdate(BaseModel):
    vaccine_name: Optional[str] = None
    scheduled_at: Optional[date] = None
    is_completed: Optional[bool] = None
    completed_at: Optional[date] = None


class VaccineScheduleResponse(BaseModel):
    id: int
    child_id: int
    vaccine_name: str
    scheduled_at: date
    is_completed: bool
    completed_at: Optional[date]
    created_at: datetime

    model_config = {"from_attributes": True}
