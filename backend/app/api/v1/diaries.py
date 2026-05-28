from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db
from app.schemas.diary_entry import DiaryEntryCreate, DiaryEntryUpdate, DiaryEntryResponse
from app.services import diary_service

router = APIRouter()


@router.get("/", response_model=list[DiaryEntryResponse])
async def list_diaries(child_id: int, db: AsyncSession = Depends(get_db)):
    return await diary_service.get_list(db, child_id)


@router.post("/", response_model=DiaryEntryResponse, status_code=201)
async def create_diary(child_id: int, data: DiaryEntryCreate, db: AsyncSession = Depends(get_db)):
    return await diary_service.create(db, child_id, data)


@router.patch("/{record_id}", response_model=DiaryEntryResponse)
async def update_diary(child_id: int, record_id: int, data: DiaryEntryUpdate, db: AsyncSession = Depends(get_db)):
    return await diary_service.update(db, child_id, record_id, data)


@router.delete("/{record_id}", status_code=204)
async def delete_diary(child_id: int, record_id: int, db: AsyncSession = Depends(get_db)):
    await diary_service.delete(db, child_id, record_id)
