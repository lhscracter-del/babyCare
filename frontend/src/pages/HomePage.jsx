import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import Card from '../components/common/Card'
import useChildStore from '../store/childStore'
import { getFeeds } from '../api/feedApi'
import { getSleeps } from '../api/sleepApi'
import { getGrowths } from '../api/growthApi'
import { getVaccines } from '../api/vaccineApi'
import { getDiapers } from '../api/diaperApi'
import { isToday, formatDate, formatAge, formatTime, formatDateTime } from '../utils/dateUtils'
import { calcTodaySleepHours, timeAgo, formatDuration } from '../utils/timeUtils'

const FEED_TYPE_LABEL = {
  breast: '🤱 모유',
  formula: '🍼 분유',
  baby_food: '🥣 이유식',
  snack: '🍪 간식',
  water: '💧 물',
}

const DIAPER_TYPE_LABEL = {
  pee: '💧 소변',
  poo: '💩 대변',
  both: '💧💩 둘 다',
}

export default function HomePage() {
  const selectedChild = useChildStore((state) => state.selectedChild)
  const childId = selectedChild?.id

  const { data: feeds = [] } = useQuery({
    queryKey: ['feeds', childId],
    queryFn: () => getFeeds(childId).then((r) => r.data),
    enabled: !!childId,
  })

  const { data: sleeps = [] } = useQuery({
    queryKey: ['sleeps', childId],
    queryFn: () => getSleeps(childId).then((r) => r.data),
    enabled: !!childId,
  })

  const { data: growths = [] } = useQuery({
    queryKey: ['growths', childId],
    queryFn: () => getGrowths(childId).then((r) => r.data),
    enabled: !!childId,
  })

  const { data: vaccines = [] } = useQuery({
    queryKey: ['vaccines', childId],
    queryFn: () => getVaccines(childId).then((r) => r.data),
    enabled: !!childId,
  })

  const { data: diapers = [] } = useQuery({
    queryKey: ['diapers', childId],
    queryFn: () => getDiapers(childId).then((r) => r.data),
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

  // 마지막 기록 시간
  // 서버가 이미 시각 내림차순으로 정렬해 반환하므로 첫 번째 항목이 가장 최근 기록입니다
  // (매 렌더마다 전체 배열을 복사·재정렬하던 중복 로직 제거)
  const lastFeed = feeds[0]
  const lastSleep = sleeps[0]
  const lastDiaper = diapers[0]

  // 전체 기록을 내림차순으로 합친 리스트
  // feeds/sleeps/diapers가 바뀔 때만 재계산 (매 렌더마다 병합·정렬 방지)
  const allRecords = useMemo(
    () =>
      [
        ...feeds.map((f) => ({
          key: `feed-${f.id}`,
          time: f.fed_at,
          icon: '🍼',
          label: FEED_TYPE_LABEL[f.feed_type] || f.feed_type,
          sub: f.amount ? `${f.amount}ml` : '',
          to: '/feed',
          color: 'text-blue-600',
          bg: 'bg-blue-50',
        })),
        ...sleeps.map((s) => ({
          key: `sleep-${s.id}`,
          time: s.sleep_at,
          icon: '😴',
          label: s.wake_at ? `수면 ${formatDuration(s.sleep_at, s.wake_at)}` : '수면 중',
          sub: '',
          to: '/sleep',
          color: 'text-indigo-600',
          bg: 'bg-indigo-50',
        })),
        ...diapers.map((d) => ({
          key: `diaper-${d.id}`,
          time: d.changed_at,
          icon: '🧷',
          label: DIAPER_TYPE_LABEL[d.type] || d.type,
          sub: d.note || '',
          to: '/diaper',
          color: 'text-yellow-600',
          bg: 'bg-yellow-50',
        })),
      ]
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .slice(0, 20),
    [feeds, sleeps, diapers]
  )

  if (!childId) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <div className="text-5xl mb-4">👶</div>
        <p className="text-lg font-medium text-gray-500">아이를 선택해 주세요</p>
        <p className="text-sm mt-1 text-center">상단에서 아이를 선택하면 기록을 볼 수 있어요</p>
      </div>
    )
  }

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
        <Link to="/feed">
          <Card className="text-center hover:shadow-md transition-shadow">
            <div className="text-3xl mb-1">🍼</div>
            <div className="text-2xl font-bold text-blue-600">{todayFeedCount}회</div>
            <div className="text-xs text-gray-400 mt-1">오늘 수유</div>
          </Card>
        </Link>

        <Link to="/sleep">
          <Card className="text-center hover:shadow-md transition-shadow">
            <div className="text-3xl mb-1">😴</div>
            <div className="text-2xl font-bold text-indigo-600">{todaySleepHours}h</div>
            <div className="text-xs text-gray-400 mt-1">오늘 수면</div>
          </Card>
        </Link>

        <Link to="/growth">
          <Card className="text-center hover:shadow-md transition-shadow">
            <div className="text-3xl mb-1">⚖️</div>
            <div className="text-2xl font-bold text-green-600">
              {latestWeight ? `${latestWeight}kg` : '-'}
            </div>
            <div className="text-xs text-gray-400 mt-1">최근 몸무게</div>
          </Card>
        </Link>

        <Link to="/vaccine">
          <Card className="text-center hover:shadow-md transition-shadow">
            <div className="text-3xl mb-1">💉</div>
            <div className="text-2xl font-bold text-purple-600">{upcomingVaccines.length}건</div>
            <div className="text-xs text-gray-400 mt-1">예정 접종</div>
          </Card>
        </Link>
      </div>

      {/* 마지막 기록 경과 시간 */}
      <Card>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">⏱ 마지막 기록</h3>
        <div className="grid grid-cols-3 gap-2 text-center">
          <Link to="/feed" className="space-y-1 py-2 rounded-xl hover:bg-blue-50 transition-colors">
            <div className="text-xl">🍼</div>
            <div className="text-xs text-gray-500">수유</div>
            <div className="text-xs font-semibold text-blue-600">
              {timeAgo(lastFeed?.fed_at) ?? '없음'}
            </div>
          </Link>
          <Link to="/diaper" className="space-y-1 py-2 rounded-xl hover:bg-yellow-50 transition-colors">
            <div className="text-xl">🧷</div>
            <div className="text-xs text-gray-500">기저귀</div>
            <div className="text-xs font-semibold text-yellow-600">
              {timeAgo(lastDiaper?.changed_at) ?? '없음'}
            </div>
          </Link>
          <Link to="/sleep" className="space-y-1 py-2 rounded-xl hover:bg-indigo-50 transition-colors">
            <div className="text-xl">😴</div>
            <div className="text-xs text-gray-500">수면</div>
            <div className="text-xs font-semibold text-indigo-600">
              {timeAgo(lastSleep?.sleep_at) ?? '없음'}
            </div>
          </Link>
        </div>
      </Card>

      {/* 다가오는 예방접종 */}
      {upcomingVaccines.length > 0 && (
        <Card>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">💉 다가오는 예방접종</h3>
          <ul className="space-y-2">
            {upcomingVaccines.map((v) => {
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

      {/* 최근 기록 전체 리스트 */}
      <Card>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">📋 최근 기록</h3>
        {allRecords.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-4">아직 기록이 없어요.</p>
        ) : (
          <ul className="space-y-1">
            {allRecords.map((record) => (
              <li key={record.key}>
                <Link
                  to={record.to}
                  className="flex items-center gap-3 py-2 px-2 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  <span className={`w-8 h-8 rounded-full ${record.bg} flex items-center justify-center text-base flex-shrink-0`}>
                    {record.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-800">
                      {record.label}
                      {record.sub && (
                        <span className={`ml-1.5 text-xs font-semibold ${record.color}`}>
                          {record.sub}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 flex-shrink-0">
                    {isToday(record.time) ? formatTime(record.time) : formatDateTime(record.time)}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
