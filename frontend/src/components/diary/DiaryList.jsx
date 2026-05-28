import { useState } from 'react'
import { formatDate } from '../../utils/dateUtils'
import ImageViewModal from '../common/ImageViewModal'

export default function DiaryList({ diaries = [], onDelete }) {
  const [viewingSrc, setViewingSrc] = useState(null)

  if (diaries.length === 0) {
    return (
      <p className="text-center text-gray-400 text-sm py-6">
        첫 번째 일기를 작성해 보세요. 📝
      </p>
    )
  }

  const handleDelete = (id) => {
    if (window.confirm('이 일기를 삭제하시겠어요?')) onDelete(id)
  }

  return (
    <>
      <ImageViewModal src={viewingSrc} onClose={() => setViewingSrc(null)} />
      <ul className="space-y-3">
        {diaries.map((diary) => (
          <li key={diary.id} className="py-3 border-b border-gray-50 last:border-0">
            <div className="flex items-start justify-between mb-1 gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-400">{formatDate(diary.entry_date)}</span>
                {diary.mood && (
                  <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full">
                    {diary.mood}
                  </span>
                )}
              </div>
              {onDelete && (
                <button
                  onClick={() => handleDelete(diary.id)}
                  className="flex-shrink-0 px-3 py-2 text-sm text-red-500 bg-red-50 rounded-lg border border-red-100 hover:bg-red-100 active:bg-red-200 transition-colors"
                >
                  삭제
                </button>
              )}
            </div>

            <p className="text-sm text-gray-700 whitespace-pre-line">{diary.content}</p>

            {diary.image_path && (
              <div className="mt-3">
                <img
                  src={diary.image_path}
                  alt="일기 이미지"
                  width={380}
                  height={290}
                  onClick={() => setViewingSrc(diary.original_image_path || diary.image_path)}
                  className="rounded-xl object-cover cursor-zoom-in"
                  style={{ width: '380px', height: '290px', maxWidth: '100%' }}
                />
              </div>
            )}
          </li>
        ))}
      </ul>
    </>
  )
}
