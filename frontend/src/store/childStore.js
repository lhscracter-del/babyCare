// 아이 정보를 앱 전체에서 공유하기 위한 전역 상태 저장소 (Zustand)

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useChildStore = create(
  persist(
    (set) => ({
      selectedChild: null,
      children: [],
      setSelectedChild: (child) => set({ selectedChild: child }),
      setChildren: (children) => set({ children }),
    }),
    {
      name: 'baby-care-child',
      // children 목록은 API에서 매번 최신으로 받아오므로 selectedChild만 저장
      partialize: (state) => ({ selectedChild: state.selectedChild }),
    }
  )
)

export default useChildStore
