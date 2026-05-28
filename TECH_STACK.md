# 기술 스택 (Tech Stack)

## 📌 개요

| 구분 | 기술 |
|------|------|
| Backend | Python + FastAPI |
| Frontend | React (JavaScript) |
| 패키지 매니저 (BE) | pip / uv |
| 패키지 매니저 (FE) | npm |

---

## 🐍 Backend

### 언어 & 프레임워크

| 항목 | 버전 | 비고 |
|------|------|------|
| Python | 3.11.x | 안정화된 LTS 수준 버전 |
| FastAPI | 0.115.x | 최신 안정 버전 |
| Uvicorn | 0.30.x | ASGI 서버 (표준) |

### 주요 라이브러리

| 항목 | 버전 | 역할 |
|------|------|------|
| Pydantic | v2 (2.7.x) | 데이터 유효성 검사 / 스키마 정의 |
| SQLAlchemy | 2.0.x | ORM (비동기 지원) |
| Alembic | 1.13.x | DB 마이그레이션 |
| python-dotenv | 1.0.x | 환경 변수 관리 |
| httpx | 0.27.x | 비동기 HTTP 클라이언트 |
| passlib | 1.7.x | 패스워드 해싱 (bcrypt) |
| python-jose | 3.3.x | JWT 토큰 처리 |
| pytest | 8.x | 테스트 프레임워크 |
| pytest-asyncio | 0.23.x | 비동기 테스트 지원 |

### 데이터베이스

| 항목 | 버전 | 비고 |
|------|------|------|
| PostgreSQL | 16.x | 프로덕션 메인 DB |
| asyncpg | 0.29.x | 비동기 PostgreSQL 드라이버 |
| Redis | 7.x | 캐싱 / 세션 / 큐 |

---

## ⚛️ Frontend

### 언어 & 프레임워크

| 항목 | 버전 | 비고 |
|------|------|------|
| Node.js | 20.x LTS | 런타임 환경 |
| React | 18.3.x | UI 라이브러리 |
| JavaScript (ES2022+) | - | 타입 없는 표준 JS |

### 빌드 도구

| 항목 | 버전 | 역할 |
|------|------|------|
| Vite | 5.x | 빌드 도구 / 개발 서버 |

### 주요 라이브러리

| 항목 | 버전 | 역할 |
|------|------|------|
| React Router | v6 (6.24.x) | 클라이언트 사이드 라우팅 |
| Axios | 1.7.x | HTTP 클라이언트 |
| Zustand | 4.x | 전역 상태 관리 (경량) |
| React Query (TanStack Query) | v5 (5.x) | 서버 상태 / 캐싱 관리 |
| React Hook Form | 7.x | 폼 상태 관리 |

### 스타일링

| 항목 | 버전 | 역할 |
|------|------|------|
| Tailwind CSS | 3.4.x | 유틸리티 기반 CSS 프레임워크 |

### 테스트

| 항목 | 버전 | 역할 |
|------|------|------|
| Vitest | 1.x | 단위 테스트 (Vite 친화적) |
| React Testing Library | 16.x | 컴포넌트 테스트 |

---

## 🔗 API 통신

| 항목 | 내용 |
|------|------|
| 방식 | REST API |
| 인증 | JWT (Access Token + Refresh Token) |
| 문서화 | FastAPI 내장 Swagger UI (`/docs`) |
| CORS | FastAPI CORSMiddleware 설정 |

---

## 🐳 인프라 / 배포

| 항목 | 버전/도구 | 비고 |
|------|-----------|------|
| Docker | 26.x | 컨테이너화 |
| Docker Compose | 2.x | 로컬 / 개발 환경 오케스트레이션 |
| Nginx | 1.26.x | 리버스 프록시 / 정적 파일 서빙 |

---

## 📁 프로젝트 구조 (참고)

```
project-root/
├── backend/
│   ├── app/
│   │   ├── api/          # 라우터 (엔드포인트)
│   │   ├── core/         # 설정, 보안, 의존성
│   │   ├── models/       # SQLAlchemy 모델
│   │   ├── schemas/      # Pydantic 스키마
│   │   └── services/     # 비즈니스 로직
│   ├── alembic/          # DB 마이그레이션
│   ├── tests/
│   ├── main.py
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/          # Axios 인스턴스 / API 함수
│   │   ├── components/   # 재사용 컴포넌트
│   │   ├── hooks/        # 커스텀 훅
│   │   ├── pages/        # 페이지 컴포넌트
│   │   ├── store/        # Zustand 스토어
│   │   └── utils/
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

---

## 🔖 버전 관리 기준

- 모든 버전은 **LTS 또는 최신 안정(stable) 버전** 기준
- Python 패키지는 `requirements.txt` 또는 `pyproject.toml` 로 고정
- Frontend 패키지는 `package-lock.json` 으로 버전 고정
- 버전 업그레이드는 **Dependabot** 또는 수동 주기 검토 권장
