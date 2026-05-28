// 성장 기록 페이지 — 전체 또는 특정 연도를 선택해서 차트와 기록을 봅니다

import { useState, useMemo } from 'react'
import Card from '../components/common/Card'
import GrowthForm from '../components/growth/GrowthForm'
import GrowthList from '../components/growth/GrowthList'
import { useGrowth } from '../hooks/useGrowth'
import { formatDate } from '../utils/dateUtils'

// "YYYY-MM-DD" 문자열에서 연도만 추출합니다
function getYear(dateStr) {
  return Number(dateStr.split('-')[0])
}

const PERIOD_TABS = [
  { key: 'all',  label: '전체' },
  { key: 'year', label: '년' },
]

export default function GrowthPage() {
  const { growthsQuery, addGrowth, editGrowth, removeGrowth } = useGrowth()
  const [showForm, setShowForm] = useState(false)

  // 기간 필터 상태
  const [period, setPeriod]   = useState('all')
  const [selYear, setSelYear] = useState(new Date().getFullYear())

  const growths = growthsQuery.data || []

  // 가장 최근 기록 (서버가 내림차순으로 반환)
  const latest = growths[0]

  // 기간별 필터링
  const filteredGrowths = useMemo(() => {
    if (period === 'all')  return growths
    if (period === 'year') return growths.filter((g) => getYear(g.measured_at) === selYear)
    return growths
  }, [growths, period, selYear])

  // 카드 헤더에 표시할 기간 레이블
  const periodLabel = period === 'year' ? `${selYear}년` : '전체 기록'

  const handleSubmit = async (data) => {
    await addGrowth.mutateAsync(data)
    setShowForm(false)
  }

  const handleEdit = (recordId, data) => editGrowth.mutateAsync({ recordId, data })
  const handleDelete = (recordId) => removeGrowth.mutateAsync(recordId)

  return (
    <div className="space-y-4">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">📏 성장</h2>
          <p className="text-sm text-gray-400">기간을 선택해서 성장 추이를 확인해요</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="w-10 h-10 bg-green-500 text-white rounded-full text-xl flex items-center justify-center shadow-md hover:bg-green-600 transition-colors"
        >
          {showForm ? '✕' : '+'}
        </button>
      </div>

      {/* 성장 기록 입력 폼 */}
      {showForm && (
        <Card>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">성장 기록 추가</h3>
          <GrowthForm onSubmit={handleSubmit} isLoading={addGrowth.isPending} />
        </Card>
      )}

      {/* 최근 측정 수치 요약 */}
      {latest && (
        <Card>
          <p className="text-xs text-gray-400 mb-2">
            최근 측정일: {formatDate(latest.measured_at)}
          </p>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-xl font-bold text-emerald-600">{latest.height ?? '-'}</div>
              <div className="text-xs text-gray-400">키 (cm)</div>
            </div>
            <div>
              <div className="text-xl font-bold text-blue-600">{latest.weight ?? '-'}</div>
              <div className="text-xs text-gray-400">몸무게 (kg)</div>
            </div>
            <div>
              <div className="text-xl font-bold text-violet-600">{latest.head_circumference ?? '-'}</div>
              <div className="text-xs text-gray-400">머리둘레 (cm)</div>
            </div>
          </div>
        </Card>
      )}

      {/* 기간 필터 카드 */}
      <Card>
        {/* 전체 / 년 탭 */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-4">
          {PERIOD_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setPeriod(tab.key)}
              className={`flex-1 text-sm py-2 rounded-lg font-semibold transition-colors ${
                period === tab.key
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 년 선택: ‹ 2024년 › */}
        {period === 'year' && (
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelYear((y) => y - 1)}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 text-xl"
            >
              ‹
            </button>
            <span className="font-bold text-gray-800 text-base">{selYear}년</span>
            <button
              onClick={() => setSelYear((y) => y + 1)}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 text-xl"
            >
              ›
            </button>
          </div>
        )}
      </Card>

      {/* 성장 차트 + 기록 목록 */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">{periodLabel}</h3>
          {filteredGrowths.length > 0 && (
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {filteredGrowths.length}개
            </span>
          )}
        </div>

        {growthsQuery.isLoading ? (
          <p className="text-center text-gray-400 text-sm py-4">불러오는 중...</p>
        ) : filteredGrowths.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-6">
            {period === 'year' ? `${selYear}년 성장 기록이 없어요.` : '아직 성장 기록이 없어요.'}
          </p>
        ) : (
          <GrowthList growths={filteredGrowths} onEdit={handleEdit} onDelete={handleDelete} />
        )}
      </Card>
    </div>
  )
}
