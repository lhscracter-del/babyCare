from datetime import date, datetime
from typing import Optional
from sqlalchemy import String, Boolean, Date, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class VaccineSchedule(Base):
    __tablename__ = "vaccine_schedules"

    id: Mapped[int] = mapped_column(primary_key=True)
    child_id: Mapped[int] = mapped_column(ForeignKey("children.id"), index=True)
    vaccine_name: Mapped[str] = mapped_column(String(100))
    scheduled_at: Mapped[date] = mapped_column(Date)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False)
    completed_at: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
