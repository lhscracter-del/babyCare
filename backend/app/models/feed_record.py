# ===== 수유 기록(FeedRecord) 데이터베이스 테이블 정의 =====
# 아이에게 먹인 음식/음료 기록을 저장합니다.
# 모유, 분유, 이유식, 간식, 물 등을 기록할 수 있습니다.

from datetime import datetime
from typing import Optional                                      # 값이 없을 수도 있는 필드에 사용
from sqlalchemy import String, Float, DateTime, ForeignKey, Text
# Float: 소수점 있는 숫자 (양 ml 등) / Text: 긴 문자열 (메모)
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class FeedRecord(Base):
    """수유/식사 기록을 저장하는 테이블입니다."""
    __tablename__ = "feed_records"

    # id: 기록 고유 번호 (자동 증가, 기본키)
    id: Mapped[int] = mapped_column(primary_key=True)

    # child_id: 이 수유 기록이 속한 아이의 ID
    child_id: Mapped[int] = mapped_column(ForeignKey("children.id"), index=True)

    # feed_type: 수유/식사 종류
    # 가능한 값: "breast"(모유), "formula"(분유), "baby_food"(이유식), "snack"(간식), "water"(물)
    feed_type: Mapped[str] = mapped_column(String(20))

    # amount: 섭취량 (ml 또는 g 단위) — 입력 안 해도 됨 (Optional)
    amount: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # fed_at: 먹인 시각 (날짜 + 시간)
    fed_at: Mapped[datetime] = mapped_column(DateTime)

    # note: 추가 메모 (예: "잘 안 먹었어요") — 선택 사항
    note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # created_at: 이 기록을 앱에서 입력한 시각 (자동 저장)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
