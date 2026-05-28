from datetime import date, datetime
from sqlalchemy import String, Date, DateTime
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Child(Base):
    __tablename__ = "children"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    birth_date: Mapped[date] = mapped_column(Date)
    gender: Mapped[str] = mapped_column(String(1))  # M or F
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
