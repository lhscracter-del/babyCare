// Axios 기본 설정 파일 — 모든 API 요청에서 이 인스턴스를 사용합니다

import axios from 'axios'

// Axios 인스턴스를 만듭니다 (백엔드 서버 주소와 기본 설정 포함)
const api = axios.create({
  baseURL: '/api/v1', // FastAPI 서버 주소 (vite.config.js의 프록시를 통해 localhost:8000으로 전달됨)
  headers: {
    'Content-Type': 'application/json', // 데이터를 JSON 형식으로 주고받음
  },
})

// 요청을 보내기 전에 자동으로 실행됩니다 — 로그인 토큰을 헤더에 붙여줌
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token') // 저장된 토큰 꺼내기
  if (token) {
    config.headers.Authorization = `Bearer ${token}` // "Bearer 토큰값" 형태로 헤더 추가
  }
  return config
})

// 응답을 받은 후 자동으로 실행됩니다 — 401(인증 만료) 에러 처리
api.interceptors.response.use(
  (response) => response, // 정상 응답은 그대로 반환
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token') // 만료된 토큰 삭제
    }
    return Promise.reject(error)
  },
)

export default api
