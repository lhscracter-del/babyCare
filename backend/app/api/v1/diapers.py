from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db
from app.schemas.diaper_record import DiaperRecordCreate, DiaperRecordResponse
from app.services import diaper_service

router = APIRouter()


@router.get("/", response_model=list[DiaperRecordResponse])
async def list_diapers(child_id: int, db: AsyncSession = Depends(get_db)):
    return await diaper_service.get_list(db, child_id)


@router.post("/", response_model=DiaperRecordResponse, status_code=201)
async def create_diaper(child_id: int, data: DiaperRecordCreate, db: AsyncSession = Depends(get_db)):
    return await diaper_service.create(db, child_id, data)


@router.delete("/{record_id}", status_code=204)
async def delete_diaper(child_id: int, record_id: int, db: AsyncSession = Depends(get_db)):
    await diaper_service.delete(db, child_id, record_id)
