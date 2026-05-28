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
  })

  // 완료 여부 토글 및 상세 정보 수정 모두 이 mutation을 사용합니다
  const completeVaccine = useMutation({
    mutationFn: ({ recordId, data }) => updateVaccine(childId, recordId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vaccines', childId] }),
  })

  const editVaccine = useMutation({
    mutationFn: ({ recordId, data }) => updateVaccine(childId, recordId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vaccines', childId] }),
  })

  const removeVaccine = useMutation({
    mutationFn: (recordId) => deleteVaccine(childId, recordId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vaccines', childId] }),
  })

  return { vaccinesQuery, addVaccine, completeVaccine, editVaccine, removeVaccine }
}
