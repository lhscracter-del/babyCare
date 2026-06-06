# ===== 수유 기록 데이터 형식(스키마) 정의 =====

from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class FeedRecordCreate(BaseModel):
    """수유 기록 추가 요청 데이터 형식."""
    # 수유 종류: "breast"(모유), "formula"(분유), "baby_food"(이유식), "snack"(간식), "water"(물)
    feed_type: str
    amount: Optional[float] = None    # 섭취량 (ml 또는 g) - 선택 사항
    fed_at: datetime                  # 먹인 시각
    note: Optional[str] = None        # 메모 - 선택 사항


class FeedRecordUpdate(BaseModel):
    """수유 기록 수정 요청 데이터 형식. 모든 필드가 선택 사항입니다."""
    feed_type: Optional[str] = None
    amount: Optional[float] = None
    fed_at: Optional[datetime] = None
    note: Optional[str] = None


class FeedRecordResponse(BaseModel):
    """수유 기록 응답 형식."""
    id: int                       # 기록 고유 번호
    child_id: int                 # 어떤 아이의 기록인지
    feed_type: str                # 수유 종류
    amount: Optional[float]       # 섭취량
    fed_at: datetime              # 먹인 시각
    note: Optional[str]           # 메모
    created_at: datetime          # 기록 입력 시각

    model_config = {"from_attributes": True}
