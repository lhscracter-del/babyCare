// 일기 목록 컴포넌트 — 인라인 수정/삭제 + 이미지 표시 기능 포함

import { useState, useRef } from 'react'
import { formatDate } from '../../utils/dateUtils'
import { uploadDiaryImage } from '../../api/diaryApi'
import ImageCropModal from '../common/ImageCropModal'
import ImageViewModal from '../common/ImageViewModal'

const MOODS = [
  { value: '😊 행복', label: '😊 행복' },
  { value: '😐 보통', label: '😐 보통' },
  { value: '😢 슬픔', label: '😢 슬픔' },
  { value: '😡 화남', label: '😡 화남' },
  { value: '😴 피곤', label: '😴 피곤' },
  { value: '🎉 특별한 날', label: '🎉 특별한 날' },
]

// onEdit(id, data): 수정 콜백, onDelete(id): 삭제 콜백
export default function DiaryList({ diaries = [], onEdit, onDelete }) {
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [editImagePreview, setEditImagePreview] = useState(null)
  const [editUploading, setEditUploading] = useState(false)
  const [editCropSourceUrl, setEditCropSourceUrl] = useState(null)
  const [showEditCropper, setShowEditCropper] = useState(false)
  const [viewingSrc, setViewingSrc] = useState(null) // 라이트박스에 표시할 원본 URL
  const editOriginalFileRef = useRef(null)
  const fileInputRef = useRef(null)

  if (diaries.length === 0) {
    return (
      <p className="text-center text-gray-400 text-sm py-6">
        첫 번째 일기를 작성해 보세요. 📝
      </p>
    )
  }

  const startEdit = (diary) => {
    setEditingId(diary.id)
    setEditForm({
      entry_date: diary.entry_date,
      mood: diary.mood ?? '',
      content: diary.content,
      image_path: diary.image_path ?? null,
      original_image_path: diary.original_image_path ?? null,
    })
    setEditImagePreview(diary.image_path || null)
  }

  const handleEditImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    editOriginalFileRef.current = file
    setEditCropSourceUrl(URL.createObjectURL(file))
    setShowEditCropper(true)
    e.target.value = ''
  }

  const handleEditCropConfirm = async (blob) => {
    setShowEditCropper(false)
    setEditImagePreview(URL.createObjectURL(blob))
    setEditUploading(true)
    try {
      const [cropRes, origRes] = await Promise.all([
        uploadDiaryImage(blob),
        uploadDiaryImage(editOriginalFileRef.current),
      ])
      setEditForm((prev) => ({
        ...prev,
        image_path: cropRes.data.url,
        original_image_path: origRes.data.url,
      }))
    } catch {
      alert('이미지 업로드에 실패했어요.')
      setEditImagePreview(editForm.image_path)
    } finally {
      setEditUploading(false)
    }
  }

  const handleEditCropCancel = () => {
    setShowEditCropper(false)
    setEditCropSourceUrl(null)
    editOriginalFileRef.current = null
  }

  const removeEditImage = () => {
    setEditImagePreview(null)
    setEditForm((prev) => ({ ...prev, image_path: null, original_image_path: null }))
    editOriginalFileRef.current = null
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSave = async () => {
    await onEdit(editingId, editForm)
    setEditingId(null)
    setEditImagePreview(null)
  }

  const handleDelete = (id) => {
    if (window.confirm('이 일기를 삭제하시겠어요?')) onDelete(id)
  }

  const inputCls = 'w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300'

  return (
    <>
    {showEditCropper && (
      <ImageCropModal
        imageSrc={editCropSourceUrl}
        onConfirm={handleEditCropConfirm}
        onCancel={handleEditCropCancel}
      />
    )}
    <ImageViewModal src={viewingSrc} onClose={() => setViewingSrc(null)} />
    <ul className="space-y-3">
      {diaries.map((diary) => (
        <li key={diary.id} className="py-3 border-b border-gray-50 last:border-0">
          {editingId === diary.id ? (
            /* ── 인라인 수정 폼 ── */
            <div className="space-y-2">
              <input
                type="date"
                value={editForm.entry_date}
                onChange={(e) => setEditForm({ ...editForm, entry_date: e.target.value })}
                className={inputCls}
              />
              <select
                value={editForm.mood}
                onChange={(e) => setEditForm({ ...editForm, mood: e.target.value })}
                className={inputCls}
              >
                <option value="">기분 선택</option>
                {MOODS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
              <textarea
                rows={4}
                value={editForm.content}
                onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                className={`${inputCls} resize-none`}
              />

              {/* 수정 폼 이미지 */}
              {editImagePreview ? (
                <div className="relative">
                  <img
                    src={editImagePreview}
                    alt="첨부 이미지"
                    className="w-full rounded-lg object-cover"
                    style={{ height: '160px' }}
                  />
                  {editUploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-lg">
                      <span className="text-white text-xs">업로드 중...</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={removeEditImage}
                    className="absolute top-1.5 right-1.5 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center text-xs hover:bg-black/80"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-14 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center gap-2 text-xs text-gray-400 hover:border-yellow-300 hover:text-yellow-500 transition-colors"
                >
                  📷 사진 추가
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleEditImageChange}
                className="hidden"
              />

              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={editUploading}
                  className="flex-1 text-xs py-1.5 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 disabled:opacity-50"
                >
                  저장
                </button>
                <button
                  onClick={() => { setEditingId(null); setEditImagePreview(null) }}
                  className="flex-1 text-xs py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            /* ── 일반 표시 ── */
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{formatDate(diary.entry_date)}</span>
                  {diary.mood && (
                    <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full">
                      {diary.mood}
                    </span>
                  )}
                </div>
                {onEdit && onDelete && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(diary)}
                      className="text-xs text-gray-400 hover:text-yellow-500 transition-colors"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(diary.id)}
                      className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                )}
              </div>

              {/* 일기 내용 */}
              <p className="text-sm text-gray-700 whitespace-pre-line">{diary.content}</p>

              {/* 첨부 이미지 — 380×290 고정, 클릭 시 원본 라이트박스 */}
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
            </div>
          )}
        </li>
      ))}
    </ul>
    </>
  )
}
