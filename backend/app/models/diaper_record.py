# ===== 기저귀 교체 기록(DiaperRecord) 데이터베이스 테이블 정의 =====
# 아이의 기저귀를 갈아준 기록을 저장합니다.

from datetime import datetime
from typing import Optional
from sqlalchemy import String, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class DiaperRecord(Base):
    """기저귀 교체 기록을 저장하는 테이블입니다."""
    __tablename__ = "diaper_records"

    # id: 기록 고유 번호 (자동 증가, 기본키)
    id: Mapped[int] = mapped_column(primary_key=True)

    # child_id: 이 기저귀 기록이 속한 아이의 ID
    child_id: Mapped[int] = mapped_column(ForeignKey("children.id"), index=True)

    # type: 기저귀 종류
    # "pee" = 소변만, "poo" = 대변만, "both" = 소변+대변
    type: Mapped[str] = mapped_column(String(10))  # pee, poo, both

    # changed_at: 기저귀를 갈아준 시각
    changed_at: Mapped[datetime] = mapped_column(DateTime)

    # note: 추가 메모 (예: "변 색깔이 이상해요") — 선택 사항
    note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # created_at: 이 기록을 앱에서 입력한 시각 (자동 저장)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
