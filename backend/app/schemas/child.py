# ===== 아이 관련 데이터 형식(스키마) 정의 =====

from datetime import date, datetime
from typing import Optional  # 값이 없을 수도 있는 필드에 사용
from pydantic import BaseModel


class ChildCreate(BaseModel):
    """아이 등록 요청 데이터 형식. 이 3가지 필드가 모두 있어야 합니다."""
    name: str        # 아이 이름
    birth_date: date # 생년월일 (예: "2023-05-15")
    gender: str      # 성별: "M" = 남자, "F" = 여자


class ChildUpdate(BaseModel):
    """아이 정보 수정 요청 데이터 형식. 모든 필드가 선택 사항입니다.
    원하는 필드만 보내면 그 필드만 수정됩니다.
    """
    name: Optional[str] = None        # 이름 수정 (선택)
    birth_date: Optional[date] = None # 생년월일 수정 (선택)
    gender: Optional[str] = None      # 성별 수정 (선택)


class ChildResponse(BaseModel):
    """아이 정보 응답 형식."""
    id: int              # 아이 고유 번호
    name: str            # 아이 이름
    birth_date: date     # 생년월일
    gender: str          # 성별
    created_at: datetime # 등록 시각

    model_config = {"from_attributes": True}  # SQLAlchemy 모델 → Pydantic 변환 허용
