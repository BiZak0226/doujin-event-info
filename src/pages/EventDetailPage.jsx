import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, CalendarDays, MapPin, Store,
  ExternalLink, Globe, Hash,
} from 'lucide-react'
import dayjs from 'dayjs'
import 'dayjs/locale/ko'
import { useEvent } from '../hooks/useEvents'
import {
  formatDateRange,
  getDDay,
  getTypeColor,
  getTypeBgColor,
  getCategoryLabel,
  getEventStatus,
} from '../utils/eventUtils'
import BrandIcon from '../components/common/BrandIcon'
import EmptyState from '../components/common/EmptyState'
import styles from './EventDetailPage.module.css'

dayjs.locale('ko')

/* 링크 타입별 아이콘 + 라벨 */
function LinkItem({ href, label, brand, icon: Icon }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.linkItem}
    >
      {brand
        ? <BrandIcon platform={brand} size={15} color="currentColor" />
        : <Icon size={15} strokeWidth={1.75} />
      }
      <span>{label}</span>
      <ExternalLink size={12} className={styles.linkExtIcon} />
    </a>
  )
}

/* eventType.links 키 → 라벨 + 아이콘 매핑 */
function resolveLink(key, url) {
  const map = {
    homepage:   { label: '공식 홈페이지',         icon: Globe },
    twitter:    { label: 'Twitter / X',            brand: 'twitter' },
    twitter_:   { label: 'Twitter / X (공식 2)',   brand: 'twitter' },
    'blue sky': { label: 'Bluesky',                brand: 'bluesky' },
    bluesky:    { label: 'Bluesky',                brand: 'bluesky' },
    gall:       { label: 'DC 갤러리',              icon: Hash },
  }
  const meta = map[key] ?? { label: key, icon: Globe }
  return { ...meta, url }
}

/* 상태 뱃지 */
function StatusBadge({ status }) {
  const map = {
    upcoming: { label: '예정',    cls: styles.badgeUpcoming },
    ongoing:  { label: '진행 중', cls: styles.badgeOngoing  },
    ended:    { label: '종료',    cls: styles.badgeEnded    },
  }
  const { label, cls } = map[status] ?? { label: status, cls: '' }
  return (
    <span className={`${styles.statusBadge} ${cls}`}>
      {status === 'ongoing' && <span className={styles.pulse} />}
      {label}
    </span>
  )
}

export default function EventDetailPage() {
  const { eventId } = useParams()
  const navigate    = useNavigate()
  const { event, eventType, loading, error } = useEvent(eventId)

  /* 로딩 */
  if (loading) {
    return (
      <div className={styles.page}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> 행사 목록
        </button>
        <div className={styles.skeletonWrap}>
          <div className={styles.skeletonTitle} />
          <div className={styles.skeletonBody} />
        </div>
      </div>
    )
  }

  /* 오류 / 없는 행사 */
  if (error || !event) {
    return (
      <div className={styles.page}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> 행사 목록
        </button>
        <EmptyState
          title={error ?? '행사를 찾을 수 없습니다'}
          description={`"${eventId}"에 해당하는 행사 정보가 없습니다.`}
        />
      </div>
    )
  }

  const {
    id, name, type, category, city, venue,
    dates, collaboration, episode,
  } = event

  const status    = getEventStatus(dates.start, dates.end)
  const dday      = getDDay(dates.start, dates.end)
  const dateStr   = formatDateRange(dates.start, dates.end)
  const typeColor = getTypeColor(type)
  const typeBg    = getTypeBgColor(type)
  const catLabel  = getCategoryLabel(category)

  /* 카카오맵 검색 링크 */
  const kakaoMapUrl = `https://map.kakao.com/link/search/${encodeURIComponent(venue)}`

  /* eventType 외부 링크 목록 */
  const typeLinks = eventType?.links
    ? Object.entries(eventType.links).map(([k, v]) => resolveLink(k, v))
    : []

  return (
    <div className={styles.page}>

      {/* 뒤로가기 */}
      <button className={styles.backBtn} onClick={() => navigate('/events')}>
        <ArrowLeft size={16} strokeWidth={2} />
        행사 목록
      </button>

      {/* ── 히어로 카드 ── */}
      <div
        className={styles.hero}
        style={{ '--type-color': typeColor, '--type-bg': typeBg }}
      >
        <div className={styles.heroBar} />
        <div className={styles.heroBody}>

          {/* 타입 뱃지 + 상태 */}
          <div className={styles.heroMeta}>
            <span
              className={styles.typeBadge}
              style={{ color: typeColor, background: typeBg }}
            >
              {eventType?.name ?? type}
              {catLabel && ` · ${catLabel}`}
              {episode != null && ` ${episode}회`}
            </span>
            <StatusBadge status={status} />
            {dday && (
              <span className={styles.ddayBadge}>{dday}</span>
            )}
          </div>

          {/* 행사명 */}
          <h1 className={styles.heroTitle}>{name}</h1>

          {/* 날짜 + 장소 */}
          <div className={styles.heroInfo}>
            <span className={styles.infoRow}>
              <CalendarDays size={15} strokeWidth={1.75} />
              {dateStr}
            </span>
            <span className={styles.infoRow}>
              <MapPin size={15} strokeWidth={1.75} />
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
        </div>
      </div>

      {/* ── 본문 그리드 ── */}
      <div className={styles.grid}>

        {/* 왼쪽: 상세 정보 */}
        <div className={styles.main}>

          {/* 일정 */}
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>
              <CalendarDays size={16} strokeWidth={1.75} />
              일정
            </h2>
            <div className={styles.infoTable}>
              <div className={styles.infoRow2}>
                <span className={styles.infoLabel}>시작</span>
                <span className={styles.infoValue}>
                  {dayjs(dates.start).format('YYYY년 M월 D일 (ddd)')}
                </span>
              </div>
              <div className={styles.infoRow2}>
                <span className={styles.infoLabel}>종료</span>
                <span className={styles.infoValue}>
                  {dayjs(dates.end).format('YYYY년 M월 D일 (ddd)')}
                </span>
              </div>
              {dates.start !== dates.end && (
                <div className={styles.infoRow2}>
                  <span className={styles.infoLabel}>기간</span>
                  <span className={styles.infoValue}>
                    {dayjs(dates.end).diff(dayjs(dates.start), 'day') + 1}일간
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* 장소 */}
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>
              <MapPin size={16} strokeWidth={1.75} />
              장소
            </h2>
            <div className={styles.infoTable}>
              <div className={styles.infoRow2}>
                <span className={styles.infoLabel}>도시</span>
                <span className={styles.infoValue}>{city}</span>
              </div>
              <div className={styles.infoRow2}>
                <span className={styles.infoLabel}>장소</span>
                <span className={styles.infoValue}>{venue}</span>
              </div>
            </div>
            <a
              href={kakaoMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.mapLink}
            >
              <MapPin size={14} />
              카카오맵에서 보기
              <ExternalLink size={12} />
            </a>
          </section>

          {/* 협력 행사 (있을 때만) */}
          {collaboration?.length > 0 && (
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>
                <Hash size={16} strokeWidth={1.75} />
                협력 행사
              </h2>
              <div className={styles.collabList}>
                {collaboration.map((c) => (
                  <span key={c} className={styles.collabItem}>{c}</span>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* 오른쪽: 사이드 */}
        <aside className={styles.side}>

          {/* 부스 목록 바로가기 */}
          <div className={styles.boothCta}>
            <p className={styles.boothCtaLabel}>이 행사의 부스 목록</p>
            <Link
              to={`/booths/${id}`}
              className={styles.boothCtaBtn}
            >
              <Store size={16} strokeWidth={1.75} />
              부스 목록 보기
            </Link>
          </div>

          {/* 공식 링크 */}
          {typeLinks.length > 0 && (
            <div className={styles.sideCard}>
              <h3 className={styles.sideCardTitle}>공식 링크</h3>
              <div className={styles.linkList}>
                {typeLinks.map(({ label, icon, brand, url }) => (
                  <LinkItem key={label} href={url} label={label} icon={icon} brand={brand} />
                ))}
              </div>
            </div>
          )}

          {/* 행사 정보 요약 */}
          <div className={styles.sideCard}>
            <h3 className={styles.sideCardTitle}>행사 정보</h3>
            <div className={styles.summaryList}>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>주최</span>
                <span className={styles.summaryValue}>{eventType?.name ?? type}</span>
              </div>
              {episode != null && (
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>회차</span>
                  <span className={styles.summaryValue}>{episode}회</span>
                </div>
              )}
              {catLabel && (
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>분류</span>
                  <span className={styles.summaryValue}>{catLabel}</span>
                </div>
              )}
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>지역</span>
                <span className={styles.summaryValue}>{city}</span>
              </div>
            </div>
          </div>

        </aside>
      </div>
    </div>
  )
}
