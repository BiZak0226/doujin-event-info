import { useState, useEffect, useRef } from 'react'
import { CalendarDays } from 'lucide-react'
import { useEvents } from '../hooks/useEvents'
import { getEventStatus } from '../utils/eventUtils'
import { dayjs } from '../utils/calendarUtils'
import PageHeader from '../components/common/PageHeader'
import EmptyState from '../components/common/EmptyState'
import MonthlyCalendar from '../components/calendar/MonthlyCalendar'
import WeeklyTimeline from '../components/calendar/WeeklyTimeline'
import styles from './CalendarPage.module.css'

export default function CalendarPage() {
  const [view, setView] = useState('monthly')

  const today = dayjs()
  const [year,   setYear]   = useState(today.year())
  const [month,  setMonth]  = useState(today.month())   // 0-indexed
  const [center, setCenter] = useState(today)

  const { events, eventTypes, loading, error } = useEvents()

  // status 실시간 계산
  const eventsWithStatus = events.map((e) => ({
    ...e,
    status: getEventStatus(e.dates.start, e.dates.end),
  }))

  // 월간: 이전/다음 달
  const handlePrevMonth = () => {
    if (month === 0) { setYear((y) => y - 1); setMonth(11) }
    else              setMonth((m) => m - 1)
  }
  const handleNextMonth = () => {
    if (month === 11) { setYear((y) => y + 1); setMonth(0) }
    else               setMonth((m) => m + 1)
  }

  // 주간: ±10일 이동
  const STEP = 10
  const handlePrevWeek = () => setCenter((c) => c.subtract(STEP, 'day'))
  const handleNextWeek = () => setCenter((c) => c.add(STEP, 'day'))

  // 뷰 전환 시 현재 달/오늘로 리셋
  const handleViewChange = (v) => {
    setView(v)
    if (v === 'monthly') { setYear(today.year()); setMonth(today.month()) }
    else                   setCenter(today)
  }

  if (loading) return (
    <div>
      <PageHeader title="이벤트 캘린더" />
      <div className={styles.skeleton} />
    </div>
  )

  if (error) return (
    <div>
      <PageHeader title="이벤트 캘린더" />
      <EmptyState
        icon={<CalendarDays size={36} strokeWidth={1.25} />}
        title="데이터를 불러오지 못했습니다"
        description={error}
      />
    </div>
  )

  return (
    <div className={styles.page}>
      <PageHeader title="이벤트 캘린더">
        {/* 뷰 토글 */}
        <div className={styles.viewToggle}>
          <button
            className={`${styles.viewBtn} ${view === 'monthly' ? styles.viewActive : ''}`}
            onClick={() => handleViewChange('monthly')}
          >
            월간
          </button>
          <button
            className={`${styles.viewBtn} ${view === 'weekly' ? styles.viewActive : ''}`}
            onClick={() => handleViewChange('weekly')}
          >
            주간
          </button>
        </div>
      </PageHeader>

      {/* 범례 */}
      <div className={styles.legend}>
        {Object.entries(eventTypes).map(([key, t]) => {
          const colorMap = {
            comicworld:  'var(--color-cw)',
            illustarfes: 'var(--color-ilfe)',
            comiverse:   'var(--color-comi)',
          }
          return (
            <span key={key} className={styles.legendItem}>
              <span
                className={styles.legendDot}
                style={{ background: colorMap[key] ?? 'var(--color-text-muted)' }}
              />
              {t.name}
            </span>
          )
        })}
      </div>

      {/* 캘린더 */}
      {view === 'monthly' ? (
        <MonthlyCalendar
          year={year}
          month={month}
          onPrev={handlePrevMonth}
          onNext={handleNextMonth}
          events={eventsWithStatus}
          eventTypes={eventTypes}
        />
      ) : (
        <WeeklyTimeline
          center={center}
          onPrev={handlePrevWeek}
          onNext={handleNextWeek}
          events={eventsWithStatus}
          eventTypes={eventTypes}
        />
      )}
    </div>
  )
}
