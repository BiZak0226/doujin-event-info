import { useNavigate } from 'react-router-dom'
import { CalendarDays, Store, BookOpen, Users, ArrowRight, RefreshCw } from 'lucide-react'
import dayjs from 'dayjs'
import 'dayjs/locale/ko'
import { useMainEvents } from '../hooks/useEvents'
import MainEventCard from '../components/event/MainEventCard'
import EmptyState from '../components/common/EmptyState'
import styles from './MainPage.module.css'

dayjs.locale('ko')

// 섹션 제목 결정
function getSectionLabel(mode) {
  if (mode === 'ongoing')    return { title: '지금 진행 중인 행사', sub: null }
  if (mode === 'this_month') return { title: `${dayjs().format('M월')} 행사`, sub: null }
  return {
    title: '가까운 행사',
    sub: '이번 달 예정된 행사가 없습니다. 가장 가까운 행사 3개를 표시합니다.',
  }
}

// 퀵 링크 목록
const QUICK_LINKS = [
  { to: '/events',    icon: CalendarDays, label: '행사 목록',  desc: '전체 행사 일정 보기' },
  { to: '/booths',    icon: Store,        label: '부스 목록',  desc: '행사별 부스 탐색' },
  { to: '/artists',   icon: Users,        label: '작가 목록',  desc: '참여 작가 프로필' },
  { to: '/works',     icon: BookOpen,     label: '작품 목록',  desc: '장르 · 작품 정보' },
]

export default function MainPage() {
  const navigate = useNavigate()
  const { events, mode, eventTypes, loading, error } = useMainEvents()
  const { title, sub } = getSectionLabel(mode)
  const now = dayjs()

  return (
    <div className={styles.page}>

      {/* ── 히어로 ── */}
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <p className={styles.heroDate}>
            {now.format('YYYY년 M월 D일 (ddd)')}
          </p>
          <h1 className={styles.heroTitle}>동인 행사 정보</h1>
          <p className={styles.heroDesc}>
            국내 동인 행사 일정과 부스 정보를 한눈에 확인하세요.
          </p>
        </div>
      </section>

      {/* ── 행사 섹션 ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>{title}</h2>
            {sub && <p className={styles.sectionSub}>{sub}</p>}
          </div>
          <button
            className={styles.moreBtn}
            onClick={() => navigate('/events')}
          >
            전체 보기
            <ArrowRight size={14} strokeWidth={1.75} />
          </button>
        </div>

        {loading && (
          <div className={styles.cardGrid}>
            {[...Array(3)].map((_, i) => (
              <div key={i} className={styles.skeleton} />
            ))}
          </div>
        )}

        {error && (
          <EmptyState
            icon={<RefreshCw size={32} strokeWidth={1.25} />}
            title="데이터를 불러오지 못했습니다"
            description={error}
          />
        )}

        {!loading && !error && events.length === 0 && (
          <EmptyState
            icon={<CalendarDays size={32} strokeWidth={1.25} />}
            title="예정된 행사가 없습니다"
            description="행사 목록 페이지에서 지난 행사를 확인해보세요."
          >
            <button
              className={styles.emptyBtn}
              onClick={() => navigate('/events')}
            >
              행사 목록 보기
            </button>
          </EmptyState>
        )}

        {!loading && !error && events.length > 0 && (
          <div className={styles.cardGrid}>
            {events.map((event) => (
              <MainEventCard
                key={event.id}
                event={event}
                eventType={eventTypes[event.type]}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── 퀵 링크 ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>바로가기</h2>
        <div className={styles.quickGrid}>
          {QUICK_LINKS.map(({ to, icon: Icon, label, desc }) => (
            <button
              key={to}
              className={styles.quickCard}
              onClick={() => navigate(to)}
            >
              <div className={styles.quickIcon}>
                <Icon size={20} strokeWidth={1.75} />
              </div>
              <div className={styles.quickText}>
                <span className={styles.quickLabel}>{label}</span>
                <span className={styles.quickDesc}>{desc}</span>
              </div>
              <ArrowRight size={15} strokeWidth={1.75} className={styles.quickArrow} />
            </button>
          ))}
        </div>
      </section>

    </div>
  )
}
