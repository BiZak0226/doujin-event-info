import { useState, useEffect, useMemo } from 'react'

export function useEvents() {
  const [data, setData] = useState(null)   // { eventTypes, events }
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
 * @param {object} options
 * @param {string} options.filterType   - 'all' | 'comicworld' | 'illustarfes' | 'comiverse'
 * @param {string} options.filterCity   - 'all' | 도시명
 * @param {string} options.filterStatus - 'all' | 'upcoming' | 'ended'
 * @param {boolean} options.hideOld     - 2년 이상 지난 행사 숨김
 */
export function useFilteredEvents(options = {}) {
  const { events, eventTypes, loading, error } = useEvents()
  const {
    filterType   = 'all',
    filterCity   = 'all',
    filterStatus = 'all',
    hideOld      = true,
  } = options

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const filtered = useMemo(() => {
    let list = [...events]

    // 타입 필터
    if (filterType !== 'all') {
      list = list.filter((e) => e.type === filterType)
    }

    // 도시 필터
    if (filterCity !== 'all') {
      list = list.filter((e) => e.city === filterCity)
    }

    // 상태 필터
    if (filterStatus !== 'all') {
      list = list.filter((e) => e.status === filterStatus)
    }

    // 오래된 행사 숨김 (2년 이상)
    if (hideOld) {
      const cutoff = new Date(today)
      cutoff.setFullYear(cutoff.getFullYear() - 2)
      list = list.filter((e) => new Date(e.dates.start) >= cutoff)
    }

    return list
  }, [events, filterType, filterCity, filterStatus, hideOld, today])

  // upcoming: 가까운 순, ended: 최신 순
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

  // 필터용 도시 목록 (전체 events 기준)
  const cities = useMemo(
    () => ['all', ...Array.from(new Set(events.map((e) => e.city))).sort()],
    [events]
  )

  return { upcoming, ended, eventTypes, cities, loading, error }
}
