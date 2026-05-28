// 수면 기록 페이지 — 캘린더로 날짜를 선택해서 해당 날의 수면 기록을 봅니다

import { useState } from 'react'
import Card from '../components/common/Card'
import Calendar from '../components/common/Calendar'
import SleepForm from '../components/sleep/SleepForm'
import SleepList from '../components/sleep/SleepList'
import { useSleep } from '../hooks/useSleep'
import { formatMs } from '../utils/timeUtils'
import { todayString, formatDate } from '../utils/dateUtils'

// datetime 문자열에서 날짜 부분만 추출합니다
// 예: "2024-01-15T22:00:00" → "2024-01-15"
function extractDate(datetimeStr) {
  if (!datetimeStr) return ''
  return datetimeStr.slice(0, 10)
}

export default function SleepPage() {
  const { sleepsQuery, addSleep, editSleep, removeSleep } = useSleep()
  const [showForm, setShowForm] = useState(false)

  // 캘린더에서 선택된 날짜 (기본값: 오늘)
  const [selectedDate, setSelectedDate] = useState(todayString())

  const sleeps = sleepsQuery.data || []

  // 기록이 있는 날짜 목록 → 캘린더에 점(dot)으로 표시됩니다
  const markedDates = [...new Set(sleeps.map((s) => extractDate(s.sleep_at)))]

  // 선택된 날짜의 수면 기록만 걸러냅니다
  const selectedSleeps = sleeps.filter((s) => extractDate(s.sleep_at) === selectedDate)

  // 선택된 날의 총 수면 시간 (기상 시간이 있는 기록만 합산)
  const totalSleepMs = selectedSleeps
    .filter((s) => s.wake_at)
    .reduce((sum, s) => sum + (new Date(s.wake_at) - new Date(s.sleep_at)), 0)

  const handleSubmit = async (data) => {
    await addSleep.mutateAsync(data)
    setShowForm(false)
    setSelectedDate(data.sleep_at.slice(0, 10))
  }

  const handleEdit = (recordId, data) => editSleep.mutateAsync({ recordId, data })
  const handleDelete = (recordId) => removeSleep.mutateAsync(recordId)

  return (
    <div className="space-y-4">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">😴 수면</h2>
          <p className="text-sm text-gray-400">날짜를 선택해서 기록을 확인해요</p>
        </div>
        {/* 기록 추가 버튼 */}
        <button
          onClick={() => setShowForm((v) => !v)}
          className="w-10 h-10 bg-indigo-500 text-white rounded-full text-xl flex items-center justify-center shadow-md hover:bg-indigo-600 transition-colors"
        >
          {showForm ? '✕' : '+'}
        </button>
      </div>

      {/* 수면 기록 입력 폼 */}
      {showForm && (
        <Card>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">수면 기록 추가</h3>
          <SleepForm onSubmit={handleSubmit} isLoading={addSleep.isPending} />
        </Card>
      )}

      {/* 캘린더 카드 — 작성 폼이 열려있을 때는 숨김 */}
      {!showForm && (
        <Card>
          {sleepsQuery.isLoading ? (
            <p className="text-center text-gray-400 text-sm py-6">불러오는 중...</p>
          ) : (
            <>
              <Calendar
                markedDates={markedDates}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                dotColor="bg-indigo-400"
              />
              {markedDates.length > 0 && (
                <p className="text-center text-xs text-gray-400 mt-3">
                  총 {sleeps.length}개 기록 · {markedDates.length}일
                </p>
              )}
            </>
          )}
        </Card>
      )}

      {/* 선택된 날짜의 수면 기록 */}
      <Card>
        {/* 카드 헤더: 날짜 + 총 수면 시간 */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">
            {formatDate(selectedDate)}
          </h3>
          {totalSleepMs > 0 && (
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
              총 {formatMs(totalSleepMs)}
            </span>
          )}
        </div>

        {/* 해당 날 수면 기록 목록 */}
        {selectedSleeps.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-4">
            이 날은 수면 기록이 없어요.
          </p>
        ) : (
          <SleepList sleeps={selectedSleeps} hideEmpty onEdit={handleEdit} onDelete={handleDelete} />
        )}
      </Card>
    </div>
  )
}
