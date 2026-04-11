import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import 'dayjs/locale/ko'

dayjs.extend(isBetween)
dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)
dayjs.locale('ko')

/**
 * 월간 달력용 날짜 배열 생성
 * 앞뒤 빈 칸 포함 (일요일 시작)
 * @returns {{ date: dayjs, isCurrentMonth: boolean }[][]}  — 6행 7열
 */
export function buildMonthGrid(year, month) {
  const firstDay = dayjs(new Date(year, month, 1))
  const lastDay  = firstDay.endOf('month')

  // 첫 날의 요일 (0=일, 6=토)
  const startPad = firstDay.day()
  const daysInMonth = lastDay.date()

  const cells = []

  // 이전 달 빈 칸
  for (let i = 0; i < startPad; i++) {
    cells.push({ date: firstDay.subtract(startPad - i, 'day'), isCurrentMonth: false })
  }

  // 이번 달
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: firstDay.date(d), isCurrentMonth: true })
  }

  // 다음 달 빈 칸 (6행 42칸 채우기)
  const remaining = 42 - cells.length
  for (let i = 1; i <= remaining; i++) {
    cells.push({ date: lastDay.add(i, 'day'), isCurrentMonth: false })
  }

  // 7개씩 묶어 주 배열로
  const weeks = []
  for (let i = 0; i < 42; i += 7) {
    weeks.push(cells.slice(i, i + 7))
  }
  return weeks
}

/**
 * 주간 타임라인용 날짜 배열 생성
 * 기준일 중심으로 ±n일
 */
export function buildWeekRange(center, rangeDays = 14) {
  const half = Math.floor(rangeDays / 2)
  const start = dayjs(center).subtract(half, 'day')
  const days = []
  for (let i = 0; i <= rangeDays; i++) {
    days.push(start.add(i, 'day'))
  }
  return days
}

/**
 * 특정 날짜에 걸쳐있는 행사 목록 반환
 */
export function getEventsOnDate(events, date) {
  const d = dayjs(date)
  return events.filter((e) => {
    const s = dayjs(e.dates.start)
    const en = dayjs(e.dates.end)
    return d.isSameOrAfter(s, 'day') && d.isSameOrBefore(en, 'day')
  })
}

/**
 * 주간 타임라인용 — 각 행사의 바 위치/너비 계산
 * @param events - 행사 배열 (status 포함)
 * @param days   - buildWeekRange 결과
 * @returns { event, startIdx, endIdx, spanDays }[]
 */
export function buildTimelineBars(events, days) {
  const rangeStart = days[0]
  const rangeEnd   = days[days.length - 1]

  return events
    .filter((e) => {
      const s  = dayjs(e.dates.start)
      const en = dayjs(e.dates.end)
      return s.isSameOrBefore(rangeEnd, 'day') && en.isSameOrAfter(rangeStart, 'day')
    })
    .map((e) => {
      const s  = dayjs(e.dates.start)
      const en = dayjs(e.dates.end)

      // 범위 내로 클램프
      const clampedStart = s.isBefore(rangeStart, 'day')  ? rangeStart : s
      const clampedEnd   = en.isAfter(rangeEnd,   'day')  ? rangeEnd   : en

      const startIdx = days.findIndex((d) => d.isSame(clampedStart, 'day'))
      const endIdx   = days.findIndex((d) => d.isSame(clampedEnd,   'day'))
      const spanDays = endIdx - startIdx + 1

      return { event: e, startIdx, endIdx, spanDays }
    })
    .sort((a, b) => a.startIdx - b.startIdx)
}

/**
 * 겹치는 바를 레인(행)으로 배치
 * 반환: { event, startIdx, spanDays, lane }[]
 */
export function assignLanes(bars) {
  const lanes = [] // lanes[i] = 마지막으로 점유된 endIdx

  return bars.map((bar) => {
    let lane = lanes.findIndex((endIdx) => endIdx < bar.startIdx)
    if (lane === -1) {
      lane = lanes.length
      lanes.push(bar.endIdx)
    } else {
      lanes[lane] = bar.endIdx
    }
    return { ...bar, lane }
  })
}

export { dayjs }
