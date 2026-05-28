import { formatDate, todayString } from '../../utils/dateUtils'

export default function VaccineList({ vaccines = [], onComplete, onDelete }) {
  if (vaccines.length === 0) {
    return (
      <p className="text-center text-gray-400 text-sm py-6">
        예방접종 일정을 추가해 보세요.
      </p>
    )
  }

  const sorted = [...vaccines].sort((a, b) => {
    if (a.is_completed === b.is_completed) return new Date(a.scheduled_at) - new Date(b.scheduled_at)
    return a.is_completed ? 1 : -1
  })

  const handleDelete = (id) => {
    if (window.confirm('이 접종 일정을 삭제하시겠어요?')) onDelete(id)
  }

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
            <div className="flex items-center gap-3">
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

              {onDelete && (
                <button
                  onClick={() => handleDelete(vaccine.id)}
                  className="flex-shrink-0 px-3 py-2 text-sm text-red-500 bg-red-50 rounded-lg border border-red-100 hover:bg-red-100 active:bg-red-200 transition-colors"
                >
                  삭제
                </button>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
