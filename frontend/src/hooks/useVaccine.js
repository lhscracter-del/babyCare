// 예방접종 데이터를 가져오고 추가/수정/삭제하는 커스텀 훅

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getVaccines, createVaccine, updateVaccine, deleteVaccine } from '../api/vaccineApi'
import useChildStore from '../store/childStore'

export function useVaccine() {
  const childId = useChildStore((state) => state.selectedChild?.id)
  const queryClient = useQueryClient()

  const vaccinesQuery = useQuery({
    queryKey: ['vaccines', childId],
    queryFn: () => getVaccines(childId).then((res) => res.data),
    enabled: !!childId,
  })

  const addVaccine = useMutation({
    mutationFn: (data) => createVaccine(childId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vaccines', childId] }),
    onError: (error) => {
      const msg = error?.response?.data?.detail || '예방접종 일정 저장에 실패했습니다. 다시 시도해 주세요.'
      window.alert(msg)
    },
  })

  // 완료 여부 토글 및 상세 정보 수정 모두 이 mutation을 사용합니다
  const completeVaccine = useMutation({
    mutationFn: ({ recordId, data }) => updateVaccine(childId, recordId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vaccines', childId] }),
    onError: (error) => {
      const msg = error?.response?.data?.detail || '접종 완료 처리에 실패했습니다. 다시 시도해 주세요.'
      window.alert(msg)
    },
  })

  const editVaccine = useMutation({
    mutationFn: ({ recordId, data }) => updateVaccine(childId, recordId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vaccines', childId] }),
    onError: (error) => {
      const msg = error?.response?.data?.detail || '예방접종 일정 수정에 실패했습니다. 다시 시도해 주세요.'
      window.alert(msg)
    },
  })

  const removeVaccine = useMutation({
    mutationFn: (recordId) => deleteVaccine(childId, recordId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vaccines', childId] }),
    onError: (error) => {
      const msg = error?.response?.data?.detail || '예방접종 일정 삭제에 실패했습니다. 다시 시도해 주세요.'
      window.alert(msg)
    },
  })

  return { vaccinesQuery, addVaccine, completeVaccine, editVaccine, removeVaccine }
}
