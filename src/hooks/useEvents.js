import { useState, useEffect, useMemo } from 'react'
import { getEventStatus } from '../utils/eventUtils'

export function useEvents() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/data/events.json')
      .then((res) => {
        if (!res.ok) throw new Error('events.json 로드 실패')
        return res.json()
      })
      .then((json) => {
        setData(json)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  const events     = data?.events     ?? []
  const eventTypes = data?.eventTypes ?? {}

  return { events, eventTypes, loading, error }
}

/**
 * 행사 목록을 필터링하고 섹션으로 분류하는 훅
 * status는 JSON 필드가 아닌 날짜 비교로 실시간 계산
 *
 * @param {object} options
 * @param {string}  options.filterType   - 'all' | 'comicworld' | 'illustarfes' | 'comiverse'
 * @param {string}  options.filterCity   - 'all' | 도시명
 * @param {string}  options.filterStatus - 'all' | 'upcoming' | 'ongoing' | 'ended'
 * @param {boolean} options.hideOld      - 2년 이상 지난 행사 숨김
 */
export function useFilteredEvents(options = {}) {
  const { events, eventTypes, loading, error } = useEvents()
  const {
    filterType   = 'all',
    filterCity   = 'all',
    filterStatus = 'all',
    hideOld      = true,
  } = options

  // 각 행사에 실시간 status를 계산해 붙임
  const eventsWithStatus = useMemo(
    () =>
      events.map((e) => ({
        ...e,
        status: getEventStatus(e.dates.start, e.dates.end),
      })),
    [events]
  )

  const filtered = useMemo(() => {
    let list = [...eventsWithStatus]

    if (filterType !== 'all') {
      list = list.filter((e) => e.type === filterType)
    }

    if (filterCity !== 'all') {
      list = list.filter((e) => e.city === filterCity)
    }

    if (filterStatus !== 'all') {
      list = list.filter((e) => e.status === filterStatus)
    }

    // 오래된 행사 숨김 (2년 이상)
    if (hideOld) {
      const cutoff = new Date()
      cutoff.setFullYear(cutoff.getFullYear() - 2)
      list = list.filter((e) => new Date(e.dates.start) >= cutoff)
    }

    return list
  }, [eventsWithStatus, filterType, filterCity, filterStatus, hideOld])

  // ongoing: 시작순 / upcoming: 시작순 / ended: 최신순
  const ongoing = useMemo(
    () =>
      filtered
        .filter((e) => e.status === 'ongoing')
        .sort((a, b) => new Date(a.dates.start) - new Date(b.dates.start)),
    [filtered]
  )

  const upcoming = useMemo(
    () =>
      filtered
        .filter((e) => e.status === 'upcoming')
        .sort((a, b) => new Date(a.dates.start) - new Date(b.dates.start)),
    [filtered]
  )

  const ended = useMemo(
    () =>
      filtered
        .filter((e) => e.status === 'ended')
        .sort((a, b) => new Date(b.dates.start) - new Date(a.dates.start)),
    [filtered]
  )

  const cities = useMemo(
    () => ['all', ...Array.from(new Set(events.map((e) => e.city))).sort()],
    [events]
  )

  return { ongoing, upcoming, ended, eventTypes, cities, loading, error }
}

/**
 * 단일 행사 조회 훅
 * @param {string} eventId
 */
export function useEvent(eventId) {
  const { events, eventTypes, loading, error } = useEvents()

  const event = useMemo(() => {
    if (!eventId || !events.length) return null
    const found = events.find((e) => e.id === eventId)
    if (!found) return null
    return { ...found, status: getEventStatus(found.dates.start, found.dates.end) }
  }, [events, eventId])

  const eventType = event ? eventTypes[event.type] : null

  return { event, eventType, loading, error }
}

/**
 * 메인 페이지용 훅
 * - 진행 중인 행사가 있으면 우선 표시
 * - 이번 달 예정 행사가 있으면 표시
 * - 둘 다 없으면 가장 가까운 upcoming 3개
 */
export function useMainEvents() {
  const { events, eventTypes, loading, error } = useEvents()

  const eventsWithStatus = useMemo(
    () =>
      events.map((e) => ({
        ...e,
        status: getEventStatus(e.dates.start, e.dates.end),
      })),
    [events]
  )

  const result = useMemo(() => {
    const now = new Date()
    const y   = now.getFullYear()
    const m   = now.getMonth()

    const ongoing = eventsWithStatus
      .filter((e) => e.status === 'ongoing')
      .sort((a, b) => new Date(a.dates.start) - new Date(b.dates.start))

    const thisMonth = eventsWithStatus
      .filter((e) => {
        const d = new Date(e.dates.start)
        return e.status === 'upcoming' && d.getFullYear() === y && d.getMonth() === m
      })
      .sort((a, b) => new Date(a.dates.start) - new Date(b.dates.start))

    const nearestThree = eventsWithStatus
      .filter((e) => e.status === 'upcoming')
      .sort((a, b) => new Date(a.dates.start) - new Date(b.dates.start))
      .slice(0, 3)

    // 표시할 행사 결정
    if (ongoing.length > 0 || thisMonth.length > 0) {
      return {
        mode: ongoing.length > 0 ? 'ongoing' : 'this_month',
        events: [...ongoing, ...thisMonth],
      }
    }
    return { mode: 'nearest', events: nearestThree }
  }, [eventsWithStatus])

  return { ...result, eventTypes, loading, error }
}
