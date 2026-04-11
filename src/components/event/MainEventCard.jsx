import { useNavigate } from 'react-router-dom'
import { MapPin, CalendarDays, Store, ArrowRight } from 'lucide-react'
import {
  formatDateRange,
  getDDay,
  getTypeColor,
  getTypeBgColor,
  getCategoryLabel,
} from '../../utils/eventUtils'
import styles from './MainEventCard.module.css'

export default function MainEventCard({ event, eventType }) {
  const navigate = useNavigate()
  const { id, name, type, category, city, venue, dates, status, collaboration } = event

  const dday      = getDDay(dates.start, dates.end)
  const dateStr   = formatDateRange(dates.start, dates.end)
  const typeColor = getTypeColor(type)
  const typeBg    = getTypeBgColor(type)
  const catLabel  = getCategoryLabel(category)
  const isOngoing = status === 'ongoing'

  return (
    <article
      className={`${styles.card} ${isOngoing ? styles.ongoing : ''}`}
      style={{ '--type-color': typeColor, '--type-bg': typeBg }}
      onClick={() => navigate(`/events/${id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/events/${id}`)}
      aria-label={`${name} 상세 보기`}
    >
      {/* 상단 색상 바 */}
      <div className={styles.topBar} />

      <div className={styles.body}>
        {/* 뱃지 행 */}
        <div className={styles.badgeRow}>
          <span
            className={styles.typeBadge}
            style={{ color: typeColor, background: typeBg }}
          >
            {eventType?.shortName ?? type}
            {catLabel && ` · ${catLabel}`}
          </span>

          {dday && (
            <span className={`${styles.dday} ${isOngoing ? styles.ddayOngoing : ''}`}>
              {isOngoing && <span className={styles.pulse} />}
              {dday}
            </span>
          )}
        </div>

        {/* 행사명 */}
        <h3 className={styles.name}>{name}</h3>

        {/* 날짜 + 장소 */}
        <div className={styles.meta}>
          <span className={styles.metaRow}>
            <CalendarDays size={14} strokeWidth={1.75} />
            {dateStr}
          </span>
          <span className={styles.metaRow}>
            <MapPin size={14} strokeWidth={1.75} />
            {city} · {venue}
          </span>
        </div>

        {/* 협력 행사 */}
        {collaboration?.length > 0 && (
          <div className={styles.collabs}>
            {collaboration.map((c) => (
              <span key={c} className={styles.collab}>{c}</span>
            ))}
          </div>
        )}

        {/* 액션 */}
        <div className={styles.actions}>
          <button
            className={styles.boothBtn}
            onClick={(e) => { e.stopPropagation(); navigate(`/booths/${id}`) }}
          >
            <Store size={14} strokeWidth={1.75} />
            부스 목록
          </button>
          <button
            className={styles.detailBtn}
            onClick={(e) => { e.stopPropagation(); navigate(`/events/${id}`) }}
          >
            자세히
            <ArrowRight size={14} strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </article>
  )
}
