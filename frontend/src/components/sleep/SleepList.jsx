// 수면 기록 목록 컴포넌트 — 인라인 수정/삭제 기능 포함

import { useState } from 'react'
import { formatTime, formatDate, isToday } from '../../utils/dateUtils'
import { formatDuration, formatQuality } from '../../utils/timeUtils'

function toDatetimeLocal(isoStr) {
  if (!isoStr) return ''
  return isoStr.slice(0, 16)
}

// hideEmpty: true이면 빈 목록일 때 아무것도 렌더링하지 않음
// onEdit(id, data): 수정 콜백, onDelete(id): 삭제 콜백
export default function SleepList({ sleeps = [], hideEmpty = false, onEdit, onDelete }) {
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})

  if (sleeps.length === 0) {
    if (hideEmpty) return null
    return <p className="text-center text-gray-400 text-sm py-6">아직 수면 기록이 없어요.</p>
  }

  const startEdit = (sleep) => {
    setEditingId(sleep.id)
    setEditForm({
      sleep_at: toDatetimeLocal(sleep.sleep_at),
      wake_at: toDatetimeLocal(sleep.wake_at),
      quality: sleep.quality ?? '',
      note: sleep.note ?? '',
    })
  }

  const handleSave = async () => {
    await onEdit(editingId, {
      ...editForm,
      wake_at: editForm.wake_at || null,
      quality: editForm.quality ? Number(editForm.quality) : null,
    })
    setEditingId(null)
  }

  const handleDelete = (id) => {
    if (window.confirm('이 수면 기록을 삭제하시겠어요?')) onDelete(id)
  }

  const inputCls = 'w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300'

  return (
    <ul className="space-y-2">
      {sleeps.map((sleep) => (
        <li key={sleep.id} className="py-3 border-b border-gray-50 last:border-0">
          {editingId === sleep.id ? (
            /* 인라인 수정 폼 */
            <div className="space-y-2">
              <div>
                <label className="text-xs text-gray-500 mb-0.5 block">취침 시간</label>
                <input
                  type="datetime-local"
                  value={editForm.sleep_at}
                  onChange={(e) => setEditForm({ ...editForm, sleep_at: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-0.5 block">기상 시간 (선택)</label>
                <input
                  type="datetime-local"
                  value={editForm.wake_at}
                  onChange={(e) => setEditForm({ ...editForm, wake_at: e.target.value })}
                  className={inputCls}
                />
              </div>
              <select
                value={editForm.quality}
                onChange={(e) => setEditForm({ ...editForm, quality: e.target.value })}
                className={inputCls}
              >
                <option value="">수면 품질 선택</option>
                <option value="5">😄 매우 좋음</option>
                <option value="4">😊 좋음</option>
                <option value="3">😐 보통</option>
                <option value="2">😞 나쁨</option>
                <option value="1">😫 매우 나쁨</option>
              </select>
              <input
                type="text"
                placeholder="메모"
                value={editForm.note}
                onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                className={inputCls}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="flex-1 text-xs py-1.5 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
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
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm font-medium">
                  {formatTime(sleep.sleep_at)}
                  {sleep.wake_at ? ` → ${formatTime(sleep.wake_at)}` : ' → 자는 중 😴'}
                </div>
                {!isToday(sleep.sleep_at) && (
                  <div className="text-xs text-gray-400">{formatDate(sleep.sleep_at)}</div>
                )}
                {sleep.wake_at && (
                  <div className="text-xs text-indigo-600 font-semibold mt-0.5">
                    총 {formatDuration(sleep.sleep_at, sleep.wake_at)}
                  </div>
                )}
                {sleep.quality && (
                  <div className="text-xs text-gray-500 mt-0.5">{formatQuality(sleep.quality)}</div>
                )}
              </div>
              <div className="flex items-start gap-3">
                {sleep.note && <p className="text-xs text-gray-400 max-w-20 text-right">{sleep.note}</p>}
                {onEdit && onDelete && (
                  <div className="flex flex-col gap-0.5 flex-shrink-0">
                    <button
                      onClick={() => startEdit(sleep)}
                      className="text-xs text-gray-400 hover:text-indigo-500 transition-colors"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(sleep.id)}
                      className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}
