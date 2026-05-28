// 수면 기록 데이터를 가져오고 추가/수정/삭제하는 커스텀 훅

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSleeps, createSleep, updateSleep, deleteSleep } from '../api/sleepApi'
import useChildStore from '../store/childStore'

export function useSleep() {
  const childId = useChildStore((state) => state.selectedChild?.id)
  const queryClient = useQueryClient()

  const sleepsQuery = useQuery({
    queryKey: ['sleeps', childId],
    queryFn: () => getSleeps(childId).then((res) => res.data),
    enabled: !!childId,
  })

  const addSleep = useMutation({
    mutationFn: (data) => createSleep(childId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sleeps', childId] }),
  })

  const editSleep = useMutation({
    mutationFn: ({ recordId, data }) => updateSleep(childId, recordId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sleeps', childId] }),
  })

  const removeSleep = useMutation({
    mutationFn: (recordId) => deleteSleep(childId, recordId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sleeps', childId] }),
  })

  return { sleepsQuery, addSleep, editSleep, removeSleep }
}
