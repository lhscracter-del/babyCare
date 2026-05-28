from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class FeedRecordCreate(BaseModel):
    feed_type: str  # breast, formula, baby_food, snack, water
    amount: Optional[float] = None
    fed_at: datetime
    note: Optional[str] = None


class FeedRecordUpdate(BaseModel):
    feed_type: Optional[str] = None
    amount: Optional[float] = None
    fed_at: Optional[datetime] = None
    note: Optional[str] = None


class FeedRecordResponse(BaseModel):
    id: int
    child_id: int
    feed_type: str
    amount: Optional[float]
    fed_at: datetime
    note: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}
