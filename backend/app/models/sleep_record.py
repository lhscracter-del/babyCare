from datetime import datetime
from typing import Optional
from sqlalchemy import Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class SleepRecord(Base):
    __tablename__ = "sleep_records"

    id: Mapped[int] = mapped_column(primary_key=True)
    child_id: Mapped[int] = mapped_column(ForeignKey("children.id"), index=True)
    sleep_at: Mapped[datetime] = mapped_column(DateTime)
    wake_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    quality: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)  # 1-5
    note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
