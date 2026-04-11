import { useState, useEffect, useMemo } from 'react'

// 한글 초성 배열
const CHOSUNG = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ']

/**
 * 이름 첫 글자의 그룹 키 반환
 * 한글 → 초성(ㄱ~ㅎ), 영문 → 'A-Z', 숫자 → '0-9', 기타 → '기타'
 */
export function getInitialGroup(name) {
  if (!name) return '기타'
  const c = name[0]
  if (/[0-9]/.test(c)) return '0-9'
  if (/[a-zA-Z]/.test(c)) return 'A-Z'
  if ('\uAC00' <= c && c <= '\uD7A3') {
    const idx = Math.floor((c.charCodeAt(0) - 0xAC00) / (21 * 28))
    return CHOSUNG[idx]
  }
  return '기타'
}

/**
 * 그룹 정렬 순서: 한글 초성 → A-Z → 0-9 → 기타
 */
export const GROUP_ORDER = [...CHOSUNG, 'A-Z', '0-9', '기타']

/**
 * works.json fetch
 */
export function useWorks() {
  const [works,   setWorks]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    fetch('/data/works.json')
      .then((r) => { if (!r.ok) throw new Error('works.json 로드 실패'); return r.json() })
      .then((json) => { setWorks(json); setLoading(false) })
      .catch((err) => { setError(err.message); setLoading(false) })
  }, [])

  return { works, loading, error }
}

/**
 * 작품 목록 + 부스 교차 집계 훅
 * @param {object[]} works
 * @param {object[]} allBooths  - 여러 행사 부스 합친 배열
 * @param {object}   options
 */
export function useFilteredWorks(works, allBooths = [], options = {}) {
  const { query = '', filterCategory = 'all' } = options

  // 작품명 → 부스 참여 횟수 맵
  const boothCountMap = useMemo(() => {
    const map = {}
    allBooths.forEach((b) => {
      ;(b.tags ?? []).forEach((tag) => {
        map[tag] = (map[tag] ?? 0) + 1
      })
    })
    return map
  }, [allBooths])

  const filtered = useMemo(() => {
    let list = [...works]

    if (query.trim()) {
      const q = query.trim().toLowerCase()
      list = list.filter((w) =>
        w.name.toLowerCase().includes(q) ||
        (w.aliases ?? []).some((a) => a.toLowerCase().includes(q))
      )
    }

    if (filterCategory !== 'all') {
      list = list.filter((w) => w.category === filterCategory)
    }

    return list
  }, [works, query, filterCategory])

  // 초성 그룹핑 + 그룹 내 가나다순 정렬
  const grouped = useMemo(() => {
    const map = {}
    filtered.forEach((w) => {
      const g = getInitialGroup(w.name)
      if (!map[g]) map[g] = []
      map[g].push(w)
    })

    // 그룹 내 이름 정렬
    Object.values(map).forEach((arr) => {
      arr.sort((a, b) => a.name.localeCompare(b.name, 'ko'))
    })

    // 정해진 순서로 정렬된 배열 반환
    return GROUP_ORDER
      .filter((g) => map[g])
      .map((g) => ({ group: g, items: map[g] }))
  }, [filtered])

  // category 목록
  const categories = useMemo(
    () => ['all', ...Array.from(new Set(works.map((w) => w.category)))],
    [works]
  )

  return { grouped, categories, boothCountMap }
}
