from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db
from app.schemas.growth_record import GrowthRecordCreate, GrowthRecordUpdate, GrowthRecordResponse
from app.services import growth_service

router = APIRouter()


@router.get("/", response_model=list[GrowthRecordResponse])
async def list_growths(child_id: int, db: AsyncSession = Depends(get_db)):
    return await growth_service.get_list(db, child_id)


@router.post("/", response_model=GrowthRecordResponse, status_code=201)
async def create_growth(child_id: int, data: GrowthRecordCreate, db: AsyncSession = Depends(get_db)):
    return await growth_service.create(db, child_id, data)


@router.patch("/{record_id}", response_model=GrowthRecordResponse)
async def update_growth(child_id: int, record_id: int, data: GrowthRecordUpdate, db: AsyncSession = Depends(get_db)):
    return await growth_service.update(db, child_id, record_id, data)


@router.delete("/{record_id}", status_code=204)
async def delete_growth(child_id: int, record_id: int, db: AsyncSession = Depends(get_db)):
    await growth_service.delete(db, child_id, record_id)
