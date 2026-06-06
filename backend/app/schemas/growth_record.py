# ===== 성장 기록 데이터 형식(스키마) 정의 =====

from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel


class GrowthRecordCreate(BaseModel):
    """성장 기록 추가 요청 데이터 형식.
    키, 몸무게, 머리둘레 중 하나 이상을 입력합니다.
    """
    height: Optional[float] = None              # 키 (cm) - 선택 사항
    weight: Optional[float] = None              # 몸무게 (kg) - 선택 사항
    head_circumference: Optional[float] = None  # 머리둘레 (cm) - 선택 사항
    measured_at: date                           # 측정한 날짜 (필수)


class GrowthRecordUpdate(BaseModel):
    """성장 기록 수정 요청 데이터 형식. 모든 필드가 선택 사항입니다."""
    height: Optional[float] = None
    weight: Optional[float] = None
    head_circumference: Optional[float] = None
    measured_at: Optional[date] = None


class GrowthRecordResponse(BaseModel):
    """성장 기록 응답 형식."""
    id: int                              # 기록 고유 번호
    child_id: int                        # 어떤 아이의 기록인지
    height: Optional[float]              # 키 (cm)
    weight: Optional[float]              # 몸무게 (kg)
    head_circumference: Optional[float]  # 머리둘레 (cm)
    measured_at: date                    # 측정 날짜
    created_at: datetime                 # 기록 입력 시각

    model_config = {"from_attributes": True}
