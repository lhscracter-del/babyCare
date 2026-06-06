// 성장 기록 데이터를 가져오고 추가/수정/삭제하는 커스텀 훅

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getGrowths, createGrowth, updateGrowth, deleteGrowth } from '../api/growthApi'
import useChildStore from '../store/childStore'

export function useGrowth() {
  const childId = useChildStore((state) => state.selectedChild?.id)
  const queryClient = useQueryClient()

  const growthsQuery = useQuery({
    queryKey: ['growths', childId],
    queryFn: () => getGrowths(childId).then((res) => res.data),
    enabled: !!childId,
  })

  const addGrowth = useMutation({
    mutationFn: (data) => createGrowth(childId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['growths', childId] }),
    onError: (error) => {
      const msg = error?.response?.data?.detail || '성장 기록 저장에 실패했습니다. 다시 시도해 주세요.'
      window.alert(msg)
    },
  })

  const editGrowth = useMutation({
    mutationFn: ({ recordId, data }) => updateGrowth(childId, recordId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['growths', childId] }),
    onError: (error) => {
      const msg = error?.response?.data?.detail || '성장 기록 수정에 실패했습니다. 다시 시도해 주세요.'
      window.alert(msg)
    },
  })

  const removeGrowth = useMutation({
    mutationFn: (recordId) => deleteGrowth(childId, recordId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['growths', childId] }),
    onError: (error) => {
      const msg = error?.response?.data?.detail || '성장 기록 삭제에 실패했습니다. 다시 시도해 주세요.'
      window.alert(msg)
    },
  })

  return { growthsQuery, addGrowth, editGrowth, removeGrowth }
}
