# ===== 예방접종 일정 데이터 형식(스키마) 정의 =====

from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel


class VaccineScheduleCreate(BaseModel):
    """예방접종 일정 등록 요청 데이터 형식."""
    vaccine_name: str   # 예방접종 이름 (예: "BCG", "B형간염 1차", "DTaP 1차")
    scheduled_at: date  # 예정된 접종 날짜


class VaccineScheduleUpdate(BaseModel):
    """예방접종 일정 수정 요청 데이터 형식. 모든 필드가 선택 사항입니다.

    주로 접종 완료 처리 시:
    is_completed=True, completed_at=실제접종날짜 로 보냅니다.
    """
    vaccine_name: Optional[str] = None       # 접종명 수정 (선택)
    scheduled_at: Optional[date] = None      # 예정일 수정 (선택)
    is_completed: Optional[bool] = None      # 완료 여부 변경 (True = 완료)
    completed_at: Optional[date] = None      # 실제 접종 완료일 (선택)


class VaccineScheduleResponse(BaseModel):
    """예방접종 일정 응답 형식."""
    id: int                        # 일정 고유 번호
    child_id: int                  # 어떤 아이의 일정인지
    vaccine_name: str              # 예방접종 이름
    scheduled_at: date             # 예정일
    is_completed: bool             # 완료 여부 (False = 미완료, True = 완료)
    completed_at: Optional[date]   # 실제 완료일 (완료 전엔 null)
    created_at: datetime           # 일정 등록 시각

    model_config = {"from_attributes": True}
