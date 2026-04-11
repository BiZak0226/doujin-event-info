import { useState, useEffect, useMemo } from 'react'

/**
 * artists.json fetch
 */
export function useArtists() {
  const [artists, setArtists] = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    fetch('/data/artists.json')
      .then((r) => { if (!r.ok) throw new Error('artists.json 로드 실패'); return r.json() })
      .then((json) => { setArtists(json); setLoading(false) })
      .catch((err) => { setError(err.message); setLoading(false) })
  }, [])

  return { artists, loading, error }
}

/**
 * 단일 행사의 부스 데이터를 받아 작가별 참여 정보를 집계
 * 여러 행사 부스가 추가될수록 더 풍부해지는 구조
 *
 * @param {object[]} allBooths - 여러 행사 부스를 합친 배열
 * @returns {Map<string, { boothList, topTags }>}
 */
export function buildArtistBoothMap(allBooths) {
  const map = new Map()

  allBooths.forEach((booth) => {
    ;(booth.artists ?? []).forEach((artistId) => {
      if (!map.has(artistId)) map.set(artistId, { boothList: [], tagFreq: {} })
      const entry = map.get(artistId)
      entry.boothList.push({
        boothId:      booth.id,
        boothName:    booth.name,
        displayNumber: booth.displayNumber,
        tags:         booth.tags ?? [],
        eventId:      booth.eventId ?? null,
      })
      ;(booth.tags ?? []).forEach((t) => {
        entry.tagFreq[t] = (entry.tagFreq[t] ?? 0) + 1
      })
    })
  })

  // topTags 계산
  map.forEach((entry) => {
    entry.topTags = Object.entries(entry.tagFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag)
    delete entry.tagFreq
  })

  return map
}

/**
 * 작가 목록 필터링
 */
export function useFilteredArtists(artists, boothMap, options = {}) {
  const { query = '', filterPlatform = 'all', filterTag = '' } = options

  const filtered = useMemo(() => {
    let list = [...artists]

    // 이름 검색
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      list = list.filter((a) =>
        a.nickname.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q)
      )
    }

    // 플랫폼 필터 (해당 플랫폼 링크가 있는 작가만)
    if (filterPlatform !== 'all') {
      list = list.filter((a) => !!a.links?.[filterPlatform])
    }

    // 태그 필터 (부스 집계 태그 기준)
    if (filterTag) {
      list = list.filter((a) => {
        const entry = boothMap.get(a.id)
        return entry?.topTags?.includes(filterTag)
      })
    }

    return list
  }, [artists, boothMap, query, filterPlatform, filterTag])

  return filtered
}
