import dayjs from 'dayjs'
import 'dayjs/locale/ko'
dayjs.locale('ko')

/**
 * 날짜 포맷
 * start === end 이면 "2026. 3. 28. (토)" 하루만
 * 다르면 "2026. 3. 28.(토) – 3. 29.(일)"
 */
export function formatDateRange(start, end) {
  const s = dayjs(start)
  const e = dayjs(end)

  if (start === end) {
    return s.format('YYYY. M. D. (ddd)')
  }

  // 같은 해/월이면 끝 날짜 축약
  if (s.year() === e.year() && s.month() === e.month()) {
    return `${s.format('YYYY. M. D.(ddd)')} – ${e.format('D.(ddd)')}`
  }

  return `${s.format('YYYY. M. D.(ddd)')} – ${e.format('M. D.(ddd)')}`
}

/**
 * 날짜 기반 행사 상태 계산 (status 필드 불필요)
 * @returns {'upcoming' | 'ongoing' | 'ended'}
 */
export function getEventStatus(startStr, endStr) {
  const today = dayjs().startOf('day')
  const start = dayjs(startStr)
  const end   = dayjs(endStr)

  if (today.isAfter(end))          return 'ended'
  if (today.isBefore(start))       return 'upcoming'
  return 'ongoing'
}

/**
 * 행사까지 남은 일수 텍스트
 * 진행 중이면 "진행 중"
 * 미래면 "D-n" (당일은 "D-0")
 * 과거면 null
 */
export function getDDay(startStr, endStr) {
  const status = getEventStatus(startStr, endStr)
  if (status === 'ended')   return null
  if (status === 'ongoing') return '진행 중'

  const diff = dayjs(startStr).diff(dayjs().startOf('day'), 'day')
  return diff === 0 ? 'D-0' : `D-${diff}`
}

/**
 * 행사 타입별 accent 색상 CSS 변수명 반환
 */
export function getTypeColor(type) {
  const map = {
    comicworld:  'var(--color-cw)',
    illustarfes: 'var(--color-ilfe)',
    comiverse:   'var(--color-comi)',
  }
  return map[type] ?? 'var(--color-text-muted)'
}

/**
 * 행사 타입별 배경색 CSS 변수명 반환 (subtle)
 */
export function getTypeBgColor(type) {
  const map = {
    comicworld:  '#fff4f0',
    illustarfes: '#f5f0ff',
    comiverse:   '#effafc',
  }
  return map[type] ?? 'var(--color-bg-subtle)'
}

/**
 * category 한국어 라벨
 */
export function getCategoryLabel(category) {
  const map = {
    regular: '정기',
    special: '특별',
    petit:   '쁘띠',
  }
  return map[category] ?? ''
}

/**
 * 부스 데이터 파일 경로 반환 (booths 디렉토리 구조 기준)
 */
export function getBoothDataPath(eventId) {
  return `/data/booths/${eventId}.json`
}
