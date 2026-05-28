from datetime import date, datetime
from typing import Optional
from sqlalchemy import Float, Date, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class GrowthRecord(Base):
    __tablename__ = "growth_records"

    id: Mapped[int] = mapped_column(primary_key=True)
    child_id: Mapped[int] = mapped_column(ForeignKey("children.id"), index=True)
    height: Mapped[Optional[float]] = mapped_column(Float, nullable=True)  # cm
    weight: Mapped[Optional[float]] = mapped_column(Float, nullable=True)  # kg
    head_circumference: Mapped[Optional[float]] = mapped_column(Float, nullable=True)  # cm
    measured_at: Mapped[date] = mapped_column(Date)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
