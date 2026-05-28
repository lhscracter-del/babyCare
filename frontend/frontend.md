# Frontend 기술 스택 — 육아 관리 앱

비전공자도 이해할 수 있게 코드마다  한국어 주석을 쉽게 달아줘

## 언어 & 프레임워크

| 항목 | 버전 | 비고 |
|------|------|------|
| Node.js | 20.x LTS | 런타임 환경 |
| React | 18.3.x | UI 라이브러리 |
| JavaScript (ES2022+) | - | 타입 없는 표준 JS |

## 패키지 매니저

- `npm`
- 버전은 `package-lock.json`으로 고정

## 빌드 도구

| 항목 | 버전 | 역할 |
|------|------|------|
| Vite | 5.x | 빌드 도구 / 개발 서버 |

## 주요 라이브러리

| 항목 | 버전 | 역할 |
|------|------|------|
| React Router | v6 (6.24.x) | 클라이언트 사이드 라우팅 |
| Axios | 1.7.x | HTTP 클라이언트 |
| Zustand | 4.x | 전역 상태 관리 (경량) |
| TanStack Query | v5 (5.x) | 서버 상태 / 캐싱 관리 |
| React Hook Form | 7.x | 폼 상태 관리 |

## 스타일링

| 항목 | 버전 | 역할 |
|------|------|------|
| Tailwind CSS | 3.4.x | 유틸리티 기반 CSS 프레임워크 |

## 테스트

| 항목 | 버전 | 역할 |
|------|------|------|
| Vitest | 1.x | 단위 테스트 (Vite 친화적) |
| React Testing Library | 16.x | 컴포넌트 테스트 |

## 화면 구성 (Pages)

육아 관리 앱의 기능 단위에 맞춰 아래 페이지로 구성합니다.

| 페이지 | 경로 | 설명 |
|--------|------|------|
| 홈 (대시보드) | `/` | 오늘 수유 횟수, 수면 시간, 최근 몸무게, 다가오는 예방접종 요약 |
| 수유/식사 | `/feed` | 수유 기록 추가 및 오늘 기록 목록 (종류·양·시간) |
| 수면 | `/sleep` | 취침·기상 시간 기록, 수면 시간 자동 계산, 수면 품질 |
| 성장 | `/growth` | 키·몸무게·머리둘레 기록, 성장 추이 차트 |
| 예방접종 | `/vaccine` | 국가 필수 접종 체크리스트, 커스텀 접종 추가 |
| 일기 | `/diary` | 날짜·감정·내용 작성, 일기 목록 |

## 상태 관리 전략

| 상태 유형 | 도구 | 대상 |
|-----------|------|------|
| 서버 상태 | TanStack Query | 수유·수면·성장·예방접종·일기 API 데이터 |
| 전역 클라이언트 상태 | Zustand | 로그인 사용자 정보, 선택된 아이 정보 |
| 로컬 폼 상태 | React Hook Form | 각 기록 입력 폼 (수유 추가, 성장 추가 등) |

## 프로젝트 구조

```
frontend/
├── public/
├── src/
│   ├── api/
│   │   ├── axios.js          # Axios 인스턴스 / 인터셉터
│   │   ├── feedApi.js        # 수유/식사 API
│   │   ├── sleepApi.js       # 수면 API
│   │   ├── growthApi.js      # 성장 API
│   │   ├── vaccineApi.js     # 예방접종 API
│   │   └── diaryApi.js       # 일기 API
│   │
│   ├── components/
│   │   ├── common/           # 공통 컴포넌트 (Button, Badge, Card 등)
│   │   ├── feed/             # 수유 관련 컴포넌트
│   │   ├── sleep/            # 수면 관련 컴포넌트
│   │   ├── growth/           # 성장 차트 등
│   │   ├── vaccine/          # 예방접종 체크리스트
│   │   └── diary/            # 일기 목록·작성 폼
│   │
│   ├── hooks/
│   │   ├── useFeed.js        # 수유 기록 훅
│   │   ├── useSleep.js       # 수면 기록 훅
│   │   ├── useGrowth.js      # 성장 기록 훅
│   │   ├── useVaccine.js     # 예방접종 훅
│   │   └── useDiary.js       # 일기 훅
│   │
│   ├── pages/
│   │   ├── HomePage.jsx      # 대시보드
│   │   ├── FeedPage.jsx      # 수유/식사
│   │   ├── SleepPage.jsx     # 수면
│   │   ├── GrowthPage.jsx    # 성장
│   │   ├── VaccinePage.jsx   # 예방접종
│   │   └── DiaryPage.jsx     # 일기
│   │
│   ├── store/
│   │   ├── authStore.js      # 로그인 사용자 상태
│   │   └── childStore.js     # 선택된 아이 상태
│   │
│   └── utils/
│       ├── dateUtils.js      # 날짜 포맷 유틸
│       └── timeUtils.js      # 수면 시간 계산 등
│
├── index.html
├── vite.config.js
└── package.json
```
