// Axios 기본 설정 파일 — 모든 API 요청에서 이 인스턴스를 사용합니다

import axios from 'axios'

// 배포 환경은 VITE_API_URL, 로컬 개발 환경은 Vite 프록시(/api/v1) 사용
const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/v1`
  : '/api/v1'

// Axios 인스턴스를 만듭니다 (백엔드 서버 주소와 기본 설정 포함)
const api = axios.create({
  baseURL,
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
