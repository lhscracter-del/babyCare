// 성장 기록 입력 폼 컴포넌트

import { useForm } from 'react-hook-form'
import Button from '../common/Button'
import { todayString } from '../../utils/dateUtils'

export default function GrowthForm({ onSubmit, isLoading }) {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      measured_at: todayString(), // 오늘 날짜를 기본값으로
    },
  })

  const handleFormSubmit = async (data) => {
    // 숫자 필드 처리 — 비어있으면 null
    const payload = {
      measured_at: data.measured_at,
      height: data.height ? Number(data.height) : null,
      weight: data.weight ? Number(data.weight) : null,
      head_circumference: data.head_circumference ? Number(data.head_circumference) : null,
    }
    await onSubmit(payload)
    reset({ measured_at: todayString() })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3">
      {/* 측정일 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">측정일</label>
        <input
          type="date"
          {...register('measured_at', { required: true })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        />
      </div>

      {/* 키 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          키 <span className="text-gray-400 font-normal">(cm, 선택)</span>
        </label>
        <input
          type="number"
          step="0.1"
          min="0"
          placeholder="예: 70.5"
          {...register('height')}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        />
      </div>

      {/* 몸무게 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          몸무게 <span className="text-gray-400 font-normal">(kg, 선택)</span>
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          placeholder="예: 8.2"
          {...register('weight')}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        />
      </div>

      {/* 머리둘레 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          머리둘레 <span className="text-gray-400 font-normal">(cm, 선택)</span>
        </label>
        <input
          type="number"
          step="0.1"
          min="0"
          placeholder="예: 44.0"
          {...register('head_circumference')}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full" variant="success">
        {isLoading ? '저장 중...' : '기록 추가'}
      </Button>
    </form>
  )
}
