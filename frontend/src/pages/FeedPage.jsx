// 수유/식사 기록 페이지 — 캘린더로 날짜를 선택해서 해당 날의 기록을 봅니다

import { useState } from 'react'
import Card from '../components/common/Card'
import Calendar from '../components/common/Calendar'
import FeedForm from '../components/feed/FeedForm'
import FeedList from '../components/feed/FeedList'
import { useFeed } from '../hooks/useFeed'
import { todayString, formatDate } from '../utils/dateUtils'

// datetime 문자열에서 날짜 부분만 추출합니다
// 예: "2024-01-15T10:30:00" → "2024-01-15"
function extractDate(datetimeStr) {
  if (!datetimeStr) return ''
  return datetimeStr.slice(0, 10)
}

// 수유 종류 한국어 매핑
const FEED_TYPE_LABEL = {
  breast: '모유',
  formula: '분유',
  baby_food: '이유식',
  snack: '간식',
  water: '물',
}

export default function FeedPage() {
  const { feedsQuery, addFeed, editFeed, removeFeed } = useFeed()
  const [showForm, setShowForm] = useState(false)

  // 캘린더에서 선택된 날짜 (기본값: 오늘)
  const [selectedDate, setSelectedDate] = useState(todayString())

  const feeds = feedsQuery.data || []

  // 기록이 있는 날짜 목록 → 캘린더에 파란 점으로 표시
  const markedDates = [...new Set(feeds.map((f) => extractDate(f.fed_at)))]

  // 선택된 날짜의 수유 기록만 걸러냅니다
  const selectedFeeds = feeds.filter((f) => extractDate(f.fed_at) === selectedDate)

  // 선택된 날 수유 종류별 횟수 집계
  const feedSummary = selectedFeeds.reduce((acc, f) => {
    const label = FEED_TYPE_LABEL[f.feed_type] || f.feed_type
    acc[label] = (acc[label] || 0) + 1
    return acc
  }, {})

  // 선택된 날 총 섭취량 (ml)
  const totalMl = selectedFeeds.reduce((sum, f) => sum + (f.amount || 0), 0)

  const handleSubmit = async (data) => {
    await addFeed.mutateAsync(data)
    setShowForm(false)
    setSelectedDate(data.fed_at.slice(0, 10))
  }

  const handleEdit = (recordId, data) => editFeed.mutateAsync({ recordId, data })
  const handleDelete = (recordId) => removeFeed.mutateAsync(recordId)

  return (
    <div className="space-y-4">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">🍼 수유 / 식사</h2>
          <p className="text-sm text-gray-400">날짜를 선택해서 기록을 확인해요</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="w-10 h-10 bg-blue-500 text-white rounded-full text-xl flex items-center justify-center shadow-md hover:bg-blue-600 transition-colors"
        >
          {showForm ? '✕' : '+'}
        </button>
      </div>

      {/* 수유 기록 입력 폼 */}
      {showForm && (
        <Card>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">새 기록 추가</h3>
          <FeedForm onSubmit={handleSubmit} isLoading={addFeed.isPending} />
        </Card>
      )}

      {/* 캘린더 카드 — 작성 폼이 열려있을 때는 숨김 */}
      {!showForm && (
        <Card>
          {feedsQuery.isLoading ? (
            <p className="text-center text-gray-400 text-sm py-6">불러오는 중...</p>
          ) : (
            <>
              <Calendar
                markedDates={markedDates}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                dotColor="bg-blue-400"
              />
              {markedDates.length > 0 && (
                <p className="text-center text-xs text-gray-400 mt-3">
                  총 {feeds.length}개 기록 · {markedDates.length}일
                </p>
              )}
            </>
          )}
        </Card>
      )}

      {/* 선택된 날짜의 수유 기록 */}
      <Card>
        {/* 카드 헤더: 날짜 + 횟수 요약 */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">
            {formatDate(selectedDate)}
          </h3>
          {selectedFeeds.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                총 {selectedFeeds.length}회
              </span>
              {totalMl > 0 && (
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                  {totalMl}ml
                </span>
              )}
            </div>
          )}
        </div>

        {/* 수유 종류별 요약 배지 */}
        {Object.keys(feedSummary).length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {Object.entries(feedSummary).map(([label, count]) => (
              <span key={label} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {label} {count}회
              </span>
            ))}
          </div>
        )}

        {/* 수유 기록 목록 */}
        {selectedFeeds.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-4">
            이 날은 수유 기록이 없어요.
          </p>
        ) : (
          <FeedList feeds={selectedFeeds} showAll={true} onEdit={handleEdit} onDelete={handleDelete} />
        )}
      </Card>
    </div>
  )
}
