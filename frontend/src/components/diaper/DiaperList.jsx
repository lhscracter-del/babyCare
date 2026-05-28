import { formatTime, formatDate, isToday } from '../../utils/dateUtils'

const DIAPER_TYPE_LABEL = {
  pee: '💧 소변',
  poo: '💩 대변',
  both: '💧💩 둘 다',
}

export default function DiaperList({ diapers = [], onDelete }) {
  if (diapers.length === 0) {
    return <p className="text-center text-gray-400 text-sm py-6">기저귀 기록이 없어요.</p>
  }

  const handleDelete = (id) => {
    if (window.confirm('이 기저귀 기록을 삭제하시겠어요?')) onDelete(id)
  }

  return (
    <ul className="space-y-2">
      {diapers.map((diaper) => (
        <li key={diaper.id} className="py-2 border-b border-gray-50 last:border-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <span className="font-medium text-sm">{DIAPER_TYPE_LABEL[diaper.type] || diaper.type}</span>
              {diaper.note && <p className="text-xs text-gray-400 mt-0.5">{diaper.note}</p>}
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="text-right text-xs text-gray-500">
                <div>{formatTime(diaper.changed_at)}</div>
                {!isToday(diaper.changed_at) && <div>{formatDate(diaper.changed_at)}</div>}
              </div>
              {onDelete && (
                <button
                  onClick={() => handleDelete(diaper.id)}
                  className="px-3 py-2 text-sm text-red-500 bg-red-50 rounded-lg border border-red-100 hover:bg-red-100 active:bg-red-200 transition-colors"
                >
                  삭제
                </button>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
