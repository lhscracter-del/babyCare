# ===== 육아 일기(DiaryEntry) 데이터베이스 테이블 정의 =====
# 부모가 작성한 육아 일기 항목을 저장합니다.
# 글 내용과 함께 사진도 첨부할 수 있습니다.

from datetime import date, datetime
from typing import Optional
from sqlalchemy import String, Date, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class DiaryEntry(Base):
    """육아 일기 항목을 저장하는 테이블입니다."""
    __tablename__ = "diary_entries"

    # id: 일기 고유 번호 (자동 증가, 기본키)
    id: Mapped[int] = mapped_column(primary_key=True)

    # child_id: 이 일기가 속한 아이의 ID
    child_id: Mapped[int] = mapped_column(ForeignKey("children.id"), index=True)

    # entry_date: 일기 날짜 (예: 2024-03-15)
    entry_date: Mapped[date] = mapped_column(Date)

    # mood: 그날 아이의 기분/상태 (예: "happy", "sick", "tired") — 선택 사항
    mood: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    # content: 일기 본문 내용 (Text 타입 = 길이 제한 없는 긴 문자열)
    content: Mapped[str] = mapped_column(Text)

    # image_path: Cloudinary에 업로드된 이미지의 URL (크롭된 이미지)
    # 예: "https://res.cloudinary.com/.../babycare/diaries/uuid.jpg"
    image_path: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # original_image_path: 원본(크롭 전) 이미지의 URL — 선택 사항
    original_image_path: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # created_at: 이 일기를 처음 저장한 시각 (자동 저장)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
