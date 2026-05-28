// 예방접종 목록 컴포넌트 — 완료 체크 + 인라인 수정/삭제 기능 포함

import { useState } from 'react'
import { formatDate, todayString } from '../../utils/dateUtils'

// vaccines: 접종 목록, onComplete: 완료 처리, onEdit: 수정, onDelete: 삭제
export default function VaccineList({ vaccines = [], onComplete, onEdit, onDelete }) {
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})

  if (vaccines.length === 0) {
    return (
      <p className="text-center text-gray-400 text-sm py-6">
        예방접종 일정을 추가해 보세요.
      </p>
    )
  }

  // 완료 여부로 정렬 — 미완료 먼저
  const sorted = [...vaccines].sort((a, b) => {
    if (a.is_completed === b.is_completed) return new Date(a.scheduled_at) - new Date(b.scheduled_at)
    return a.is_completed ? 1 : -1
  })

  const startEdit = (vaccine) => {
    setEditingId(vaccine.id)
    setEditForm({
      vaccine_name: vaccine.vaccine_name,
      scheduled_at: vaccine.scheduled_at,
    })
  }

  const handleSave = async () => {
    await onEdit(editingId, editForm)
    setEditingId(null)
  }

  const handleDelete = (id) => {
    if (window.confirm('이 접종 일정을 삭제하시겠어요?')) onDelete(id)
  }

  const inputCls = 'w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300'

  return (
    <ul className="space-y-2">
      {sorted.map((vaccine) => {
        const isPast = vaccine.scheduled_at < todayString()
        const isOverdue = !vaccine.is_completed && isPast

        return (
          <li
            key={vaccine.id}
            className={`py-2 border-b border-gray-50 last:border-0 ${vaccine.is_completed ? 'opacity-50' : ''}`}
          >
            {editingId === vaccine.id ? (
              /* 인라인 수정 폼 */
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="접종명"
                  value={editForm.vaccine_name}
                  onChange={(e) => setEditForm({ ...editForm, vaccine_name: e.target.value })}
                  className={inputCls}
                />
                <input
                  type="date"
                  value={editForm.scheduled_at}
                  onChange={(e) => setEditForm({ ...editForm, scheduled_at: e.target.value })}
                  className={inputCls}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="flex-1 text-xs py-1.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
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
              /* 일반 표시 */
              <div className="flex items-center gap-3">
                {/* 완료 체크버튼 */}
                <button
                  onClick={() => onComplete(vaccine)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    vaccine.is_completed
                      ? 'bg-green-500 border-green-500 text-white'
                      : isOverdue
                      ? 'border-red-400 hover:bg-red-50'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {vaccine.is_completed && '✓'}
                </button>

                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium truncate ${vaccine.is_completed ? 'line-through text-gray-400' : ''}`}>
                    {vaccine.vaccine_name}
                  </div>
                  <div className={`text-xs mt-0.5 ${isOverdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                    {isOverdue ? '⚠️ 지남 · ' : ''}
                    예정일: {formatDate(vaccine.scheduled_at)}
                    {vaccine.completed_at && ` · 완료: ${formatDate(vaccine.completed_at)}`}
                  </div>
                </div>

                {onEdit && onDelete && (
                  <div className="flex flex-col gap-0.5 flex-shrink-0">
                    <button
                      onClick={() => startEdit(vaccine)}
                      className="text-xs text-gray-400 hover:text-purple-500 transition-colors"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(vaccine.id)}
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
  )
}
