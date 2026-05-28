// 날짜 관련 유틸리티 함수 모음

// 날짜를 "2024년 1월 15일" 형태로 변환합니다
export function formatDate(dateStr) {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
}

// 날짜시간을 "오전 10:30" 형태로 변환합니다
export function formatTime(dateStr) {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
}

// 날짜시간을 "1월 15일 오전 10:30" 형태로 변환합니다
export function formatDateTime(dateStr) {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('ko-KR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// 오늘 날짜인지 확인합니다
export function isToday(dateStr) {
  if (!dateStr) return false
  const date = new Date(dateStr)
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

// 오늘 날짜를 "YYYY-MM-DD" 형태로 반환합니다 (날짜 입력 필드에 사용)
export function todayString() {
  return new Date().toISOString().split('T')[0]
}

// 현재 날짜/시간을 datetime-local 입력에 맞는 형태로 반환합니다
export function nowLocalString() {
  const now = new Date()
  // 한국 시간대 오프셋 보정
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 16)
}

// 생년월일로 나이(개월 수)를 계산합니다
export function calcAgeMonths(birthDateStr) {
  if (!birthDateStr) return 0
  const birth = new Date(birthDateStr)
  const today = new Date()
  const months =
    (today.getFullYear() - birth.getFullYear()) * 12 +
    (today.getMonth() - birth.getMonth())
  return Math.max(0, months)
}

// 나이를 표시합니다 — 36개월 미만은 개월 수로, 이상은 살(년)로
export function formatAge(birthDateStr) {
  const months = calcAgeMonths(birthDateStr)
  if (months < 36) return `${months}개월`
  const years = Math.floor(months / 12)
  const remainMonths = months % 12
  return remainMonths > 0 ? `${years}살 ${remainMonths}개월` : `${years}살`
}
