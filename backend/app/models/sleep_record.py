# ===== 수면 기록(SleepRecord) 데이터베이스 테이블 정의 =====
# 아이의 수면 시작/종료 시각과 수면 품질을 기록합니다.

from datetime import datetime
from typing import Optional
from sqlalchemy import Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class SleepRecord(Base):
    """수면 기록을 저장하는 테이블입니다."""
    __tablename__ = "sleep_records"

    # id: 기록 고유 번호 (자동 증가, 기본키)
    id: Mapped[int] = mapped_column(primary_key=True)

    # child_id: 이 수면 기록이 속한 아이의 ID
    child_id: Mapped[int] = mapped_column(ForeignKey("children.id"), index=True)

    # sleep_at: 잠든 시각
    sleep_at: Mapped[datetime] = mapped_column(DateTime)

    # wake_at: 깨어난 시각 — 아직 자고 있으면 비워둘 수 있음 (Optional)
    wake_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # quality: 수면 품질 점수 (1~5점) — 선택 사항
    # 1 = 매우 나쁨, 5 = 매우 좋음
    quality: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)  # 1-5

    # note: 추가 메모 (예: "밤에 2번 깼어요") — 선택 사항
    note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # created_at: 이 기록을 앱에서 입력한 시각 (자동 저장)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
