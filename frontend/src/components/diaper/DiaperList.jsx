import { useState } from 'react'
import { formatTime, formatDate, isToday } from '../../utils/dateUtils'

const DIAPER_TYPE_LABEL = {
  pee: '💧 소변',
  poo: '💩 대변',
  both: '💧💩 둘 다',
}

export default function DiaperList({ diapers = [], onDelete }) {
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  if (diapers.length === 0) {
    return <p className="text-center text-gray-400 text-sm py-6">기저귀 기록이 없어요.</p>
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
                confirmDeleteId === diaper.id ? (
                  <div className="flex gap-1">
                    <button
                      onClick={() => { onDelete(diaper.id); setConfirmDeleteId(null) }}
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
                    onClick={() => setConfirmDeleteId(diaper.id)}
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
