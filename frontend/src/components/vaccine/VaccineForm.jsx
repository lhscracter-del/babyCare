// 예방접종 일정 추가 폼 컴포넌트

import { useForm } from 'react-hook-form'
import Button from '../common/Button'
import { todayString } from '../../utils/dateUtils'

// 한국 국가 필수 예방접종 목록 (빠른 선택용)
const NATIONAL_VACCINES = [
  'BCG (결핵)',
  'B형간염 1차',
  'B형간염 2차',
  'B형간염 3차',
  'DTaP 1차 (디프테리아·파상풍·백일해)',
  'DTaP 2차',
  'DTaP 3차',
  'DTaP 4차',
  'DTaP 5차',
  '폴리오(IPV) 1차',
  '폴리오(IPV) 2차',
  '폴리오(IPV) 3차',
  'Hib 1차 (뇌수막염)',
  'Hib 2차',
  'Hib 3차',
  'Hib 4차',
  '폐렴구균 1차',
  '폐렴구균 2차',
  '폐렴구균 3차',
  '폐렴구균 4차',
  'MMR 1차 (홍역·볼거리·풍진)',
  'MMR 2차',
  '수두 1차',
  'A형간염 1차',
  'A형간염 2차',
  '일본뇌염 1차',
  '일본뇌염 2차',
  '인플루엔자(독감)',
]

// onSubmit: 접종 일정 저장 함수, isLoading: 저장 중 여부, defaultDate: 캘린더에서 선택된 날짜
export default function VaccineForm({ onSubmit, isLoading, defaultDate }) {
  const { register, handleSubmit, setValue, reset } = useForm({
    defaultValues: { scheduled_at: defaultDate || todayString() },
  })

  const handleFormSubmit = async (data) => {
    await onSubmit(data)
    reset({ scheduled_at: defaultDate || todayString() })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3">
      {/* 접종명 입력 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">접종명</label>
        <input
          type="text"
          placeholder="예: BCG (결핵)"
          {...register('vaccine_name', { required: true })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
      </div>

      {/* 국가 필수 접종 빠른 선택 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">국가 필수 접종 빠른 선택</label>
        <select
          onChange={(e) => e.target.value && setValue('vaccine_name', e.target.value)}
          defaultValue=""
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
        >
          <option value="">-- 접종 선택 --</option>
          {NATIONAL_VACCINES.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
      </div>

      {/* 접종 예정일 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">접종 예정일</label>
        <input
          type="date"
          {...register('scheduled_at', { required: true })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full" variant="primary">
        {isLoading ? '저장 중...' : '일정 추가'}
      </Button>
    </form>
  )
}
