// 성장 기록 목록 컴포넌트 — SVG 라인 차트 + 마우스 오버 툴팁 + 인라인 수정/삭제

import { useState } from 'react'
import { formatDate } from '../../utils/dateUtils'

// "YYYY-MM-DD" → { year, month, day }
function parseDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number)
  return { year, month, day }
}

// "YYYY-MM-DD" → "M/D" (X축 레이블용)
function toMonthDay(dateStr) {
  const { month, day } = parseDate(dateStr)
  return `${month}/${day}`
}

// "YYYY-MM-DD" → "YYYY년 M월 D일" (툴팁용)
function toFullDate(dateStr) {
  const { year, month, day } = parseDate(dateStr)
  return `${year}년 ${month}월 ${day}일`
}

// ── SVG 라인 차트 ────────────────────────────────────────────────────────────

// data: [{ value: number, date: "YYYY-MM-DD" }]
function LineChart({ data, color }) {
  // 현재 마우스가 올라간 포인트 인덱스 (null이면 없음)
  const [hoveredIdx, setHoveredIdx] = useState(null)

  if (!data || data.length === 0) {
    return <p className="text-center text-gray-300 text-xs py-4">데이터 없음</p>
  }

  // 차트 크기 및 여백 설정
  const W   = 300
  const H   = 120
  const PAD = { top: 20, right: 16, bottom: 26, left: 38 }
  const chartW = W - PAD.left - PAD.right
  const chartH = H - PAD.top  - PAD.bottom

  const values = data.map((d) => d.value)
  const minVal = Math.min(...values)
  const maxVal = Math.max(...values)
  const range  = maxVal - minVal || 1 // 0 나누기 방지

  // 각 포인트의 SVG 좌표 계산
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
      // 차트 영역 밖으로 마우스가 나가면 툴팁 닫기
      onMouseLeave={() => setHoveredIdx(null)}
    >
      {/* 배경 가이드 선 */}
      <line x1={PAD.left} y1={PAD.top}          x2={PAD.left}          y2={PAD.top + chartH} stroke="#f3f4f6" strokeWidth="1" />
      <line x1={PAD.left} y1={PAD.top}          x2={W - PAD.right}     y2={PAD.top}          stroke="#f3f4f6" strokeWidth="1" />
      <line x1={PAD.left} y1={PAD.top + chartH} x2={W - PAD.right}     y2={PAD.top + chartH} stroke="#e5e7eb" strokeWidth="1" />

      {/* Y축 최대·최소 레이블 */}
      <text x={PAD.left - 4} y={PAD.top + 3}          textAnchor="end" fontSize="8" fill="#9ca3af">{maxVal}</text>
      <text x={PAD.left - 4} y={PAD.top + chartH + 3} textAnchor="end" fontSize="8" fill="#9ca3af">{minVal}</text>

      {/* 데이터 연결선 */}
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

      {/* 데이터 포인트 */}
      {points.map((p, i) => {
        const isHovered = hoveredIdx === i

        return (
          <g
            key={i}
            onMouseEnter={() => setHoveredIdx(i)}
            style={{ cursor: 'pointer' }}
          >
            {/* 마우스 감지 영역 (실제 원보다 넓게) */}
            <circle cx={p.x} cy={p.y} r={12} fill="transparent" />

            {/* 데이터 원 — 호버 시 크게 */}
            <circle
              cx={p.x}
              cy={p.y}
              r={isHovered ? 5 : 3.5}
              fill="white"
              stroke={color}
              strokeWidth="2"
              style={{ transition: 'r 0.1s' }}
            />

            {/* 값 레이블 (원 위) */}
            <text
              x={p.x}
              y={p.y - 8}
              textAnchor="middle"
              fontSize="8"
              fill="#374151"
              fontWeight="600"
            >
              {p.value}
            </text>

            {/* X축 날짜 레이블 — 처음·끝·5개 이하일 때 표시 */}
            {(i === 0 || i === points.length - 1 || points.length <= 5) && (
              <text
                x={p.x}
                y={H - 2}
                textAnchor="middle"
                fontSize="8"
                fill="#9ca3af"
              >
                {toMonthDay(p.date)}
              </text>
            )}
          </g>
        )
      })}

      {/* 마우스 오버 툴팁 — 호버된 포인트 위에 년월일 표시 */}
      {hoveredIdx !== null && (() => {
        const p       = points[hoveredIdx]
        const label   = toFullDate(p.date)  // "2024년 1월 15일"
        const tipW    = label.length * 5.2 + 12  // 텍스트 길이에 맞춰 너비 계산
        const tipH    = 16

        // 툴팁이 SVG 경계를 벗어나지 않도록 x 위치 조정
        const rawX = p.x
        const tipX = Math.min(Math.max(rawX, PAD.left + tipW / 2), W - PAD.right - tipW / 2)
        const tipY = Math.max(p.y - 26, PAD.top - 2) // 너무 위로 올라가지 않도록

        return (
          <g pointerEvents="none">
            {/* 툴팁 배경 */}
            <rect
              x={tipX - tipW / 2}
              y={tipY - tipH + 3}
              width={tipW}
              height={tipH}
              rx={4}
              fill="#1f2937"
              opacity={0.88}
            />
            {/* 툴팁 텍스트 */}
            <text
              x={tipX}
              y={tipY - 2}
              textAnchor="middle"
              fontSize="8.5"
              fill="white"
            >
              {label}
            </text>
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

export default function GrowthList({ growths = [], onEdit, onDelete }) {
  const [activeTab, setActiveTab] = useState('weight')
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})

  if (growths.length === 0) {
    return <p className="text-center text-gray-400 text-sm py-6">아직 성장 기록이 없어요.</p>
  }

  const currentTab = TABS.find((t) => t.key === activeTab)

  // 현재 탭의 차트 데이터 — 값이 있는 기록만, 날짜 오름차순 정렬
  const chartData = [...growths]
    .filter((g) => g[activeTab] != null)
    .sort((a, b) => a.measured_at.localeCompare(b.measured_at))
    .map((g) => ({ value: g[activeTab], date: g.measured_at }))

  return (
    <div className="space-y-4">
      {/* 몸무게 / 키 / 머리둘레 탭 */}
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

      {/* 차트 영역 */}
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
            <p className="text-xs text-gray-400 text-center mt-1">
              {chartData.length}개 기록
            </p>
          </>
        )}
      </div>

      {/* 전체 기록 목록 */}
      <div>
        <p className="text-xs font-medium text-gray-500 mb-2">기록 목록</p>
        <ul>
          {growths.map((growth) => {
            const inputCls = 'w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300'

            const startEdit = () => {
              setEditingId(growth.id)
              setEditForm({
                measured_at: growth.measured_at,
                height: growth.height ?? '',
                weight: growth.weight ?? '',
                head_circumference: growth.head_circumference ?? '',
              })
            }

            const handleSave = async () => {
              await onEdit(growth.id, {
                measured_at: editForm.measured_at,
                height: editForm.height !== '' ? Number(editForm.height) : null,
                weight: editForm.weight !== '' ? Number(editForm.weight) : null,
                head_circumference: editForm.head_circumference !== '' ? Number(editForm.head_circumference) : null,
              })
              setEditingId(null)
            }

            const handleDelete = () => {
              if (window.confirm('이 성장 기록을 삭제하시겠어요?')) onDelete(growth.id)
            }

            return (
              <li key={growth.id} className="py-2.5 border-b border-gray-50 last:border-0">
                {editingId === growth.id ? (
                  <div className="space-y-2">
                    <input
                      type="date"
                      value={editForm.measured_at}
                      onChange={(e) => setEditForm({ ...editForm, measured_at: e.target.value })}
                      className={inputCls}
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="number" step="0.1" min="0" placeholder="키 (cm)"
                        value={editForm.height}
                        onChange={(e) => setEditForm({ ...editForm, height: e.target.value })}
                        className={inputCls}
                      />
                      <input
                        type="number" step="0.01" min="0" placeholder="몸무게 (kg)"
                        value={editForm.weight}
                        onChange={(e) => setEditForm({ ...editForm, weight: e.target.value })}
                        className={inputCls}
                      />
                      <input
                        type="number" step="0.1" min="0" placeholder="머리 (cm)"
                        value={editForm.head_circumference}
                        onChange={(e) => setEditForm({ ...editForm, head_circumference: e.target.value })}
                        className={inputCls}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSave}
                        className="flex-1 text-xs py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600"
                      >
                        저장
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex-1 text-xs py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
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
                    {onEdit && onDelete && (
                      <div className="flex flex-col gap-0.5 flex-shrink-0">
                        <button
                          onClick={startEdit}
                          className="text-xs text-gray-400 hover:text-green-500 transition-colors"
                        >
                          수정
                        </button>
                        <button
                          onClick={handleDelete}
                          className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                        >
                          삭제
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
