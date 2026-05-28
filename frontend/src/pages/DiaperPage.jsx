import { useState } from 'react'
import Card from '../components/common/Card'
import Calendar from '../components/common/Calendar'
import DiaperForm from '../components/diaper/DiaperForm'
import DiaperList from '../components/diaper/DiaperList'
import { useDiaper } from '../hooks/useDiaper'
import { todayString, formatDate } from '../utils/dateUtils'

function extractDate(datetimeStr) {
  if (!datetimeStr) return ''
  return datetimeStr.slice(0, 10)
}

const DIAPER_TYPE_LABEL = {
  pee: '소변',
  poo: '대변',
  both: '둘 다',
}

export default function DiaperPage() {
  const { diapersQuery, addDiaper, removeDiaper } = useDiaper()
  const [showForm, setShowForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState(todayString())

  const diapers = diapersQuery.data || []
  const markedDates = [...new Set(diapers.map((d) => extractDate(d.changed_at)))]
  const selectedDiapers = diapers.filter((d) => extractDate(d.changed_at) === selectedDate)

  // 오늘 종류별 횟수 집계
  const diaperSummary = selectedDiapers.reduce((acc, d) => {
    const label = DIAPER_TYPE_LABEL[d.type] || d.type
    acc[label] = (acc[label] || 0) + 1
    return acc
  }, {})

  const handleSubmit = async (data) => {
    await addDiaper.mutateAsync(data)
    setShowForm(false)
    setSelectedDate(data.changed_at.slice(0, 10))
  }

  const handleDelete = (recordId) => removeDiaper.mutateAsync(recordId)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">🧷 기저귀</h2>
          <p className="text-sm text-gray-400">날짜를 선택해서 기록을 확인해요</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="w-10 h-10 bg-yellow-400 text-white rounded-full text-xl flex items-center justify-center shadow-md hover:bg-yellow-500 transition-colors"
        >
          {showForm ? '✕' : '+'}
        </button>
      </div>

      {showForm && (
        <Card>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">새 기록 추가</h3>
          <DiaperForm onSubmit={handleSubmit} isLoading={addDiaper.isPending} />
        </Card>
      )}

      {!showForm && (
        <Card>
          {diapersQuery.isLoading ? (
            <p className="text-center text-gray-400 text-sm py-6">불러오는 중...</p>
          ) : (
            <>
              <Calendar
                markedDates={markedDates}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                dotColor="bg-yellow-400"
              />
              {markedDates.length > 0 && (
                <p className="text-center text-xs text-gray-400 mt-3">
                  총 {diapers.length}개 기록 · {markedDates.length}일
                </p>
              )}
            </>
          )}
        </Card>
      )}

      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">
            {formatDate(selectedDate)}
          </h3>
          {selectedDiapers.length > 0 && (
            <span className="text-xs font-semibold text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
              총 {selectedDiapers.length}회
            </span>
          )}
        </div>

        {Object.keys(diaperSummary).length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {Object.entries(diaperSummary).map(([label, count]) => (
              <span key={label} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {label} {count}회
              </span>
            ))}
          </div>
        )}

        {selectedDiapers.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-4">
            이 날은 기저귀 기록이 없어요.
          </p>
        ) : (
          <DiaperList diapers={selectedDiapers} onDelete={handleDelete} />
        )}
      </Card>
    </div>
  )
}
