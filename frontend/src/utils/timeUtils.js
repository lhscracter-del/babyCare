// 시간/수면 관련 유틸리티 함수 모음

// 두 시간 사이의 차이를 "3시간 25분" 형태로 계산합니다
export function formatDuration(startStr, endStr) {
  if (!startStr || !endStr) return '-'
  const start = new Date(startStr)
  const end = new Date(endStr)
  const diffMs = Math.max(0, end - start) // 밀리초 단위 차이 (음수 방지)
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  if (hours === 0) return `${minutes}분`
  return minutes > 0 ? `${hours}시간 ${minutes}분` : `${hours}시간`
}

// 오늘의 총 수면 시간을 계산합니다 (기록 배열을 받아서 합산)
export function calcTodaySleepHours(sleepRecords) {
  const today = new Date().toDateString()
  const totalMs = sleepRecords
    .filter((r) => r.wake_at && new Date(r.sleep_at).toDateString() === today)
    .reduce((sum, r) => sum + (new Date(r.wake_at) - new Date(r.sleep_at)), 0)
  return (totalMs / (1000 * 60 * 60)).toFixed(1) // 소수점 1자리 시간 단위로 반환
}

// 밀리초를 "3시간 25분" 형태로 변환합니다 (총 수면 시간 표시에 사용)
export function formatMs(ms) {
  if (!ms || ms <= 0) return '-'
  const hours = Math.floor(ms / (1000 * 60 * 60))
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
  if (hours === 0) return `${minutes}분`
  return minutes > 0 ? `${hours}시간 ${minutes}분` : `${hours}시간`
}

// 수면 품질 숫자를 텍스트로 변환합니다 (1=매우나쁨, 5=매우좋음)
export function formatQuality(quality) {
  const map = { 1: '😫 매우 나쁨', 2: '😞 나쁨', 3: '😐 보통', 4: '😊 좋음', 5: '😄 매우 좋음' }
  return map[quality] || '-'
}
