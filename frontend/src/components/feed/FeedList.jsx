// 수유 기록 목록 컴포넌트 — 인라인 수정/삭제 기능 포함

import { useState } from 'react'
import { formatTime, formatDate, isToday } from '../../utils/dateUtils'

const FEED_TYPES = [
  { value: 'breast', label: '🤱 모유' },
  { value: 'formula', label: '🍼 분유' },
  { value: 'baby_food', label: '🥣 이유식' },
  { value: 'snack', label: '🍪 간식' },
  { value: 'water', label: '💧 물' },
]

const FEED_TYPE_LABEL = Object.fromEntries(FEED_TYPES.map((t) => [t.value, t.label]))

// ISO datetime → datetime-local 입력값 형식 ("YYYY-MM-DDTHH:MM")
function toDatetimeLocal(isoStr) {
  if (!isoStr) return ''
  return isoStr.slice(0, 16)
}

// feeds: 수유 기록 배열, showAll: 전체 보기 여부
// onEdit(id, data): 수정 콜백, onDelete(id): 삭제 콜백
export default function FeedList({ feeds = [], showAll = true, onEdit, onDelete }) {
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})

  const displayFeeds = showAll ? feeds : feeds.filter((f) => isToday(f.fed_at))

  if (displayFeeds.length === 0) {
    return (
      <p className="text-center text-gray-400 text-sm py-6">
        {showAll ? '아직 수유 기록이 없어요.' : '오늘 수유 기록이 없어요.'}
      </p>
    )
  }

  const startEdit = (feed) => {
    setEditingId(feed.id)
    setEditForm({
      feed_type: feed.feed_type,
      amount: feed.amount ?? '',
      fed_at: toDatetimeLocal(feed.fed_at),
      note: feed.note ?? '',
    })
  }

  const handleSave = async () => {
    await onEdit(editingId, {
      ...editForm,
      amount: editForm.amount ? Number(editForm.amount) : null,
    })
    setEditingId(null)
  }

  const handleDelete = (id) => {
    if (window.confirm('이 수유 기록을 삭제하시겠어요?')) onDelete(id)
  }

  const inputCls = 'w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300'

  return (
    <ul className="space-y-2">
      {displayFeeds.map((feed) => (
        <li key={feed.id} className="py-2 border-b border-gray-50 last:border-0">
          {editingId === feed.id ? (
            /* 인라인 수정 폼 */
            <div className="space-y-2">
              <select
                value={editForm.feed_type}
                onChange={(e) => setEditForm({ ...editForm, feed_type: e.target.value })}
                className={inputCls}
              >
                {FEED_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <input
                type="number"
                min="0"
                step="5"
                placeholder="양 (ml)"
                value={editForm.amount}
                onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                className={inputCls}
              />
              <input
                type="datetime-local"
                value={editForm.fed_at}
                onChange={(e) => setEditForm({ ...editForm, fed_at: e.target.value })}
                className={inputCls}
              />
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
                  className="flex-1 text-xs py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
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
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-sm">{FEED_TYPE_LABEL[feed.feed_type] || feed.feed_type}</span>
                {feed.amount && (
                  <span className="ml-2 text-xs text-blue-600 font-semibold">{feed.amount}ml</span>
                )}
                {feed.note && <p className="text-xs text-gray-400 mt-0.5">{feed.note}</p>}
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right text-xs text-gray-500">
                  <div>{formatTime(feed.fed_at)}</div>
                  {!isToday(feed.fed_at) && <div>{formatDate(feed.fed_at)}</div>}
                </div>
                {onEdit && onDelete && (
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => startEdit(feed)}
                      className="text-xs text-gray-400 hover:text-blue-500 transition-colors"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(feed.id)}
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
