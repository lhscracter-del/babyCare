from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel


class GrowthRecordCreate(BaseModel):
    height: Optional[float] = None  # cm
    weight: Optional[float] = None  # kg
    head_circumference: Optional[float] = None  # cm
    measured_at: date


class GrowthRecordUpdate(BaseModel):
    height: Optional[float] = None
    weight: Optional[float] = None
    head_circumference: Optional[float] = None
    measured_at: Optional[date] = None


class GrowthRecordResponse(BaseModel):
    id: int
    child_id: int
    height: Optional[float]
    weight: Optional[float]
    head_circumference: Optional[float]
    measured_at: date
    created_at: datetime

    model_config = {"from_attributes": True}
