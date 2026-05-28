// 수면 기록 입력 폼 컴포넌트

import { useForm } from 'react-hook-form'
import Button from '../common/Button'
import { nowLocalString } from '../../utils/dateUtils'

export default function SleepForm({ onSubmit, isLoading }) {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      sleep_at: nowLocalString(), // 현재 시간을 취침 시간 기본값으로
    },
  })

  const handleFormSubmit = async (data) => {
    // wake_at이 비어있으면 null (아직 자는 중)
    const payload = {
      ...data,
      wake_at: data.wake_at || null,
      quality: data.quality ? Number(data.quality) : null,
    }
    await onSubmit(payload)
    reset({ sleep_at: nowLocalString() })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3">
      {/* 취침 시간 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">취침 시간</label>
        <input
          type="datetime-local"
          {...register('sleep_at', { required: true })}
          className="w-full min-w-0 max-w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      {/* 기상 시간 (선택사항 — 아직 자는 중이면 비워두세요) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          기상 시간 <span className="text-gray-400 font-normal">(자는 중이면 비워두세요)</span>
        </label>
        <input
          type="datetime-local"
          {...register('wake_at')}
          className="w-full min-w-0 max-w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      {/* 수면 품질 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          수면 품질 <span className="text-gray-400 font-normal">(선택)</span>
        </label>
        <select
          {...register('quality')}
          className="w-full min-w-0 max-w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">-</option>
          <option value="5">😄</option>
          <option value="4">😊</option>
          <option value="3">😐</option>
          <option value="2">😞</option>
          <option value="1">😫</option>
        </select>
      </div>

      {/* 메모 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          메모 <span className="text-gray-400 font-normal">(선택)</span>
        </label>
        <input
          type="text"
          placeholder="예: 낮잠, 밤에 두 번 깸"
          {...register('note')}
          className="w-full min-w-0 max-w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full" variant="primary">
        {isLoading ? '저장 중...' : '기록 추가'}
      </Button>
    </form>
  )
}
