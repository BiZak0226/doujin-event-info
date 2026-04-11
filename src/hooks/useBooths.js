import { useState, useEffect, useMemo } from 'react'

/**
 * 행사 ID 기반 부스 데이터 fetch
 * /data/booths/{eventId}.json
 */
export function useBooths(eventId) {
  const [booths,  setBooths]  = useState([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    if (!eventId) return
    setLoading(true)
    setError(null)
    setBooths([])

    fetch(`/data/booths/${eventId}.json`)
      .then((r) => {
        if (r.status === 404) throw new Error('NO_DATA')
        if (!r.ok) throw new Error('FETCH_ERROR')
        return r.json()
      })
      .then((json) => { setBooths(json); setLoading(false) })
      .catch((err) => { setError(err.message); setLoading(false) })
  }, [eventId])

  return { booths, loading, error }
}

/**
 * 부스 목록 필터링 + 검색 훅
 * @param {object[]} booths
 * @param {object}   options
 */
export function useFilteredBooths(booths, options = {}) {
  const {
    query      = '',
    filterSpec = 'all',
    filterDay  = 'all',
    filterTag  = '',
  } = options

  const filtered = useMemo(() => {
    let list = [...booths]

    // 검색 (부스명, 부스번호, 태그)
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      list = list.filter((b) =>
        b.name.toLowerCase().includes(q) ||
        b.displayNumber.toLowerCase().includes(q) ||
        b.numbers.some((n) => n.toLowerCase().includes(q)) ||
        b.tags?.some((t) => t.toLowerCase().includes(q)) ||
        b.artists?.some((a) => a.toLowerCase().includes(q))
      )
    }

    // spec 필터
    if (filterSpec !== 'all') {
      list = list.filter((b) => b.spec === filterSpec)
    }

    // 요일 필터
    if (filterDay !== 'all') {
      list = list.filter((b) => b.days.includes(filterDay))
    }

    // 태그 필터 (정확히 포함)
    if (filterTag) {
      list = list.filter((b) => b.tags?.includes(filterTag))
    }

    return list
  }, [booths, query, filterSpec, filterDay, filterTag])

  // 필터용 선택지 (전체 booths 기준)
  const specs = useMemo(
    () => ['all', ...Array.from(new Set(booths.map((b) => b.spec))).sort()],
    [booths]
  )

  const days = useMemo(
    () => ['all', ...Array.from(new Set(booths.flatMap((b) => b.days))).sort()],
    [booths]
  )

  // 태그 빈도순 정렬 (상위 30개)
  const topTags = useMemo(() => {
    const freq = {}
    booths.forEach((b) => b.tags?.forEach((t) => { freq[t] = (freq[t] ?? 0) + 1 }))
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30)
      .map(([tag]) => tag)
  }, [booths])

  return { filtered, specs, days, topTags }
}
