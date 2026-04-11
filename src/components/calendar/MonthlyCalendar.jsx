import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { buildMonthGrid, getEventsOnDate, dayjs } from '../../utils/calendarUtils'
import { getTypeColor, getTypeBgColor } from '../../utils/eventUtils'
import styles from './MonthlyCalendar.module.css'

const DOW = ['일', '월', '화', '수', '목', '금', '토']

function EventPill({ event, eventTypes }) {
  const navigate  = useNavigate()
  const typeColor = getTypeColor(event.type)
  const typeBg    = getTypeBgColor(event.type)
  const typeInfo  = eventTypes?.[event.type]

  return (
    <button
      className={styles.pill}
      style={{ '--pill-color': typeColor, '--pill-bg': typeBg }}
      onClick={(e) => { e.stopPropagation(); navigate(`/events/${event.id}`) }}
      title={event.name}
    >
      {event.shortName}
    </button>
  )
}

export default function MonthlyCalendar({ year, month, onPrev, onNext, events = [], eventTypes = {} }) {
  const navigate  = useNavigate()
  const today     = dayjs()
  const weeks     = buildMonthGrid(year, month)
  const monthLabel = dayjs(new Date(year, month, 1)).format('YYYY년 M월')

  return (
    <div className={styles.wrap}>
      {/* 헤더 */}
      <div className={styles.header}>
        <button className={styles.navBtn} onClick={onPrev} aria-label="이전 달">
          <ChevronLeft size={18} />
        </button>
        <h2 className={styles.monthLabel}>{monthLabel}</h2>
        <button className={styles.navBtn} onClick={onNext} aria-label="다음 달">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className={styles.dowRow}>
        {DOW.map((d, i) => (
          <div
            key={d}
            className={`${styles.dowCell} ${i === 0 ? styles.sun : ''} ${i === 6 ? styles.sat : ''}`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className={styles.grid}>
        {weeks.map((week, wi) => (
          <div key={wi} className={styles.week}>
            {week.map(({ date, isCurrentMonth }, di) => {
              const isToday    = date.isSame(today, 'day')
              const isSun      = di === 0
              const isSat      = di === 6
              const dayEvents  = getEventsOnDate(events, date.toDate())

              return (
                <div
                  key={di}
                  className={`
                    ${styles.cell}
                    ${!isCurrentMonth ? styles.cellOther : ''}
                    ${isToday         ? styles.cellToday : ''}
                  `}
                >
                  <span
                    className={`
                      ${styles.dateNum}
                      ${isSun ? styles.sun : ''}
                      ${isSat ? styles.sat : ''}
                      ${isToday ? styles.todayNum : ''}
                    `}
                  >
                    {date.date()}
                  </span>

                  <div className={styles.pillList}>
                    {dayEvents.slice(0, 3).map((ev) => (
                      <EventPill key={ev.id} event={ev} eventTypes={eventTypes} />
                    ))}
                    {dayEvents.length > 3 && (
                      <span className={styles.moreCount}>+{dayEvents.length - 3}</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* 이번 달 행사 없음 */}
      {events.filter((e) => {
        const s = dayjs(e.dates.start)
        return s.year() === year && s.month() === month
      }).length === 0 && (
        <p className={styles.emptyMsg}>이번 달 예정된 행사가 없습니다.</p>
      )}
    </div>
  )
}
