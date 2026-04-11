import { useNavigate } from 'react-router-dom'
import { MapPin, CalendarDays, Store, ExternalLink } from 'lucide-react'
import {
  formatDateRange,
  getDDay,
  getTypeColor,
  getTypeBgColor,
  getCategoryLabel,
} from '../../utils/eventUtils'
import styles from './EventCard.module.css'

export default function EventCard({ event, eventType }) {
  const navigate = useNavigate()

  const { id, name, shortName, type, category, city, venue, dates, status, links } = event
  const dday        = getDDay(dates.start, dates.end)
  const dateStr     = formatDateRange(dates.start, dates.end)
  const typeColor   = getTypeColor(type)
  const typeBgColor = getTypeBgColor(type)
  const catLabel    = getCategoryLabel(category)
  const hasBooths   = !!links?.boothData || true  // 파일 존재 여부는 런타임에 확인

  const handleBoothClick = (e) => {
    e.stopPropagation()
    navigate(`/booths/${id}`)
  }

  const isEnded = status === 'ended'

  return (
    <article
      className={`${styles.card} ${isEnded ? styles.ended : ''}`}
      style={{ '--type-color': typeColor, '--type-bg': typeBgColor }}
      onClick={() => navigate(`/events/${id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/events/${id}`)}
      aria-label={`${name} 상세 보기`}
    >
      {/* 타입 스트라이프 */}
      <div className={styles.stripe} />

      <div className={styles.body}>
        {/* 헤더 행 */}
        <div className={styles.header}>
          <div className={styles.badges}>
            <span
              className={styles.typeBadge}
              style={{ color: typeColor, background: typeBgColor }}
            >
              {eventType?.shortName ?? type}
              {catLabel && ` · ${catLabel}`}
            </span>
            {dday && (
              <span className={`${styles.ddayBadge} ${dday === '진행 중' ? styles.ongoing : ''}`}>
                {dday}
              </span>
            )}
          </div>

          {/* 외부 링크 */}
          {eventType?.links?.homepage && (
            <a
              href={eventType.links.homepage}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.extLink}
              aria-label={`${name} 공식 홈페이지`}
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink size={13} />
            </a>
          )}
        </div>

        {/* 행사명 */}
        <h3 className={styles.name}>{name}</h3>

        {/* 메타 정보 */}
        <div className={styles.meta}>
          <span className={styles.metaItem}>
            <CalendarDays size={13} strokeWidth={1.75} />
            {dateStr}
          </span>
          <span className={styles.metaItem}>
            <MapPin size={13} strokeWidth={1.75} />
            {city} · {venue}
          </span>
        </div>

        {/* 협력 행사 태그 */}
        {event.collaboration?.length > 0 && (
          <div className={styles.collabs}>
            {event.collaboration.map((c) => (
              <span key={c} className={styles.collabTag}>{c}</span>
            ))}
          </div>
        )}

        {/* 하단 액션 */}
        <div className={styles.footer}>
          <button
            className={styles.boothBtn}
            onClick={handleBoothClick}
            aria-label={`${name} 부스 목록 보기`}
          >
            <Store size={13} strokeWidth={1.75} />
            부스 목록
          </button>
        </div>
      </div>
    </article>
  )
}
