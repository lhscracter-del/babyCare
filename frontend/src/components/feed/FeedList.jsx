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

export default function FeedList({ feeds = [], showAll = true, onDelete }) {
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const displayFeeds = showAll ? feeds : feeds.filter((f) => isToday(f.fed_at))

  if (displayFeeds.length === 0) {
    return (
      <p className="text-center text-gray-400 text-sm py-6">
        {showAll ? '아직 수유 기록이 없어요.' : '오늘 수유 기록이 없어요.'}
      </p>
    )
  }

  return (
    <ul className="space-y-2">
      {displayFeeds.map((feed) => (
        <li key={feed.id} className="py-2 border-b border-gray-50 last:border-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <span className="font-medium text-sm">{FEED_TYPE_LABEL[feed.feed_type] || feed.feed_type}</span>
              {feed.amount && (
                <span className="ml-2 text-xs text-blue-600 font-semibold">{feed.amount}ml</span>
              )}
              {feed.note && <p className="text-xs text-gray-400 mt-0.5">{feed.note}</p>}
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="text-right text-xs text-gray-500">
                <div>{formatTime(feed.fed_at)}</div>
                {!isToday(feed.fed_at) && <div>{formatDate(feed.fed_at)}</div>}
              </div>
              {onDelete && (
                confirmDeleteId === feed.id ? (
                  <div className="flex gap-1">
                    <button
                      onClick={() => { onDelete(feed.id); setConfirmDeleteId(null) }}
                      className="text-xs bg-red-500 text-white px-2 py-1 rounded-lg"
                    >
                      확인
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-lg"
                    >
                      취소
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(feed.id)}
                    className="px-3 py-2 text-sm text-red-500 bg-red-50 rounded-lg border border-red-100 hover:bg-red-100 active:bg-red-200 transition-colors"
                  >
                    삭제
                  </button>
                )
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
