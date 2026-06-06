# ===== 아이 관리 서비스 =====
# 아이 등록, 조회, 수정, 삭제 로직을 처리합니다.
# 아이를 삭제할 때는 관련된 모든 기록(수유, 수면, 일기 등)도 함께 삭제합니다.

from pathlib import Path  # 파일 경로 처리

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete  # select: 조회 / delete: 삭제 쿼리
from fastapi import HTTPException, status

# 관련된 모든 기록 모델 (아이 삭제 시 함께 삭제할 테이블들)
from app.models.child import Child
from app.models.feed_record import FeedRecord
from app.models.sleep_record import SleepRecord
from app.models.growth_record import GrowthRecord
from app.models.vaccine_schedule import VaccineSchedule
from app.models.diary_entry import DiaryEntry
from app.schemas.child import ChildCreate, ChildUpdate

# 일기 이미지 파일이 저장된 로컬 폴더 경로
# __file__ = 현재 파일 경로 기준으로 상위 폴더를 거슬러 올라가서 uploads/diaries 찾기
DIARY_UPLOAD_DIR = Path(__file__).parent.parent.parent / "uploads" / "diaries"


async def get_all(db: AsyncSession, user_id: int) -> list[Child]:
    """현재 로그인한 사용자(user_id)의 모든 아이 목록을 최신순으로 반환합니다."""
    result = await db.execute(
        select(Child).where(Child.user_id == user_id).order_by(Child.created_at.desc())
    )
    return list(result.scalars().all())


async def get_by_id(db: AsyncSession, child_id: int, user_id: int) -> Child:
    """특정 아이 ID로 아이 정보를 조회합니다.

    해당 아이가 없거나 현재 사용자의 아이가 아니면 404 에러를 반환합니다.
    """
    result = await db.execute(
        select(Child).where(Child.id == child_id, Child.user_id == user_id)
    )
    child = result.scalar_one_or_none()
    if not child:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Child not found")
    return child


async def create(db: AsyncSession, user_id: int, data: ChildCreate) -> Child:
    """새 아이를 등록합니다.

    data.model_dump()로 요청 데이터를 딕셔너리로 변환 후 Child 객체 생성에 넣습니다.
    **로 딕셔너리를 키워드 인자로 풀어서 전달 (파이썬 문법)
    """
    child = Child(user_id=user_id, **data.model_dump())
    db.add(child)
    await db.commit()
    await db.refresh(child)
    return child


async def update(db: AsyncSession, child_id: int, user_id: int, data: ChildUpdate) -> Child:
    """아이 정보를 수정합니다.

    exclude_unset=True: 요청에서 전달된 필드만 업데이트 (나머지는 그대로 유지)
    setattr(객체, 필드명, 값): 파이썬에서 동적으로 속성값을 변경하는 방법
    """
    child = await get_by_id(db, child_id, user_id)
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(child, key, value)  # 예: child.name = "새이름"
    await db.commit()
    await db.refresh(child)
    return child


async def delete_child(db: AsyncSession, child_id: int, user_id: int) -> None:
    """아이와 해당 아이의 모든 관련 데이터를 삭제합니다.

    삭제 순서:
    1. 일기에 첨부된 이미지 파일 삭제 (로컬 파일 또는 Cloudinary)
    2. 관련 기록 테이블들에서 해당 아이 데이터 삭제
    3. 아이 정보 삭제
    """
    child = await get_by_id(db, child_id, user_id)

    # 일기에 첨부된 이미지 파일 경로 조회 (크롭 이미지, 원본 이미지 모두)
    result = await db.execute(
        select(DiaryEntry.image_path, DiaryEntry.original_image_path).where(
            DiaryEntry.child_id == child_id,
        )
    )
    # 각 이미지 파일을 실제로 삭제
    for (image_path, original_image_path) in result.fetchall():
        for path in (image_path, original_image_path):
            if not path:
                continue  # 이미지가 없으면 건너뜀
            filename = path.rsplit("/", 1)[-1]  # URL에서 파일명만 추출
            file_path = DIARY_UPLOAD_DIR / filename
            if file_path.exists():
                file_path.unlink()  # 파일 삭제

    # 아이와 연관된 모든 기록 삭제 (수유, 수면, 성장, 백신, 일기)
    for model in [FeedRecord, SleepRecord, GrowthRecord, VaccineSchedule, DiaryEntry]:
        await db.execute(delete(model).where(model.child_id == child_id))

    # 마지막으로 아이 자체 삭제
    await db.delete(child)
    await db.commit()
