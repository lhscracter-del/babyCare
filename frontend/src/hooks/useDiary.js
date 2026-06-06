// 일기 데이터를 가져오고 작성/수정/삭제하는 커스텀 훅

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getDiaries, createDiary, updateDiary, deleteDiary } from '../api/diaryApi'
import useChildStore from '../store/childStore'

export function useDiary() {
  const childId = useChildStore((state) => state.selectedChild?.id)
  const queryClient = useQueryClient()

  const diariesQuery = useQuery({
    queryKey: ['diaries', childId],
    queryFn: () => getDiaries(childId).then((res) => res.data),
    enabled: !!childId,
  })

  const addDiary = useMutation({
    mutationFn: (data) => createDiary(childId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['diaries', childId] }),
    onError: (error) => {
      const msg = error?.response?.data?.detail || '일기 저장에 실패했습니다. 다시 시도해 주세요.'
      window.alert(msg)
    },
  })

  const editDiary = useMutation({
    mutationFn: ({ recordId, data }) => updateDiary(childId, recordId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['diaries', childId] }),
    onError: (error) => {
      const msg = error?.response?.data?.detail || '일기 수정에 실패했습니다. 다시 시도해 주세요.'
      window.alert(msg)
    },
  })

  const removeDiary = useMutation({
    mutationFn: (recordId) => deleteDiary(childId, recordId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['diaries', childId] }),
    onError: (error) => {
      const msg = error?.response?.data?.detail || '일기 삭제에 실패했습니다. 다시 시도해 주세요.'
      window.alert(msg)
    },
  })

  return { diariesQuery, addDiary, editDiary, removeDiary }
}
