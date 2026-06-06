# ===== 기저귀 교체 기록 데이터 형식(스키마) 정의 =====

from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class DiaperRecordCreate(BaseModel):
    """기저귀 교체 기록 추가 요청 데이터 형식."""
    type: str                      # 종류: "pee"(소변), "poo"(대변), "both"(소변+대변)
    changed_at: datetime           # 교체 시각 (필수)
    note: Optional[str] = None     # 메모 - 선택 사항


class DiaperRecordResponse(BaseModel):
    """기저귀 교체 기록 응답 형식."""
    id: int              # 기록 고유 번호
    child_id: int        # 어떤 아이의 기록인지
    type: str            # 기저귀 종류
    changed_at: datetime # 교체 시각
    note: Optional[str]  # 메모
    created_at: datetime # 기록 입력 시각

    model_config = {"from_attributes": True}
