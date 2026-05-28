// 수유 기록 데이터를 가져오고 추가/수정/삭제하는 커스텀 훅

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getFeeds, createFeed, updateFeed, deleteFeed } from '../api/feedApi'
import useChildStore from '../store/childStore'

export function useFeed() {
  const childId = useChildStore((state) => state.selectedChild?.id)
  const queryClient = useQueryClient()

  const feedsQuery = useQuery({
    queryKey: ['feeds', childId],
    queryFn: () => getFeeds(childId).then((res) => res.data),
    enabled: !!childId,
  })

  const addFeed = useMutation({
    mutationFn: (data) => createFeed(childId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['feeds', childId] }),
  })

  const editFeed = useMutation({
    mutationFn: ({ recordId, data }) => updateFeed(childId, recordId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['feeds', childId] }),
  })

  const removeFeed = useMutation({
    mutationFn: (recordId) => deleteFeed(childId, recordId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['feeds', childId] }),
  })

  return { feedsQuery, addFeed, editFeed, removeFeed }
}
