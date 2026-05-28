// 예방접종 페이지 — 캘린더로 날짜를 선택해서 해당 날의 접종 일정을 봅니다

import { useState, useMemo } from 'react'
import Card from '../components/common/Card'
import Calendar from '../components/common/Calendar'
import VaccineForm from '../components/vaccine/VaccineForm'
import VaccineList from '../components/vaccine/VaccineList'
import { useVaccine } from '../hooks/useVaccine'
import { todayString, formatDate } from '../utils/dateUtils'

// 날짜별 접종 상태 → 캘린더 점 색상 결정
// 완료: bg-green-400 / 지남(미완료): bg-red-400 / 예정: bg-purple-400
function calcDotColor(vaccines, dateStr, todayStr) {
  const onDate = vaccines.filter((v) => v.scheduled_at === dateStr)
  if (onDate.length === 0) return null

  const allDone = onDate.every((v) => v.is_completed)
  if (allDone) return 'bg-green-400'

  const isPast = dateStr < todayStr
  if (isPast) return 'bg-red-400' // 지났는데 미완료

  return 'bg-purple-400' // 앞으로 예정
}

export default function VaccinePage() {
  const { vaccinesQuery, addVaccine, completeVaccine, editVaccine, removeVaccine } = useVaccine()
  const [showForm, setShowForm] = useState(false)

  // 캘린더에서 선택된 날짜 (기본값: 오늘)
  const [selectedDate, setSelectedDate] = useState(todayString())

  const vaccines = vaccinesQuery.data || []
  const todayStr = todayString()

  // 완료된 접종 수 / 전체 수
  const completedCount = vaccines.filter((v) => v.is_completed).length
  const totalCount = vaccines.length

  // 날짜별 점 색상 맵 — { "YYYY-MM-DD": "bg-green-400" | "bg-red-400" | "bg-purple-400" }
  const markedDatesMap = useMemo(() => {
    const map = {}
    vaccines.forEach((v) => {
      if (!v.scheduled_at) return
      const color = calcDotColor(vaccines, v.scheduled_at, todayStr)
      if (color) map[v.scheduled_at] = color
    })
    return map
  }, [vaccines, todayStr])

  // 선택된 날짜의 접종 기록만 걸러냅니다
  const selectedVaccines = vaccines.filter((v) => v.scheduled_at === selectedDate)

  // 폼 제출 — 새 접종 일정 추가
  const handleSubmit = async (data) => {
    await addVaccine.mutateAsync(data)
    setShowForm(false)
    // 추가한 접종 예정일로 캘린더를 이동
    setSelectedDate(data.scheduled_at)
  }

  const handleComplete = async (vaccine) => {
    await completeVaccine.mutateAsync({
      recordId: vaccine.id,
      data: {
        is_completed: !vaccine.is_completed,
        completed_at: !vaccine.is_completed ? todayString() : null,
      },
    })
  }

  const handleEdit = (recordId, data) => editVaccine.mutateAsync({ recordId, data })
  const handleDelete = (recordId) => removeVaccine.mutateAsync(recordId)

  return (
    <div className="space-y-4">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">💉 예방접종</h2>
          <p className="text-sm text-gray-400">날짜를 선택해서 접종 일정을 확인해요</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="w-10 h-10 bg-purple-500 text-white rounded-full text-xl flex items-center justify-center shadow-md hover:bg-purple-600 transition-colors"
        >
          {showForm ? '✕' : '+'}
        </button>
      </div>

      {/* 접종 추가 폼 */}
      {showForm && (
        <Card>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">접종 일정 추가</h3>
          <VaccineForm
            onSubmit={handleSubmit}
            isLoading={addVaccine.isPending}
            defaultDate={selectedDate}
          />
        </Card>
      )}

      {/* 진행 상황 요약 */}
      {totalCount > 0 && (
        <Card>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">접종 완료</span>
            <span className="text-sm font-semibold text-purple-600">{completedCount} / {totalCount}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-purple-500 h-2 rounded-full transition-all"
              style={{ width: totalCount > 0 ? `${(completedCount / totalCount) * 100}%` : '0%' }}
            />
          </div>
          {/* 점 색상 범례 */}
          <div className="flex gap-3 mt-3">
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block" /> 완료
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <span className="w-2 h-2 rounded-full bg-purple-400 inline-block" /> 예정
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> 미완료(지남)
            </span>
          </div>
        </Card>
      )}

      {/* 캘린더 카드 — 작성 폼이 열려있을 때는 숨김 */}
      {!showForm && (
        <Card>
          {vaccinesQuery.isLoading ? (
            <p className="text-center text-gray-400 text-sm py-6">불러오는 중...</p>
          ) : (
            <>
              <Calendar
                markedDatesMap={markedDatesMap}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
              />
              {totalCount > 0 && (
                <p className="text-center text-xs text-gray-400 mt-3">
                  총 {totalCount}개 일정 · {completedCount}개 완료
                </p>
              )}
            </>
          )}
        </Card>
      )}

      {/* 선택된 날짜의 접종 기록 */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">
            {formatDate(selectedDate)}
          </h3>
          {selectedVaccines.length > 0 && (
            <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
              {selectedVaccines.length}건
            </span>
          )}
        </div>

        {selectedVaccines.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-400 text-sm mb-3">이 날은 접종 일정이 없어요.</p>
            <button
              onClick={() => setShowForm(true)}
              className="text-xs text-purple-500 border border-purple-200 rounded-full px-3 py-1 hover:bg-purple-50 transition-colors"
            >
              + 이 날 접종 추가
            </button>
          </div>
        ) : (
          <VaccineList
            vaccines={selectedVaccines}
            onComplete={handleComplete}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </Card>
    </div>
  )
}
