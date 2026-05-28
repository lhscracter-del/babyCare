import { useState } from 'react'
import { formatDate } from '../../utils/dateUtils'

function parseDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number)
  return { year, month, day }
}

function toMonthDay(dateStr) {
  const { month, day } = parseDate(dateStr)
  return `${month}/${day}`
}

function toFullDate(dateStr) {
  const { year, month, day } = parseDate(dateStr)
  return `${year}년 ${month}월 ${day}일`
}

// ── SVG 라인 차트 ────────────────────────────────────────────────────────────

function LineChart({ data, color }) {
  const [hoveredIdx, setHoveredIdx] = useState(null)

  if (!data || data.length === 0) {
    return <p className="text-center text-gray-300 text-xs py-4">데이터 없음</p>
  }

  const W   = 300
  const H   = 120
  const PAD = { top: 20, right: 16, bottom: 26, left: 38 }
  const chartW = W - PAD.left - PAD.right
  const chartH = H - PAD.top  - PAD.bottom

  const values = data.map((d) => d.value)
  const minVal = Math.min(...values)
  const maxVal = Math.max(...values)
  const range  = maxVal - minVal || 1

  const points = data.map((d, i) => ({
    x: PAD.left + (data.length === 1 ? chartW / 2 : (i / (data.length - 1)) * chartW),
    y: PAD.top  + chartH - ((d.value - minVal) / range) * chartH,
    value: d.value,
    date:  d.date,
  }))

  const polyline = points.map((p) => `${p.x},${p.y}`).join(' ')

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      style={{ overflow: 'visible' }}
      onMouseLeave={() => setHoveredIdx(null)}
    >
      <line x1={PAD.left} y1={PAD.top}          x2={PAD.left}          y2={PAD.top + chartH} stroke="#f3f4f6" strokeWidth="1" />
      <line x1={PAD.left} y1={PAD.top}          x2={W - PAD.right}     y2={PAD.top}          stroke="#f3f4f6" strokeWidth="1" />
      <line x1={PAD.left} y1={PAD.top + chartH} x2={W - PAD.right}     y2={PAD.top + chartH} stroke="#e5e7eb" strokeWidth="1" />

      <text x={PAD.left - 4} y={PAD.top + 3}          textAnchor="end" fontSize="8" fill="#9ca3af">{maxVal}</text>
      <text x={PAD.left - 4} y={PAD.top + chartH + 3} textAnchor="end" fontSize="8" fill="#9ca3af">{minVal}</text>

      {points.length > 1 && (
        <polyline
          points={polyline}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      )}

      {points.map((p, i) => {
        const isHovered = hoveredIdx === i
        return (
          <g key={i} onMouseEnter={() => setHoveredIdx(i)} style={{ cursor: 'pointer' }}>
            <circle cx={p.x} cy={p.y} r={12} fill="transparent" />
            <circle
              cx={p.x}
              cy={p.y}
              r={isHovered ? 5 : 3.5}
              fill="white"
              stroke={color}
              strokeWidth="2"
              style={{ transition: 'r 0.1s' }}
            />
            <text x={p.x} y={p.y - 8} textAnchor="middle" fontSize="8" fill="#374151" fontWeight="600">
              {p.value}
            </text>
            {(i === 0 || i === points.length - 1 || points.length <= 5) && (
              <text x={p.x} y={H - 2} textAnchor="middle" fontSize="8" fill="#9ca3af">
                {toMonthDay(p.date)}
              </text>
            )}
          </g>
        )
      })}

      {hoveredIdx !== null && (() => {
        const p       = points[hoveredIdx]
        const label   = toFullDate(p.date)
        const tipW    = label.length * 5.2 + 12
        const tipH    = 16
        const rawX    = p.x
        const tipX    = Math.min(Math.max(rawX, PAD.left + tipW / 2), W - PAD.right - tipW / 2)
        const tipY    = Math.max(p.y - 26, PAD.top - 2)

        return (
          <g pointerEvents="none">
            <rect x={tipX - tipW / 2} y={tipY - tipH + 3} width={tipW} height={tipH} rx={4} fill="#1f2937" opacity={0.88} />
            <text x={tipX} y={tipY - 2} textAnchor="middle" fontSize="8.5" fill="white">{label}</text>
          </g>
        )
      })()}
    </svg>
  )
}

// ── 차트 탭 ──────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'weight',            label: '⚖️ 몸무게',  unit: 'kg', color: '#10b981' },
  { key: 'height',            label: '📏 키',       unit: 'cm', color: '#3b82f6' },
  { key: 'head_circumference',label: '👶 머리둘레', unit: 'cm', color: '#8b5cf6' },
]

// ── 메인 컴포넌트 ─────────────────────────────────────────────────────────────

export default function GrowthList({ growths = [], onDelete }) {
  const [activeTab, setActiveTab] = useState('weight')

  if (growths.length === 0) {
    return <p className="text-center text-gray-400 text-sm py-6">아직 성장 기록이 없어요.</p>
  }

  const currentTab = TABS.find((t) => t.key === activeTab)

  const chartData = [...growths]
    .filter((g) => g[activeTab] != null)
    .sort((a, b) => a.measured_at.localeCompare(b.measured_at))
    .map((g) => ({ value: g[activeTab], date: g.measured_at }))

  const handleDelete = (id) => {
    if (window.confirm('이 성장 기록을 삭제하시겠어요?')) onDelete(id)
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 text-xs py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="px-1">
        {chartData.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-6">
            {currentTab.label} 기록이 없어요.
          </p>
        ) : (
          <>
            <div className="flex justify-between items-center mb-1">
              <p className="text-xs text-gray-400">포인트에 마우스를 올리면 날짜가 표시됩니다</p>
              <p className="text-xs text-gray-400">단위: {currentTab.unit}</p>
            </div>
            <LineChart data={chartData} color={currentTab.color} />
            <p className="text-xs text-gray-400 text-center mt-1">{chartData.length}개 기록</p>
          </>
        )}
      </div>

      <div>
        <p className="text-xs font-medium text-gray-500 mb-2">기록 목록</p>
        <ul>
          {growths.map((growth) => (
            <li key={growth.id} className="py-2.5 border-b border-gray-50 last:border-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-400 mb-1">{formatDate(growth.measured_at)}</div>
                  <div className="flex flex-wrap gap-3 text-sm">
                    {growth.weight != null && (
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                        <strong>{growth.weight}</strong>
                        <span className="text-gray-400 text-xs">kg</span>
                      </span>
                    )}
                    {growth.height != null && (
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
                        <strong>{growth.height}</strong>
                        <span className="text-gray-400 text-xs">cm</span>
                      </span>
                    )}
                    {growth.head_circumference != null && (
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-violet-400 inline-block" />
                        <strong>{growth.head_circumference}</strong>
                        <span className="text-gray-400 text-xs">cm</span>
                      </span>
                    )}
                  </div>
                </div>
                {onDelete && (
                  <button
                    onClick={() => handleDelete(growth.id)}
                    className="flex-shrink-0 px-3 py-2 text-sm text-red-500 bg-red-50 rounded-lg border border-red-100 hover:bg-red-100 active:bg-red-200 transition-colors"
                  >
                    삭제
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
