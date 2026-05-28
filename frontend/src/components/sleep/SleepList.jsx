import { formatTime, formatDate, isToday } from '../../utils/dateUtils'
import { formatDuration, formatQuality } from '../../utils/timeUtils'

export default function SleepList({ sleeps = [], hideEmpty = false, onDelete }) {
  if (sleeps.length === 0) {
    if (hideEmpty) return null
    return <p className="text-center text-gray-400 text-sm py-6">아직 수면 기록이 없어요.</p>
  }

  const handleDelete = (id) => {
    if (window.confirm('이 수면 기록을 삭제하시겠어요?')) onDelete(id)
  }

  return (
    <ul className="space-y-2">
      {sleeps.map((sleep) => (
        <li key={sleep.id} className="py-3 border-b border-gray-50 last:border-0">
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1 min-w-0">
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
              {sleep.note && <p className="text-xs text-gray-400 mt-0.5">{sleep.note}</p>}
            </div>
            {onDelete && (
              <button
                onClick={() => handleDelete(sleep.id)}
                className="flex-shrink-0 px-3 py-2 text-sm text-red-500 bg-red-50 rounded-lg border border-red-100 hover:bg-red-100 active:bg-red-200 transition-colors"
              >
                삭제
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
