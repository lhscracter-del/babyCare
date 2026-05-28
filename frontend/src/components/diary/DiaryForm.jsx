// 일기 작성 폼 컴포넌트 — 이미지 첨부 기능 포함

import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import Button from '../common/Button'
import ImageCropModal from '../common/ImageCropModal'
import { todayString } from '../../utils/dateUtils'
import { uploadDiaryImage } from '../../api/diaryApi'

const MOODS = [
  { value: '😊 행복', label: '😊 행복' },
  { value: '😐 보통', label: '😐 보통' },
  { value: '😢 슬픔', label: '😢 슬픔' },
  { value: '😡 화남', label: '😡 화남' },
  { value: '😴 피곤', label: '😴 피곤' },
  { value: '🎉 특별한 날', label: '🎉 특별한 날' },
]

export default function DiaryForm({ onSubmit, isLoading, defaultDate }) {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      entry_date: defaultDate || todayString(),
      mood: '😊 행복',
    },
  })

  // 이미지 관련 상태
  const [imagePreview, setImagePreview] = useState(null)
  const [imagePath, setImagePath] = useState(null)
  const [originalImagePath, setOriginalImagePath] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [cropSourceUrl, setCropSourceUrl] = useState(null)
  const [showCropper, setShowCropper] = useState(false)
  const originalFileRef = useRef(null) // 원본 File 객체 보관
  const fileInputRef = useRef(null)

  // 파일 선택 → 크롭 모달 열기
  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    originalFileRef.current = file
    setCropSourceUrl(URL.createObjectURL(file))
    setShowCropper(true)
    e.target.value = ''
  }

  // 크롭 완료 → 크롭본 + 원본 동시 업로드
  const handleCropConfirm = async (blob) => {
    setShowCropper(false)
    setImagePreview(URL.createObjectURL(blob))
    setUploading(true)
    try {
      const [cropRes, origRes] = await Promise.all([
        uploadDiaryImage(blob),
        uploadDiaryImage(originalFileRef.current),
      ])
      setImagePath(cropRes.data.url)
      setOriginalImagePath(origRes.data.url)
    } catch {
      alert('이미지 업로드에 실패했어요. 다시 시도해 주세요.')
      setImagePreview(null)
      setImagePath(null)
      setOriginalImagePath(null)
    } finally {
      setUploading(false)
    }
  }

  const handleCropCancel = () => {
    setShowCropper(false)
    setCropSourceUrl(null)
    originalFileRef.current = null
  }

  const removeImage = () => {
    setImagePreview(null)
    setImagePath(null)
    setOriginalImagePath(null)
    originalFileRef.current = null
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleFormSubmit = async (data) => {
    await onSubmit({ ...data, image_path: imagePath, original_image_path: originalImagePath })
    reset({ entry_date: defaultDate || todayString(), mood: '😊 행복' })
    setImagePreview(null)
    setImagePath(null)
    setOriginalImagePath(null)
  }

  return (
    <>
    {showCropper && (
      <ImageCropModal
        imageSrc={cropSourceUrl}
        onConfirm={handleCropConfirm}
        onCancel={handleCropCancel}
      />
    )}
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3">
      {/* 날짜 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">날짜</label>
        <input
          type="date"
          {...register('entry_date', { required: true })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
      </div>

      {/* 감정 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">오늘 기분</label>
        <select
          {...register('mood')}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
        >
          {MOODS.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </div>

      {/* 내용 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">일기 내용</label>
        <textarea
          rows={4}
          placeholder="오늘 아이와 있었던 일을 기록해 보세요..."
          {...register('content', { required: true })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
        />
      </div>

      {/* 이미지 첨부 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          사진 첨부 <span className="text-gray-400 font-normal">(선택)</span>
        </label>

        {imagePreview ? (
          /* 미리보기 */
          <div className="relative">
            <img
              src={imagePreview}
              alt="첨부 이미지 미리보기"
              className="w-full rounded-lg object-cover"
              style={{ height: '200px' }}
            />
            {uploading && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-lg">
                <span className="text-white text-sm">업로드 중...</span>
              </div>
            )}
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center text-xs hover:bg-black/80"
            >
              ✕
            </button>
          </div>
        ) : (
          /* 파일 선택 버튼 */
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-24 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-yellow-300 hover:text-yellow-500 transition-colors"
          >
            <span className="text-2xl">📷</span>
            <span className="text-xs">사진을 추가해 보세요</span>
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <Button
        type="submit"
        disabled={isLoading || uploading}
        className="w-full"
        variant="primary"
      >
        {isLoading ? '저장 중...' : uploading ? '이미지 업로드 중...' : '일기 저장'}
      </Button>
    </form>
    </>
  )
}
