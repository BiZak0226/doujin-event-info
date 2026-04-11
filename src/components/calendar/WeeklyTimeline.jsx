import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  buildWeekRange,
  buildTimelineBars,
  assignLanes,
  dayjs,
} from '../../utils/calendarUtils'
import { getTypeColor, getTypeBgColor } from '../../utils/eventUtils'
import styles from './WeeklyTimeline.module.css'

const RANGE_DAYS = 20   // 중심 기준 ±10일 (총 21일)
const COL_WIDTH  = 44   // px, CSS와 일치

export default function WeeklyTimeline({ center, onPrev, onNext, events = [], eventTypes = {} }) {
  const navigate = useNavigate()
  const today    = dayjs()
  const days     = buildWeekRange(center, RANGE_DAYS)
  const bars     = assignLanes(buildTimelineBars(events, days))
  const laneCount = bars.length === 0 ? 1 : Math.max(...bars.map((b) => b.lane)) + 1

  const rangeLabel = `${days[0].format('YYYY. M. D.')} – ${days[days.length - 1].format('M. D.')}`

  return (
    <div className={styles.wrap}>
      {/* 헤더 */}
      <div className={styles.header}>
        <button className={styles.navBtn} onClick={onPrev} aria-label="이전">
          <ChevronLeft size={18} />
        </button>
        <span className={styles.rangeLabel}>{rangeLabel}</span>
        <button className={styles.navBtn} onClick={onNext} aria-label="다음">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* 스크롤 영역 */}
      <div className={styles.scrollArea}>
        <div
          className={styles.canvas}
          style={{ width: `${days.length * COL_WIDTH}px` }}
        >
          {/* 날짜 헤더 행 */}
          <div className={styles.dateRow}>
            {days.map((d, i) => {
              const isToday   = d.isSame(today, 'day')
              const isSun     = d.day() === 0
              const isSat     = d.day() === 6
              const isMonthStart = d.date() === 1

              return (
                <div
                  key={i}
                  className={`
                    ${styles.dateCell}
                    ${isToday    ? styles.todayCell  : ''}
                    ${isSun      ? styles.sunCell    : ''}
                    ${isSat      ? styles.satCell    : ''}
                  `}
                  style={{ width: COL_WIDTH }}
                >
                  {isMonthStart && (
                    <span className={styles.monthMark}>{d.format('M월')}</span>
                  )}
                  <span className={`${styles.dayNum} ${isToday ? styles.todayNum : ''}`}>
                    {d.date()}
                  </span>
                  <span className={styles.dowLabel}>{d.format('ddd')}</span>
                </div>
              )
            })}
          </div>

          {/* 오늘 세로선 */}
          {(() => {
            const todayIdx = days.findIndex((d) => d.isSame(today, 'day'))
            if (todayIdx === -1) return null
            return (
              <div
                className={styles.todayLine}
                style={{
                  left: `${todayIdx * COL_WIDTH + COL_WIDTH / 2}px`,
                  height: `${laneCount * 36 + 8}px`,
                }}
              />
            )
          })()}

          {/* 주말 컬럼 음영 */}
          {days.map((d, i) => {
            if (d.day() !== 0 && d.day() !== 6) return null
            return (
              <div
                key={i}
                className={styles.weekendCol}
                style={{
                  left:   `${i * COL_WIDTH}px`,
                  width:  `${COL_WIDTH}px`,
                  height: `${laneCount * 36 + 8}px`,
                }}
              />
            )
          })}

          {/* 바 레이어 */}
          <div
            className={styles.barsLayer}
            style={{ minHeight: `${laneCount * 36 + 8}px` }}
          >
            {bars.map(({ event, startIdx, spanDays, lane }) => {
              const typeColor = getTypeColor(event.type)
              const typeBg    = getTypeBgColor(event.type)
              return (
                <button
                  key={event.id}
                  className={`${styles.bar} ${styles[`status_${event.status}`]}`}
                  style={{
                    left:   `${startIdx * COL_WIDTH + 3}px`,
                    width:  `${spanDays * COL_WIDTH - 6}px`,
                    top:    `${lane * 36 + 4}px`,
                    '--bar-color': typeColor,
                    '--bar-bg':    typeBg,
                  }}
                  onClick={() => navigate(`/events/${event.id}`)}
                  title={event.name}
                >
                  <span className={styles.barDot} />
                  <span className={styles.barLabel}>{event.shortName}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* 범위 내 행사 없음 */}
      {bars.length === 0 && (
        <p className={styles.emptyMsg}>이 기간에 예정된 행사가 없습니다.</p>
      )}
    </div>
  )
}
