// 앱의 최상위 컴포넌트 — 화면 전환(라우팅), 하단 내비게이션, 아이 관리 시트를 담당합니다

import { useEffect, useState } from 'react'
import { Routes, Route, NavLink, useLocation, Navigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'

import useChildStore from './store/childStore'
import useAuthStore from './store/authStore'
import { getChildren, createChild, updateChild, deleteChild } from './api/childApi'
import { formatDate, formatAge } from './utils/dateUtils'

import HomePage from './pages/HomePage'
import FeedPage from './pages/FeedPage'
import SleepPage from './pages/SleepPage'
import GrowthPage from './pages/GrowthPage'
import VaccinePage from './pages/VaccinePage'
import DiaryPage from './pages/DiaryPage'
import DiaperPage from './pages/DiaperPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

const NAV_ITEMS = [
  { to: '/', icon: '🏠', label: '홈' },
  { to: '/feed', icon: '🍼', label: '수유' },
  { to: '/sleep', icon: '😴', label: '수면' },
  { to: '/diaper', icon: '🧷', label: '기저귀' },
  { to: '/growth', icon: '📏', label: '성장' },
  { to: '/vaccine', icon: '💉', label: '접종' },
  { to: '/diary', icon: '📝', label: '일기' },
]

// ── 아이 관리 바텀시트 ─────────────────────────────────────────────────────────

function ChildManagerSheet({ children, selectedChild, onClose, onSelect, onSave, onCreate, onDelete }) {
  // 'list': 아이 목록 | 'edit': 수정 폼 | 'add': 추가 폼
  const [mode, setMode] = useState('list')
  const [editingChild, setEditingChild] = useState(null)
  const [form, setForm] = useState({ name: '', birth_date: '', gender: 'M' })
  const [saving, setSaving] = useState(false)

  const startEdit = (child) => {
    setEditingChild(child)
    setForm({ name: child.name, birth_date: child.birth_date, gender: child.gender })
    setMode('edit')
  }

  const startAdd = () => {
    setForm({ name: '', birth_date: '', gender: 'M' })
    setMode('add')
  }

  const handleSave = async () => {
    if (!form.name || !form.birth_date) return
    setSaving(true)
    try {
      if (mode === 'edit') await onSave(editingChild.id, form)
      else await onCreate(form)
      setMode('list')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (child) => {
    if (!window.confirm(`${child.name}의 모든 기록이 함께 삭제됩니다.\n정말 삭제하시겠어요?`)) return
    await onDelete(child.id)
    // 삭제한 아이가 열려있던 경우 목록으로 돌아가기
    setMode('list')
  }

  const inputCls = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300'

  return (
    <>
      {/* 반투명 배경 — 클릭 시 닫힘 */}
      <div className="fixed inset-0 bg-black/40 z-20" onClick={onClose} />

      {/* 바텀시트 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white rounded-t-2xl z-30 shadow-2xl">
        {/* 드래그 핸들 */}
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-1" />

        {/* 시트 헤더 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          {mode !== 'list' ? (
            <button
              onClick={() => setMode('list')}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              ← 돌아가기
            </button>
          ) : (
            <span className="text-sm font-semibold text-gray-700">👶 아이 관리</span>
          )}
          <button onClick={onClose} className="text-xl text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center">
            ✕
          </button>
        </div>

        <div className="px-4 py-4 overflow-y-auto" style={{ maxHeight: '70vh' }}>

          {/* ── 목록 화면 ── */}
          {mode === 'list' && (
            <>
              <ul className="space-y-2 mb-4">
                {children.map((child) => {
                  const isSelected = selectedChild?.id === child.id
                  return (
                    <li
                      key={child.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-colors ${
                        isSelected ? 'border-blue-400 bg-blue-50' : 'border-gray-100'
                      }`}
                    >
                      {/* 선택 영역 */}
                      <button className="flex-1 text-left min-w-0" onClick={() => { onSelect(child); onClose() }}>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{child.gender === 'F' ? '👧' : '👦'}</span>
                          <div>
                            <div className="font-semibold text-gray-800 text-sm">{child.name}</div>
                            <div className="text-xs text-gray-400">
                              {formatAge(child.birth_date)} · {formatDate(child.birth_date)}
                            </div>
                          </div>
                          {isSelected && (
                            <span className="ml-1 text-xs text-blue-500 font-medium">선택됨</span>
                          )}
                        </div>
                      </button>

                      {/* 수정 / 삭제 */}
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          onClick={() => startEdit(child)}
                          className="text-xs text-gray-400 hover:text-blue-500 transition-colors px-2 py-1 rounded-lg hover:bg-blue-50"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(child)}
                          className="text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
                        >
                          삭제
                        </button>
                      </div>
                    </li>
                  )
                })}
              </ul>

              <button
                onClick={startAdd}
                className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors"
              >
                + 아이 추가
              </button>
            </>
          )}

          {/* ── 수정 / 추가 폼 ── */}
          {(mode === 'edit' || mode === 'add') && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700">
                {mode === 'edit' ? `${editingChild.name} 정보 수정` : '새 아이 추가'}
              </h3>

              {/* 이름 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                <input
                  type="text"
                  placeholder="아이 이름"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inputCls}
                />
              </div>

              {/* 생년월일 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">생년월일</label>
                <input
                  type="date"
                  value={form.birth_date}
                  onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
                  className={inputCls}
                />
              </div>

              {/* 성별 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">성별</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, gender: 'F' })}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm transition-colors ${
                      form.gender === 'F'
                        ? 'border-pink-400 bg-pink-50 text-pink-700 font-medium'
                        : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    👧 여아
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, gender: 'M' })}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm transition-colors ${
                      form.gender === 'M'
                        ? 'border-blue-400 bg-blue-50 text-blue-700 font-medium'
                        : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    👦 남아
                  </button>
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={saving || !form.name || !form.birth_date}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
              >
                {saving ? '저장 중...' : mode === 'edit' ? '수정 완료' : '아이 추가'}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ── 최초 등록 화면 ────────────────────────────────────────────────────────────

function ChildSetup({ onRegistered }) {
  const queryClient = useQueryClient()
  const { register, handleSubmit } = useForm()

  const createMutation = useMutation({
    mutationFn: createChild,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['children'] })
      onRegistered(res.data)
    },
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">👶</div>
          <h1 className="text-2xl font-bold text-gray-800">babyCare에 오신걸 환영해요!</h1>
          <p className="text-gray-400 mt-2 text-sm">먼저 아이 정보를 등록해 주세요</p>
        </div>

        <form onSubmit={handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">아이 이름</label>
            <input
              type="text"
              placeholder="예: 서연이"
              {...register('name', { required: true })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">생년월일</label>
            <input
              type="date"
              {...register('birth_date', { required: true })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">성별</label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-pink-50 has-[:checked]:border-pink-400 has-[:checked]:bg-pink-50">
                <input type="radio" value="F" {...register('gender', { required: true })} />
                <span className="text-sm">👧 여아</span>
              </label>
              <label className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-blue-50 has-[:checked]:border-blue-400 has-[:checked]:bg-blue-50">
                <input type="radio" value="M" {...register('gender', { required: true })} />
                <span className="text-sm">👦 남아</span>
              </label>
            </div>
          </div>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50"
          >
            {createMutation.isPending ? '등록 중...' : '시작하기 🚀'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── 인증된 상태의 메인 앱 ────────────────────────────────────────────────────

function MainApp() {
  const { selectedChild, setSelectedChild, setChildren } = useChildStore()
  const { logout } = useAuthStore()
  const queryClient = useQueryClient()
  const [showChildManager, setShowChildManager] = useState(false)

  const { data: children, isLoading } = useQuery({
    queryKey: ['children'],
    queryFn: () => getChildren().then((res) => res.data),
  })

  // 아이 목록 로드 시 스토어 동기화
  useEffect(() => {
    if (!children) return
    setChildren(children)

    if (children.length === 0) {
      setSelectedChild(null)
      return
    }

    // localStorage에 저장된 아이가 여전히 유효한지 확인
    const stillExists = selectedChild && children.find((c) => c.id === selectedChild.id)
    if (!stillExists) {
      setSelectedChild(children[0])
    } else {
      // 서버의 최신 데이터로 갱신 (이름/생일 변경 반영)
      setSelectedChild(children.find((c) => c.id === selectedChild.id))
    }
  }, [children]) // eslint-disable-line react-hooks/exhaustive-deps

  // 아이 정보 수정 mutation
  const updateChildMutation = useMutation({
    mutationFn: ({ childId, data }) => updateChild(childId, data),
    onSuccess: (res) => {
      const updated = res.data
      // 선택된 아이가 수정된 경우 스토어도 갱신
      if (selectedChild?.id === updated.id) setSelectedChild(updated)
      queryClient.invalidateQueries({ queryKey: ['children'] })
    },
  })

  // 아이 삭제 mutation
  const deleteChildMutation = useMutation({
    mutationFn: (childId) => deleteChild(childId),
    onSuccess: (_, childId) => {
      queryClient.invalidateQueries({ queryKey: ['children'] })
      // 모든 하위 기록 쿼리도 무효화
      queryClient.invalidateQueries()
    },
  })

  // 아이 추가 mutation (시트에서 추가)
  const createChildMutation = useMutation({
    mutationFn: createChild,
    onSuccess: (res) => {
      const newChild = res.data
      setSelectedChild(newChild)
      queryClient.invalidateQueries({ queryKey: ['children'] })
    },
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="text-center">
          <div className="text-5xl mb-4">👶</div>
          <p className="text-gray-400 text-sm">불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (children && children.length === 0) {
    return <ChildSetup onRegistered={(child) => setSelectedChild(child)} />
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 flex flex-col relative">
      {/* 상단 헤더 */}
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <span className="text-xl">👶</span>
          <span className="font-bold text-gray-800">babyCare</span>
        </div>

        <div className="flex items-center gap-2">
          {/* 아이 이름 버튼 — 클릭 시 관리 시트 열림 */}
          {selectedChild && (
            <button
              onClick={() => setShowChildManager(true)}
              className="flex items-center gap-1.5 text-sm text-gray-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors"
            >
              <span>{selectedChild.gender === 'F' ? '👧' : '👦'}</span>
              <span className="font-medium">{selectedChild.name}</span>
              <span className="text-gray-400 text-xs">▾</span>
            </button>
          )}
          {/* 로그아웃 */}
          <button
            onClick={() => {
              logout()
              setSelectedChild(null)
              queryClient.clear()
            }}
            className="text-xs text-gray-400 hover:text-red-400 px-2 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
          >
            로그아웃
          </button>
        </div>
      </header>

      {/* 페이지 콘텐츠 */}
      <main className="flex-1 overflow-y-auto pb-24 px-4 pt-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/sleep" element={<SleepPage />} />
          <Route path="/growth" element={<GrowthPage />} />
          <Route path="/vaccine" element={<VaccinePage />} />
          <Route path="/diary" element={<DiaryPage />} />
          <Route path="/diaper" element={<DiaperPage />} />
        </Routes>
      </main>

      {/* 하단 내비게이션 바 */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 flex z-10">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2 text-xs transition-colors ${
                isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`
            }
          >
            <span className="text-xl leading-none">{item.icon}</span>
            <span className="mt-0.5">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* 아이 관리 바텀시트 */}
      {showChildManager && (
        <ChildManagerSheet
          children={children || []}
          selectedChild={selectedChild}
          onClose={() => setShowChildManager(false)}
          onSelect={(child) => setSelectedChild(child)}
          onSave={(childId, data) => updateChildMutation.mutateAsync({ childId, data })}
          onCreate={(data) => createChildMutation.mutateAsync(data)}
          onDelete={(childId) => deleteChildMutation.mutateAsync(childId)}
        />
      )}
    </div>
  )
}

// ── 앱 진입점 — 인증 여부에 따라 라우팅 분기 ─────────────────────────────────

export default function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return <MainApp />
}
