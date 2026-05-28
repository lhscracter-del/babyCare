from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class DiaperRecordCreate(BaseModel):
    type: str  # pee, poo, both
    changed_at: datetime
    note: Optional[str] = None


class DiaperRecordResponse(BaseModel):
    id: int
    child_id: int
    type: str
    changed_at: datetime
    note: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}
