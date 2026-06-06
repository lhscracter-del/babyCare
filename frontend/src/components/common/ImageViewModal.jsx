// 이미지 원본 보기 라이트박스 모달

import { useState } from 'react'

export default function ImageViewModal({ src, onClose }) {
  const [loaded, setLoaded] = useState(false)

  if (!src) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center text-white/70 hover:text-white text-xl"
      >
        ✕
      </button>
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-white text-sm animate-pulse">이미지 로딩 중...</div>
        </div>
      )}
      <img
        src={src}
        alt="원본 이미지"
        className="max-w-full max-h-full object-contain"
        onLoad={() => setLoaded(true)}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  )
}
