// 이미지 크롭 모달 — 드래그·줌으로 원하는 영역을 선택합니다

import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { getCroppedImg } from '../../utils/imageUtils'

// 일기 이미지 표시 비율 (380 × 290)
const ASPECT = 380 / 290

/**
 * imageSrc : 원본 이미지 blob URL
 * onConfirm(blob) : 크롭 완료 후 Blob 반환
 * onCancel() : 취소
 */
export default function ImageCropModal({ imageSrc, onConfirm, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [processing, setProcessing] = useState(false)

  const onCropComplete = useCallback((_, pixels) => {
    setCroppedAreaPixels(pixels)
  }, [])

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return
    setProcessing(true)
    try {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels)
      onConfirm(blob)
    } finally {
      setProcessing(false)
    }
  }

  return (
    /* 전체 화면 오버레이 */
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* 상단 안내 */}
      <div className="flex items-center justify-between px-4 py-3 text-white">
        <button onClick={onCancel} className="text-sm text-white/70 hover:text-white">
          취소
        </button>
        <p className="text-sm font-medium">사진 영역 선택</p>
        <div className="w-10" /> {/* 대칭 여백 */}
      </div>

      {/* 크롭 영역 — 남은 공간 전체 */}
      <div className="relative flex-1">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={ASPECT}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          style={{
            containerStyle: { background: '#000' },
            cropAreaStyle: { border: '2px solid rgba(255,255,255,0.8)' },
          }}
        />
      </div>

      {/* 하단 컨트롤 */}
      <div className="px-4 pt-3 pb-2 bg-black">
        <p className="text-xs text-white/50 text-center mb-2">드래그로 이동 · 핀치 또는 슬라이더로 확대·축소</p>
        <input
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="w-full accent-yellow-400"
        />
      </div>

      <div className="flex gap-3 px-4 pb-8 pt-2 bg-black">
        <button
          onClick={onCancel}
          className="flex-1 py-3 rounded-xl border border-white/20 text-white text-sm"
        >
          취소
        </button>
        <button
          onClick={handleConfirm}
          disabled={processing}
          className="flex-1 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-white font-semibold text-sm disabled:opacity-50"
        >
          {processing ? '처리 중...' : '선택 완료'}
        </button>
      </div>
    </div>
  )
}
