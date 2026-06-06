# ===== 수면 기록 데이터 형식(스키마) 정의 =====

from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class SleepRecordCreate(BaseModel):
    """수면 기록 추가 요청 데이터 형식."""
    sleep_at: datetime                # 잠든 시각 (필수)
    wake_at: Optional[datetime] = None  # 깨어난 시각 - 아직 자고 있으면 비워둠 (선택)
    quality: Optional[int] = None    # 수면 품질 1~5점 - 선택 사항
    note: Optional[str] = None       # 메모 - 선택 사항


class SleepRecordUpdate(BaseModel):
    """수면 기록 수정 요청 데이터 형식. 모든 필드가 선택 사항입니다."""
    sleep_at: Optional[datetime] = None
    wake_at: Optional[datetime] = None   # 주로 이 필드를 나중에 추가로 입력
    quality: Optional[int] = None
    note: Optional[str] = None


class SleepRecordResponse(BaseModel):
    """수면 기록 응답 형식."""
    id: int                          # 기록 고유 번호
    child_id: int                    # 어떤 아이의 기록인지
    sleep_at: datetime               # 잠든 시각
    wake_at: Optional[datetime]      # 깨어난 시각 (없을 수 있음)
    quality: Optional[int]           # 수면 품질 점수
    note: Optional[str]              # 메모
    created_at: datetime             # 기록 입력 시각

    model_config = {"from_attributes": True}
