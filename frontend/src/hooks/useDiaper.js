import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getDiapers, createDiaper, deleteDiaper } from '../api/diaperApi'
import useChildStore from '../store/childStore'

export function useDiaper() {
  const childId = useChildStore((state) => state.selectedChild?.id)
  const queryClient = useQueryClient()

  const diapersQuery = useQuery({
    queryKey: ['diapers', childId],
    queryFn: () => getDiapers(childId).then((res) => res.data),
    enabled: !!childId,
  })

  const addDiaper = useMutation({
    mutationFn: (data) => createDiaper(childId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['diapers', childId] }),
    onError: (error) => {
      const msg = error?.response?.data?.detail || '기저귀 기록 저장에 실패했습니다. 다시 시도해 주세요.'
      window.alert(msg)
    },
  })

  const removeDiaper = useMutation({
    mutationFn: (recordId) => deleteDiaper(childId, recordId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['diapers', childId] }),
    onError: (error) => {
      const msg = error?.response?.data?.detail || '기저귀 기록 삭제에 실패했습니다. 다시 시도해 주세요.'
      window.alert(msg)
    },
  })

  return { diapersQuery, addDiaper, removeDiaper }
}
