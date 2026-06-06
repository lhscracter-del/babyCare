# ===== 예방접종 일정(VaccineSchedule) 데이터베이스 테이블 정의 =====
# 아이의 예방접종 일정과 완료 여부를 저장합니다.

from datetime import date, datetime
from typing import Optional
from sqlalchemy import String, Boolean, Date, DateTime, ForeignKey
# Boolean: True/False 값 / Date: 날짜만
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class VaccineSchedule(Base):
    """예방접종 일정을 저장하는 테이블입니다."""
    __tablename__ = "vaccine_schedules"

    # id: 일정 고유 번호 (자동 증가, 기본키)
    id: Mapped[int] = mapped_column(primary_key=True)

    # child_id: 이 예방접종 일정이 속한 아이의 ID
    child_id: Mapped[int] = mapped_column(ForeignKey("children.id"), index=True)

    # vaccine_name: 예방접종 이름 (예: "BCG", "B형간염", "DTaP")
    vaccine_name: Mapped[str] = mapped_column(String(100))

    # scheduled_at: 예방접종 예정일 (날짜만)
    scheduled_at: Mapped[date] = mapped_column(Date)

    # is_completed: 접종 완료 여부 (기본값: False = 미완료)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False)

    # completed_at: 실제로 접종을 완료한 날짜 — 완료 전엔 비어있음 (Optional)
    completed_at: Mapped[Optional[date]] = mapped_column(Date, nullable=True)

    # created_at: 이 일정을 앱에서 등록한 시각 (자동 저장)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
