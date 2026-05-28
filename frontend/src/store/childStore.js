// 아이 정보를 앱 전체에서 공유하기 위한 전역 상태 저장소 (Zustand)

import { create } from 'zustand'

const useChildStore = create((set) => ({
  // 현재 선택된 아이 정보 (null이면 아이가 선택되지 않은 상태)
  selectedChild: null,

  // 등록된 아이 전체 목록
  children: [],

  // 선택된 아이를 바꿀 때 호출합니다
  setSelectedChild: (child) => set({ selectedChild: child }),

  // 아이 목록 전체를 업데이트합니다
  setChildren: (children) => set({ children }),
}))

export default useChildStore
