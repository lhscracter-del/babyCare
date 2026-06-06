# ===== 육아 일기 데이터 형식(스키마) 정의 =====

from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel


class DiaryEntryCreate(BaseModel):
    """육아 일기 작성 요청 데이터 형식."""
    entry_date: date                          # 일기 날짜 (필수)
    mood: Optional[str] = None               # 아이 기분/상태 (예: "happy", "sick") - 선택
    content: str                             # 일기 본문 내용 (필수)
    image_path: Optional[str] = None         # 업로드된 이미지 URL (선택)
    original_image_path: Optional[str] = None # 원본 이미지 URL (선택)


class DiaryEntryUpdate(BaseModel):
    """육아 일기 수정 요청 데이터 형식. 모든 필드가 선택 사항입니다."""
    entry_date: Optional[date] = None
    mood: Optional[str] = None
    content: Optional[str] = None
    image_path: Optional[str] = None          # None으로 보내면 이미지 제거
    original_image_path: Optional[str] = None


class DiaryEntryResponse(BaseModel):
    """육아 일기 응답 형식."""
    id: int                              # 일기 고유 번호
    child_id: int                        # 어떤 아이의 일기인지
    entry_date: date                     # 일기 날짜
    mood: Optional[str]                  # 아이 기분/상태
    content: str                         # 일기 본문
    image_path: Optional[str]            # 이미지 URL
    original_image_path: Optional[str]   # 원본 이미지 URL
    created_at: datetime                 # 처음 저장한 시각

    model_config = {"from_attributes": True}
