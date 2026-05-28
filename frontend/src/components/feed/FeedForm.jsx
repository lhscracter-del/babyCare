// 수유/식사 기록 입력 폼 컴포넌트

import { useForm } from 'react-hook-form'
import Button from '../common/Button'
import { nowLocalString } from '../../utils/dateUtils'

// 수유 종류 목록
const FEED_TYPES = [
  { value: 'breast', label: '🤱 모유' },
  { value: 'formula', label: '🍼 분유' },
  { value: 'baby_food', label: '🥣 이유식' },
  { value: 'snack', label: '🍪 간식' },
  { value: 'water', label: '💧 물' },
]

// onSubmit: 폼 제출 시 호출할 함수, isLoading: 저장 중 여부
export default function FeedForm({ onSubmit, isLoading }) {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      feed_type: 'breast',
      fed_at: nowLocalString(), // 현재 시간을 기본값으로 설정
    },
  })

  // 폼 제출 처리 — 데이터를 저장하고 폼을 초기화합니다
  const handleFormSubmit = async (data) => {
    // 양(amount)이 입력되지 않으면 null로 처리
    const payload = { ...data, amount: data.amount ? Number(data.amount) : null }
    await onSubmit(payload)
    reset({ feed_type: 'breast', fed_at: nowLocalString() })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3">
      {/* 수유 종류 선택 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">수유 종류</label>
        <select
          {...register('feed_type', { required: true })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {FEED_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* 양 입력 (선택사항) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          양 <span className="text-gray-400 font-normal">(ml / g, 선택)</span>
        </label>
        <input
          type="number"
          min="0"
          step="5"
          placeholder="예: 120"
          {...register('amount')}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* 수유 시간 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">수유 시간</label>
        <input
          type="datetime-local"
          {...register('fed_at', { required: true })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* 메모 (선택사항) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          메모 <span className="text-gray-400 font-normal">(선택)</span>
        </label>
        <input
          type="text"
          placeholder="예: 잘 먹었어요"
          {...register('note')}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? '저장 중...' : '기록 추가'}
      </Button>
    </form>
  )
}
