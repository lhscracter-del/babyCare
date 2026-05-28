from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db
from app.schemas.sleep_record import SleepRecordCreate, SleepRecordUpdate, SleepRecordResponse
from app.services import sleep_service

router = APIRouter()


@router.get("/", response_model=list[SleepRecordResponse])
async def list_sleeps(child_id: int, db: AsyncSession = Depends(get_db)):
    return await sleep_service.get_list(db, child_id)


@router.post("/", response_model=SleepRecordResponse, status_code=201)
async def create_sleep(child_id: int, data: SleepRecordCreate, db: AsyncSession = Depends(get_db)):
    return await sleep_service.create(db, child_id, data)


@router.patch("/{record_id}", response_model=SleepRecordResponse)
async def update_sleep(child_id: int, record_id: int, data: SleepRecordUpdate, db: AsyncSession = Depends(get_db)):
    return await sleep_service.update(db, child_id, record_id, data)


@router.delete("/{record_id}", status_code=204)
async def delete_sleep(child_id: int, record_id: int, db: AsyncSession = Depends(get_db)):
    await sleep_service.delete(db, child_id, record_id)
