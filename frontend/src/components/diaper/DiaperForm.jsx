import { useForm } from 'react-hook-form'
import Button from '../common/Button'
import { nowLocalString } from '../../utils/dateUtils'

const DIAPER_TYPES = [
  { value: 'pee', label: '💧 소변' },
  { value: 'poo', label: '💩 대변' },
  { value: 'both', label: '💧💩 둘 다' },
]

export default function DiaperForm({ onSubmit, isLoading }) {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      type: 'pee',
      changed_at: nowLocalString(),
    },
  })

  const handleFormSubmit = async (data) => {
    await onSubmit(data)
    reset({ type: 'pee', changed_at: nowLocalString() })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">종류</label>
        <div className="grid grid-cols-3 gap-2">
          {DIAPER_TYPES.map((t) => (
            <label
              key={t.value}
              className="flex flex-col items-center gap-1 py-3 rounded-xl border-2 cursor-pointer text-sm transition-colors has-[:checked]:border-yellow-400 has-[:checked]:bg-yellow-50 border-gray-200 hover:bg-gray-50"
            >
              <input type="radio" value={t.value} {...register('type', { required: true })} className="hidden" />
              <span className="text-xl">{t.label.split(' ')[0]}</span>
              <span className="text-xs text-gray-600">{t.label.split(' ').slice(1).join(' ')}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">교체 시간</label>
        <input
          type="datetime-local"
          {...register('changed_at', { required: true })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          메모 <span className="text-gray-400 font-normal">(선택)</span>
        </label>
        <input
          type="text"
          placeholder="예: 묽음, 색 이상"
          {...register('note')}
          maxLength={20}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? '저장 중...' : '기록 추가'}
      </Button>
    </form>
  )
}
