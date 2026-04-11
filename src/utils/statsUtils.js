/**
 * 배열에서 각 값의 빈도를 계산
 * @returns {{ key, count, ratio }[]} 빈도 내림차순
 */
export function frequency(arr) {
  const map = {}
  arr.forEach((v) => { map[v] = (map[v] ?? 0) + 1 })
  const total = arr.length
  return Object.entries(map)
    .map(([key, count]) => ({ key, count, ratio: count / total }))
    .sort((a, b) => b.count - a.count)
}

/**
 * 부스 데이터 → 규격 분포
 */
export function calcSpecDist(booths) {
  return frequency(booths.map((b) => b.spec))
}

/**
 * 부스 데이터 → 요일 참가 현황
 */
export function calcDayDist(booths) {
  const satOnly = booths.filter((b) => b.days.length === 1 && b.days[0] === '토').length
  const sunOnly = booths.filter((b) => b.days.length === 1 && b.days[0] === '일').length
  const both    = booths.filter((b) => b.days.includes('토') && b.days.includes('일')).length
  const total   = booths.length
  return [
    { key: '토요일만',  count: satOnly, ratio: satOnly / total },
    { key: '일요일만',  count: sunOnly, ratio: sunOnly / total },
    { key: '양일 참가', count: both,    ratio: both    / total },
  ]
}

/**
 * 부스 데이터 → 태그 빈도 top n
 */
export function calcTagDist(booths, topN = 20) {
  const all = booths.flatMap((b) => b.tags ?? [])
  return frequency(all).slice(0, topN)
}

/**
 * 부스 데이터 → 부스 크기 분포 (칸 수)
 */
export function calcSizeDist(booths) {
  return frequency(booths.map((b) => String(b.numbers.length) + '칸'))
}

/**
 * 부스 데이터 → 링크 타입 분포
 */
export function calcLinkDist(booths) {
  const all = booths.flatMap((b) => b.links ?? []).map((l) => l.type)
  const labelMap = {
    payment:   '사전주문/결제',
    official:  '공식 페이지',
    twitter:   'Twitter',
    community: '커뮤니티',
    other:     '기타',
  }
  return frequency(all).map((d) => ({ ...d, key: labelMap[d.key] ?? d.key }))
}

/**
 * 행사 데이터 → 연도별 행사 수
 */
export function calcYearDist(events) {
  return frequency(events.map((e) => e.dates.start.slice(0, 4)))
    .sort((a, b) => a.key.localeCompare(b.key))
}

/**
 * 행사 데이터 → 도시별 개최 수
 */
export function calcCityDist(events) {
  return frequency(events.map((e) => e.city))
}

/**
 * 행사 데이터 → 월별 분포
 */
export function calcMonthDist(events) {
  const months = Array.from({ length: 12 }, (_, i) => `${i + 1}월`)
  const raw    = frequency(events.map((e) => `${Number(e.dates.start.slice(5, 7))}월`))
  const rawMap = Object.fromEntries(raw.map((d) => [d.key, d.count]))
  return months.map((m) => ({ key: m, count: rawMap[m] ?? 0, ratio: (rawMap[m] ?? 0) / events.length }))
}

/**
 * 행사 데이터 → 행사 타입별 회차 수
 */
export function calcTypeDist(events, eventTypes) {
  const raw = frequency(events.map((e) => e.type))
  return raw.map((d) => ({ ...d, key: eventTypes[d.key]?.name ?? d.key }))
}

/**
 * 숫자를 퍼센트 문자열로 변환
 */
export function toPercent(ratio, digits = 1) {
  return (ratio * 100).toFixed(digits) + '%'
}
