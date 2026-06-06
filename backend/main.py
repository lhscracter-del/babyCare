# ===== 서버 시작 파일 =====
# 이 파일이 백엔드 서버의 "입구"입니다.
# FastAPI 앱을 만들고, CORS 설정, 라우터 연결 등을 여기서 합니다.

from contextlib import asynccontextmanager  # 서버 시작/종료 시 실행할 코드를 묶어주는 도구
from pathlib import Path                    # 파일 경로를 다루는 도구

from fastapi import FastAPI                              # 웹 서버 프레임워크
from fastapi.middleware.cors import CORSMiddleware       # 프론트엔드가 백엔드에 요청할 수 있도록 허용하는 설정
from fastapi.staticfiles import StaticFiles             # 이미지 등 정적 파일을 URL로 제공하는 기능

from app.core.config import settings         # 환경설정 값 (DB 주소, 시크릿 키 등)
from app.core.database import create_tables  # 앱 시작 시 데이터베이스 테이블을 생성하는 함수
from app.api.router import api_router        # 모든 API 경로를 한곳에 모은 라우터

# 이미지 업로드 파일이 저장될 폴더 경로 설정 (없으면 자동으로 생성)
UPLOAD_DIR = Path(__file__).parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)


# 서버가 시작될 때 자동으로 실행되는 함수
# "yield" 전 = 서버 시작 시 실행 / "yield" 후 = 서버 종료 시 실행
@asynccontextmanager
async def lifespan(app: FastAPI):  # noqa: ARG001
    await create_tables()  # 서버 시작 시 DB 테이블이 없으면 생성
    yield


# FastAPI 앱 객체 생성 (웹 서버의 본체)
app = FastAPI(
    title=settings.PROJECT_NAME,   # API 문서에 표시될 이름
    version=settings.VERSION,      # API 버전
    docs_url="/docs",              # 자동 생성되는 API 명세서 주소 (/docs)
    redoc_url="/redoc",            # 다른 형태의 API 명세서 주소 (/redoc)
    lifespan=lifespan,             # 시작/종료 시 실행할 함수 연결
)

# CORS 설정: 허용된 주소에서 오는 요청만 받아들임
# 프론트엔드가 다른 포트(5173)에서 실행될 때 백엔드에 요청할 수 있게 허용
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,  # 허용할 프론트엔드 주소 목록
    allow_credentials=True,               # 쿠키/인증 정보 포함 요청 허용
    allow_methods=["*"],                  # 모든 HTTP 메서드 허용 (GET, POST, PUT 등)
    allow_headers=["*"],                  # 모든 헤더 허용
)

# 모든 API 경로를 "/api/v1" 앞에 붙여서 등록
# 예: /api/v1/auth/login, /api/v1/children 등
app.include_router(api_router, prefix="/api/v1")

# 업로드된 이미지를 URL로 접근할 수 있게 정적 파일로 제공
# 예: /api/uploads/diaries/파일명.jpg 로 이미지에 접근 가능
app.mount("/api/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")


# 서버가 정상적으로 실행 중인지 확인하는 엔드포인트
# /health 로 요청하면 {"status": "ok"} 응답 반환
@app.get("/health")
async def health_check():
    return {"status": "ok"}
