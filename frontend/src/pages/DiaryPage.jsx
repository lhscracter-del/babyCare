// 일기 페이지 — 캘린더로 날짜를 선택해서 그 날의 일기를 봅니다

import { useState, useMemo } from 'react'
import Card from '../components/common/Card'
import Calendar from '../components/common/Calendar'
import DiaryForm from '../components/diary/DiaryForm'
import DiaryList from '../components/diary/DiaryList'
import { useDiary } from '../hooks/useDiary'
import { todayString, formatDate } from '../utils/dateUtils'

export default function DiaryPage() {
  const { diariesQuery, addDiary, editDiary, removeDiary } = useDiary()
  const [showForm, setShowForm] = useState(false)

  // 캘린더에서 선택된 날짜 (기본값: 오늘)
  const [selectedDate, setSelectedDate] = useState(todayString())

  const diaries = diariesQuery.data || []

  // 일기가 있는 날짜 목록 → 캘린더에 노란 점으로 표시
  // 일기의 entry_date는 "YYYY-MM-DD" 형식이라 바로 사용합니다
  // diaries가 바뀔 때만 재계산 (매 렌더마다 매핑 방지)
  const markedDates = useMemo(() => diaries.map((d) => d.entry_date), [diaries])

  // 선택된 날짜의 일기만 걸러냅니다
  const selectedDiaries = diaries.filter((d) => d.entry_date === selectedDate)

  const handleSubmit = async (data) => {
    await addDiary.mutateAsync(data)
    setShowForm(false)
    // 저장한 일기의 날짜로 캘린더를 이동합니다
    setSelectedDate(data.entry_date)
  }

  const handleOpenForm = () => setShowForm((v) => !v)

  const handleEdit = (recordId, data) => editDiary.mutateAsync({ recordId, data })
  const handleDelete = (recordId) => removeDiary.mutateAsync(recordId)

  return (
    <div className="space-y-4">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">📝 일기</h2>
          <p className="text-sm text-gray-400">날짜를 선택해서 일기를 확인해요</p>
        </div>
        <button
          onClick={handleOpenForm}
          className="w-10 h-10 bg-yellow-400 text-white rounded-full text-xl flex items-center justify-center shadow-md hover:bg-yellow-500 transition-colors"
        >
          {showForm ? '✕' : '+'}
        </button>
      </div>

      {/* 일기 작성 폼 */}
      {showForm && (
        <Card>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">일기 쓰기</h3>
          {/* selectedDate를 기본값으로 전달해서 선택된 날짜에 바로 기록 */}
          <DiaryForm
            onSubmit={handleSubmit}
            isLoading={addDiary.isPending}
            defaultDate={selectedDate}
          />
        </Card>
      )}

      {/* 캘린더 카드 — 작성 폼이 열려있을 때는 숨김 */}
      {!showForm && (
        <Card>
          {diariesQuery.isLoading ? (
            <p className="text-center text-gray-400 text-sm py-6">불러오는 중...</p>
          ) : (
            <>
              <Calendar
                markedDates={markedDates}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                dotColor="bg-yellow-400"
              />
              {diaries.length > 0 && (
                <p className="text-center text-xs text-gray-400 mt-3">
                  총 {diaries.length}개의 일기
                </p>
              )}
            </>
          )}
        </Card>
      )}

      {/* 선택된 날짜의 일기 */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">
            {formatDate(selectedDate)}
          </h3>
          {/* 선택한 날 일기가 있으면 감정 표시 */}
          {selectedDiaries[0]?.mood && (
            <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full">
              {selectedDiaries[0].mood}
            </span>
          )}
        </div>

        {selectedDiaries.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-400 text-sm">이 날은 일기가 없어요.</p>
            {/* 빠른 작성 유도 버튼 */}
            <button
              onClick={() => setShowForm(true)}
              className="mt-2 text-xs text-yellow-500 font-medium hover:underline"
            >
              + 일기 쓰기
            </button>
          </div>
        ) : (
          <DiaryList diaries={selectedDiaries} onEdit={handleEdit} onDelete={handleDelete} />
        )}
      </Card>
    </div>
  )
}
