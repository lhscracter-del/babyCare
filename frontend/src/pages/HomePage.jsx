// 홈 페이지 (대시보드) — 오늘 육아 현황을 한눈에 보여줍니다

import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import Card from '../components/common/Card'
import useChildStore from '../store/childStore'
import { getFeeds } from '../api/feedApi'
import { getSleeps } from '../api/sleepApi'
import { getGrowths } from '../api/growthApi'
import { getVaccines } from '../api/vaccineApi'
import { isToday, formatDate, formatAge } from '../utils/dateUtils'
import { calcTodaySleepHours } from '../utils/timeUtils'

export default function HomePage() {
  const selectedChild = useChildStore((state) => state.selectedChild)
  const childId = selectedChild?.id

  // 오늘의 수유 기록
  const { data: feeds = [] } = useQuery({
    queryKey: ['feeds', childId],
    queryFn: () => getFeeds(childId).then((r) => r.data),
    enabled: !!childId,
  })

  // 수면 기록
  const { data: sleeps = [] } = useQuery({
    queryKey: ['sleeps', childId],
    queryFn: () => getSleeps(childId).then((r) => r.data),
    enabled: !!childId,
  })

  // 성장 기록 (가장 최근 몸무게 표시)
  const { data: growths = [] } = useQuery({
    queryKey: ['growths', childId],
    queryFn: () => getGrowths(childId).then((r) => r.data),
    enabled: !!childId,
  })

  // 예방접종 (다가오는 일정)
  const { data: vaccines = [] } = useQuery({
    queryKey: ['vaccines', childId],
    queryFn: () => getVaccines(childId).then((r) => r.data),
    enabled: !!childId,
  })

  // 오늘 수유 횟수
  const todayFeedCount = feeds.filter((f) => isToday(f.fed_at)).length

  // 오늘 총 수면 시간
  const todaySleepHours = calcTodaySleepHours(sleeps)

  // 가장 최근 몸무게
  const latestWeight = growths.find((g) => g.weight)?.weight

  // 이번 달 안에 있는 미완료 접종 (가장 가까운 3개)
  const upcomingVaccines = vaccines
    .filter((v) => !v.is_completed)
    .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))
    .slice(0, 3)

  return (
    <div className="space-y-4">
      {/* 아이 정보 헤더 */}
      <div className="bg-gradient-to-r from-blue-400 to-indigo-500 rounded-2xl p-5 text-white">
        <p className="text-blue-100 text-sm">안녕하세요 👋</p>
        <h2 className="text-2xl font-bold mt-1">{selectedChild?.name}</h2>
        <p className="text-blue-100 text-sm mt-1">
          {selectedChild?.gender === 'F' ? '👧' : '👦'} {formatAge(selectedChild?.birth_date)} ·{' '}
          {formatDate(selectedChild?.birth_date)} 출생
        </p>
      </div>

      {/* 오늘 요약 카드 */}
      <h3 className="text-sm font-semibold text-gray-500 px-1">오늘 현황</h3>
      <div className="grid grid-cols-2 gap-3">
        {/* 수유 횟수 */}
        <Link to="/feed">
          <Card className="text-center hover:shadow-md transition-shadow">
            <div className="text-3xl mb-1">🍼</div>
            <div className="text-2xl font-bold text-blue-600">{todayFeedCount}회</div>
            <div className="text-xs text-gray-400 mt-1">오늘 수유</div>
          </Card>
        </Link>

        {/* 수면 시간 */}
        <Link to="/sleep">
          <Card className="text-center hover:shadow-md transition-shadow">
            <div className="text-3xl mb-1">😴</div>
            <div className="text-2xl font-bold text-indigo-600">{todaySleepHours}h</div>
            <div className="text-xs text-gray-400 mt-1">오늘 수면</div>
          </Card>
        </Link>

        {/* 최근 몸무게 */}
        <Link to="/growth">
          <Card className="text-center hover:shadow-md transition-shadow">
            <div className="text-3xl mb-1">⚖️</div>
            <div className="text-2xl font-bold text-green-600">
              {latestWeight ? `${latestWeight}kg` : '-'}
            </div>
            <div className="text-xs text-gray-400 mt-1">최근 몸무게</div>
          </Card>
        </Link>

        {/* 다가오는 접종 */}
        <Link to="/vaccine">
          <Card className="text-center hover:shadow-md transition-shadow">
            <div className="text-3xl mb-1">💉</div>
            <div className="text-2xl font-bold text-purple-600">{upcomingVaccines.length}건</div>
            <div className="text-xs text-gray-400 mt-1">예정 접종</div>
          </Card>
        </Link>
      </div>

      {/* 다가오는 예방접종 */}
      {upcomingVaccines.length > 0 && (
        <Card>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">💉 다가오는 예방접종</h3>
          <ul className="space-y-2">
            {upcomingVaccines.map((v) => {
              // 접종일이 지났으면 빨간색, 7일 이내이면 주황색
              const daysLeft = Math.ceil(
                (new Date(v.scheduled_at) - new Date()) / (1000 * 60 * 60 * 24)
              )
              const isOverdue = daysLeft < 0
              const isSoon = daysLeft >= 0 && daysLeft <= 7

              return (
                <li key={v.id} className="flex justify-between items-center text-sm">
                  <span className="text-gray-700">{v.vaccine_name}</span>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      isOverdue
                        ? 'bg-red-100 text-red-600'
                        : isSoon
                        ? 'bg-orange-100 text-orange-600'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {isOverdue ? `${Math.abs(daysLeft)}일 지남` : daysLeft === 0 ? '오늘' : `D-${daysLeft}`}
                  </span>
                </li>
              )
            })}
          </ul>
        </Card>
      )}

      {/* 빠른 이동 버튼들 */}
      <Card>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">📋 기록하기</h3>
        <div className="grid grid-cols-3 gap-2">
          {[
            { to: '/feed', icon: '🍼', label: '수유' },
            { to: '/sleep', icon: '😴', label: '수면' },
            { to: '/growth', icon: '📏', label: '성장' },
            { to: '/vaccine', icon: '💉', label: '접종' },
            { to: '/diary', icon: '📝', label: '일기' },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex flex-col items-center py-3 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors"
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs text-gray-600 mt-1">{item.label}</span>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  )
}
