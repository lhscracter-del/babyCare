from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db
from app.schemas.vaccine_schedule import VaccineScheduleCreate, VaccineScheduleUpdate, VaccineScheduleResponse
from app.services import vaccine_service

router = APIRouter()


@router.get("/", response_model=list[VaccineScheduleResponse])
async def list_vaccines(child_id: int, db: AsyncSession = Depends(get_db)):
    return await vaccine_service.get_list(db, child_id)


@router.post("/", response_model=VaccineScheduleResponse, status_code=201)
async def create_vaccine(child_id: int, data: VaccineScheduleCreate, db: AsyncSession = Depends(get_db)):
    return await vaccine_service.create(db, child_id, data)


@router.patch("/{record_id}", response_model=VaccineScheduleResponse)
async def update_vaccine(
    child_id: int,
    record_id: int,
    data: VaccineScheduleUpdate,
    db: AsyncSession = Depends(get_db),
):
    return await vaccine_service.update(db, child_id, record_id, data)


@router.delete("/{record_id}", status_code=204)
async def delete_vaccine(child_id: int, record_id: int, db: AsyncSession = Depends(get_db)):
    await vaccine_service.delete(db, child_id, record_id)
