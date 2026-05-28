# Backend 기술 스택 — 육아 관리 앱

비전공자도 이해할 수 있게 코드마다  한국어 주석을 쉽게 달아줘

## 언어 & 프레임워크

| 항목 | 버전 | 비고 |
|------|------|------|
| Python | 3.11.x | 안정화된 LTS 수준 버전 |
| FastAPI | 0.115.x | 최신 안정 버전 |
| Uvicorn | 0.30.x | ASGI 서버 (표준) |

## 서버 실행 방법

### 1. 가상환경 생성 및 패키지 설치 (최초 1회)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. 서버 실행

```bash
# 가상환경 활성화
source .venv/bin/activate

# 개발 서버 실행 (코드 변경 시 자동 재시작)
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. 접속 주소

| 항목 | 주소 |
|------|------|
| API 서버 | http://localhost:8000 |
| Swagger UI (API 문서) | http://localhost:8000/docs |
| Health Check | http://localhost:8000/health |

### 4. 서버 종료

```bash
# 터미널에서 Ctrl + C
```

---

## 패키지 매니저

- `pip` / `uv`
- 버전은 `requirements.txt` 또는 `pyproject.toml`로 고정

## 주요 라이브러리

| 항목 | 버전 | 역할 |
|------|------|------|
| Pydantic | v2 (2.7.x) | 데이터 유효성 검사 / 스키마 정의 |
| SQLAlchemy | 2.0.x | ORM (비동기 지원) |
| Alembic | 1.13.x | DB 마이그레이션 |
| python-dotenv | 1.0.x | 환경 변수 관리 |
| httpx | 0.27.x | 비동기 HTTP 클라이언트 |
| passlib | 1.7.x | 패스워드 해싱 (bcrypt) |
| python-jose | 3.3.x | JWT 토큰 처리 |

## 테스트

| 항목 | 버전 | 역할 |
|------|------|------|
| pytest | 8.x | 테스트 프레임워크 |
| pytest-asyncio | 0.23.x | 비동기 테스트 지원 |

## 데이터베이스

| 항목 | 버전 | 비고 |
|------|------|------|
| SQLite | 3.x | 메인 DB (파일 기반, 별도 서버 불필요) |
| aiosqlite | 0.20.x | 비동기 SQLite 드라이버 |

> PostgreSQL 대신 SQLite를 사용합니다. 서버 설치 없이 `.db` 파일 하나로 운영되며, SQLAlchemy + aiosqlite 조합으로 비동기 처리를 지원합니다. Redis는 사용하지 않습니다.

## API 통신

| 항목 | 내용 |
|------|------|
| 방식 | REST API |
| 인증 | JWT (Access Token + Refresh Token) |
| 문서화 | FastAPI 내장 Swagger UI (`/docs`) |
| CORS | FastAPI CORSMiddleware 설정 |

## 인프라 / 배포

| 항목 | 버전 | 비고 |
|------|------|------|
| Docker | 26.x | 컨테이너화 |
| Docker Compose | 2.x | 로컬 / 개발 환경 오케스트레이션 |
| Nginx | 1.26.x | 리버스 프록시 / 정적 파일 서빙 |

## 도메인 모델 (육아 관리)

육아 관리 앱의 핵심 도메인을 기준으로 아래 모델 및 API를 구성합니다.

### 주요 도메인 엔티티

| 모델 | 설명 |
|------|------|
| `Child` | 아이 정보 (이름, 생년월일, 성별) |
| `FeedRecord` | 수유/식사 기록 (종류: 모유·분유·이유식·간식·물, 양, 시간) |
| `SleepRecord` | 수면 기록 (취침 시간, 기상 시간, 수면 품질) |
| `GrowthRecord` | 성장 기록 (키, 몸무게, 머리둘레, 측정일) |
| `VaccineSchedule` | 예방접종 일정 (접종명, 예정일, 완료 여부) |
| `DiaryEntry` | 일과 메모/일기 (날짜, 감정, 내용) |

### API 엔드포인트 구조 (예시)

```
/api/v1/
├── auth/
│   ├── POST   /login
│   ├── POST   /logout
│   └── POST   /refresh
│
├── children/
│   ├── GET    /              # 아이 목록
│   ├── POST   /              # 아이 등록
│   └── GET    /{child_id}    # 아이 상세
│
├── children/{child_id}/
│   ├── feeds/
│   │   ├── GET    /          # 수유 기록 목록 (날짜 필터)
│   │   └── POST   /          # 수유 기록 추가
│   │
│   ├── sleeps/
│   │   ├── GET    /          # 수면 기록 목록
│   │   └── POST   /          # 수면 기록 추가
│   │
│   ├── growths/
│   │   ├── GET    /          # 성장 기록 목록
│   │   └── POST   /          # 성장 기록 추가
│   │
│   ├── vaccines/
│   │   ├── GET    /          # 예방접종 목록
│   │   ├── POST   /          # 커스텀 접종 추가
│   │   └── PATCH  /{id}      # 완료 처리
│   │
│   └── diaries/
│       ├── GET    /          # 일기 목록
│       └── POST   /          # 일기 작성
```

## 프로젝트 구조

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── auth.py
│   │       ├── children.py
│   │       ├── feeds.py
│   │       ├── sleeps.py
│   │       ├── growths.py
│   │       ├── vaccines.py
│   │       └── diaries.py
│   ├── core/         # 설정, 보안, 의존성
│   ├── models/
│   │   ├── child.py
│   │   ├── feed_record.py
│   │   ├── sleep_record.py
│   │   ├── growth_record.py
│   │   ├── vaccine_schedule.py
│   │   └── diary_entry.py
│   ├── schemas/      # Pydantic 스키마 (모델별 동일 구조)
│   └── services/     # 비즈니스 로직
│       ├── feed_service.py
│       ├── sleep_service.py
│       ├── growth_service.py
│       ├── vaccine_service.py
│       └── diary_service.py
├── alembic/          # DB 마이그레이션
├── tests/
├── main.py
└── requirements.txt
```
