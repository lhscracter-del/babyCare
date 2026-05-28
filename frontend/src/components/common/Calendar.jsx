// 공통 캘린더 컴포넌트 — 날짜 선택과 기록 표시 점(dot)을 지원합니다

import { useState } from 'react'

// 요일 헤더 (일요일부터 시작)
const DAYS_OF_WEEK = ['일', '월', '화', '수', '목', '금', '토']

// 월 이름 (한국어)
const MONTH_NAMES = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']

/**
 * markedDates: 점(dot)으로 표시할 날짜 배열 ["2024-01-15", ...]
 * markedDatesMap: 날짜별 개별 색상 지정 { "2024-01-15": "bg-green-400", ... } — 이 값이 있으면 markedDates 무시
 * selectedDate: 현재 선택된 날짜 "YYYY-MM-DD"
 * onSelectDate: 날짜 클릭 시 호출할 함수 (dateStr) => void
 * dotColor: 점 색상 클래스 (기본값: "bg-indigo-400") — markedDatesMap 미사용 시 적용
 */
export default function Calendar({ markedDates = [], markedDatesMap = null, selectedDate, onSelectDate, dotColor = 'bg-indigo-400' }) {
  const today = new Date()

  // 현재 보여주는 연도·월 상태 (오늘 기준으로 시작)
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth()) // 0 = 1월

  // 이번 달 첫째 날의 요일 (0=일요일)
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay()

  // 이번 달의 마지막 날짜 (28~31)
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  // 기록이 있는 날짜를 Set으로 저장해 빠르게 조회 (markedDatesMap 미사용 시)
  const markedSet = new Set(markedDates)

  // 날짜별 점 색상 반환 — markedDatesMap이 있으면 개별 색상, 없으면 공통 dotColor
  const getDotColor = (dateStr) => {
    if (markedDatesMap) return markedDatesMap[dateStr] || null
    return markedSet.has(dateStr) ? dotColor : null
  }

  // 오늘 날짜 문자열
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  // 이전 달로 이동
  const goPrev = () => {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11) }
    else setViewMonth((m) => m - 1)
  }

  // 다음 달로 이동
  const goNext = () => {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0) }
    else setViewMonth((m) => m + 1)
  }

  // 날짜 숫자를 "YYYY-MM-DD" 형식으로 변환
  const toDateStr = (day) => {
    const mm = String(viewMonth + 1).padStart(2, '0')
    const dd = String(day).padStart(2, '0')
    return `${viewYear}-${mm}-${dd}`
  }

  return (
    <div>
      {/* 월 이동 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={goPrev}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 text-lg"
        >
          ‹
        </button>
        <span className="font-semibold text-gray-800">
          {viewYear}년 {MONTH_NAMES[viewMonth]}
        </span>
        <button
          onClick={goNext}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 text-lg"
        >
          ›
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 text-center mb-1">
        {DAYS_OF_WEEK.map((d, i) => (
          <div
            key={d}
            className={`text-xs font-medium py-1 ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'}`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-y-1">
        {/* 첫째 날 이전 빈 칸 */}
        {Array.from({ length: firstDayOfWeek }, (_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {/* 날짜 셀 */}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1
          const dateStr = toDateStr(day)
          const isSelected = dateStr === selectedDate // 선택된 날짜
          const isToday = dateStr === todayStr         // 오늘
          const dotColorStr = getDotColor(dateStr)     // 이 날의 점 색상 (없으면 null)
          const dayOfWeek = (firstDayOfWeek + i) % 7  // 요일 (0=일)

          return (
            <button
              key={day}
              onClick={() => onSelectDate(dateStr)}
              className={`
                flex flex-col items-center justify-center py-1 rounded-xl text-sm transition-colors
                ${isSelected
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : isToday
                  ? 'text-indigo-600 font-bold bg-indigo-50'
                  : dayOfWeek === 0
                  ? 'text-red-400 hover:bg-red-50'
                  : dayOfWeek === 6
                  ? 'text-blue-400 hover:bg-blue-50'
                  : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              <span>{day}</span>
              {/* 기록이 있으면 작은 점 표시 */}
              {dotColorStr && (
                <span
                  className={`w-1 h-1 rounded-full mt-0.5 ${isSelected ? 'bg-white' : dotColorStr}`}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
