from datetime import datetime
from typing import Optional
from sqlalchemy import String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class FeedRecord(Base):
    __tablename__ = "feed_records"

    id: Mapped[int] = mapped_column(primary_key=True)
    child_id: Mapped[int] = mapped_column(ForeignKey("children.id"), index=True)
    feed_type: Mapped[str] = mapped_column(String(20))  # breast, formula, baby_food, snack, water
    amount: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    fed_at: Mapped[datetime] = mapped_column(DateTime)
    note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
