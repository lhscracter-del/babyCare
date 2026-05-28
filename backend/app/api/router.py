from fastapi import APIRouter, Depends

from app.api.v1 import auth, children, feeds, sleeps, growths, vaccines, diaries, upload, diapers
from app.core.dependencies import verify_child_owner

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(children.router, prefix="/children", tags=["children"])
api_router.include_router(feeds.router, prefix="/children/{child_id}/feeds", tags=["feeds"],
                          dependencies=[Depends(verify_child_owner)])
api_router.include_router(sleeps.router, prefix="/children/{child_id}/sleeps", tags=["sleeps"],
                          dependencies=[Depends(verify_child_owner)])
api_router.include_router(growths.router, prefix="/children/{child_id}/growths", tags=["growths"],
                          dependencies=[Depends(verify_child_owner)])
api_router.include_router(vaccines.router, prefix="/children/{child_id}/vaccines", tags=["vaccines"],
                          dependencies=[Depends(verify_child_owner)])
api_router.include_router(diaries.router, prefix="/children/{child_id}/diaries", tags=["diaries"],
                          dependencies=[Depends(verify_child_owner)])
api_router.include_router(diapers.router, prefix="/children/{child_id}/diapers", tags=["diapers"],
                          dependencies=[Depends(verify_child_owner)])
api_router.include_router(upload.router, tags=["upload"])
