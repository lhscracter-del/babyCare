// 이미지 원본 보기 라이트박스 모달

export default function ImageViewModal({ src, onClose }) {
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
      <img
        src={src}
        alt="원본 이미지"
        className="max-w-full max-h-full object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  )
}
