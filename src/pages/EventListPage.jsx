import { useState, useMemo } from 'react'
import { CalendarDays, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react'
import { useFilteredEvents } from '../hooks/useEvents'
import { useBoothCounts } from '../hooks/useBooths'
import PageHeader from '../components/common/PageHeader'
import EmptyState from '../components/common/EmptyState'
import EventCard from '../components/event/EventCard'
import styles from './EventListPage.module.css'

const TYPE_OPTIONS = [
  { value: 'all',         label: '전체' },
  { value: 'comicworld',  label: '코믹월드' },
  { value: 'illustarfes', label: '일러스타 페스' },
  { value: 'comiverse',   label: '코미버스' },
]

export default function EventListPage() {
  const [filterType,   setFilterType]   = useState('all')
  const [filterCity,   setFilterCity]   = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [hideOld,      setHideOld]      = useState(true)
  const [endedOpen,    setEndedOpen]    = useState(false)

  const { upcoming, ended, eventTypes, cities, loading, error } = useFilteredEvents({
    filterType,
    filterCity,
    filterStatus,
    hideOld,
  })

  // 전체 events에서 id 목록 추출 → 부스 수 일괄 조회
  const allEventIds = useMemo(
    () => [...upcoming, ...ended].map((e) => e.id),
    [upcoming, ended]
  )
  const { counts: boothCounts } = useBoothCounts(allEventIds)

  if (loading) {
    return (
      <div>
        <PageHeader title="행사 목록" />
        <div className={styles.loadingGrid}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className={styles.skeleton} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <PageHeader title="행사 목록" />
        <EmptyState
          icon={<CalendarDays size={36} strokeWidth={1.25} />}
          title="데이터를 불러오지 못했습니다"
          description={error}
        />
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="행사 목록"
        description="코믹월드, 일러스타 페스, 코미버스 등 동인 행사 일정입니다."
      />

      {/* 필터 바 */}
      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`${styles.filterChip} ${filterType === opt.value ? styles.active : ''}`}
              onClick={() => setFilterType(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className={styles.filterRight}>
          <select
            className={styles.select}
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
            aria-label="도시 필터"
          >
            {cities.map((c) => (
              <option key={c} value={c}>
                {c === 'all' ? '전체 도시' : c}
              </option>
            ))}
          </select>

          <button
            className={`${styles.toggleBtn} ${!hideOld ? styles.toggleActive : ''}`}
            onClick={() => setHideOld((v) => !v)}
            title={hideOld ? '2년 이상 지난 행사 숨김 중' : '모든 행사 표시 중'}
          >
            {hideOld ? <EyeOff size={14} /> : <Eye size={14} />}
            <span>{hideOld ? '지난 행사 숨김' : '모두 표시'}</span>
          </button>
        </div>
      </div>

      {/* 예정 행사 */}
      {filterStatus !== 'ended' && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span>예정된 행사</span>
            <span className={styles.count}>{upcoming.length}</span>
          </h2>

          {upcoming.length === 0 ? (
            <EmptyState
              icon={<CalendarDays size={32} strokeWidth={1.25} />}
              title="예정된 행사가 없습니다"
              description="필터를 변경하거나 모두 표시로 전환해보세요."
            />
          ) : (
            <div className={styles.grid}>
              {upcoming.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  eventType={eventTypes[event.type]}
                  boothCount={boothCounts[event.id]}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* 지난 행사 */}
      {filterStatus !== 'upcoming' && ended.length > 0 && (
        <section className={styles.section}>
          <button
            className={styles.endedToggle}
            onClick={() => setEndedOpen((v) => !v)}
            aria-expanded={endedOpen}
          >
            <h2 className={styles.sectionTitle}>
              <span>지난 행사</span>
              <span className={styles.count}>{ended.length}</span>
            </h2>
            {endedOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {endedOpen && (
            <div className={`${styles.grid} ${styles.endedGrid}`}>
              {ended.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  eventType={eventTypes[event.type]}
                  boothCount={boothCounts[event.id]}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* 전체 결과 없음 */}
      {upcoming.length === 0 && ended.length === 0 && (
        <EmptyState
          icon={<CalendarDays size={36} strokeWidth={1.25} />}
          title="조건에 맞는 행사가 없습니다"
          description="필터를 변경해보세요."
        />
      )}
    </div>
  )
}
