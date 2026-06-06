# ===== 성장 기록(GrowthRecord) 데이터베이스 테이블 정의 =====
# 아이의 신체 측정값(키, 몸무게, 머리 둘레)을 기록합니다.

from datetime import date, datetime
from typing import Optional
from sqlalchemy import Float, Date, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class GrowthRecord(Base):
    """성장 기록(키/몸무게/머리둘레)을 저장하는 테이블입니다."""
    __tablename__ = "growth_records"

    # id: 기록 고유 번호 (자동 증가, 기본키)
    id: Mapped[int] = mapped_column(primary_key=True)

    # child_id: 이 성장 기록이 속한 아이의 ID
    child_id: Mapped[int] = mapped_column(ForeignKey("children.id"), index=True)

    # height: 키 (cm 단위) — 선택 사항
    height: Mapped[Optional[float]] = mapped_column(Float, nullable=True)  # cm

    # weight: 몸무게 (kg 단위) — 선택 사항
    weight: Mapped[Optional[float]] = mapped_column(Float, nullable=True)  # kg

    # head_circumference: 머리 둘레 (cm 단위) — 선택 사항
    head_circumference: Mapped[Optional[float]] = mapped_column(Float, nullable=True)  # cm

    # measured_at: 측정한 날짜 (Date 타입 = 날짜만, 시간 없음)
    measured_at: Mapped[date] = mapped_column(Date)

    # created_at: 이 기록을 앱에서 입력한 시각 (자동 저장)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
