import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User, Heart, CalendarDays, Star,
  Store, Users, BookOpen, Trash2,
  ChevronRight, LogIn, MapPin,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth.jsx'
import { useFavorites, useBoothPlans } from '../hooks/useUserData'
import PageHeader from '../components/common/PageHeader'
import EmptyState from '../components/common/EmptyState'
import styles from './MyPage.module.css'

const TABS = [
  { key: 'planner',   label: '행사 플래너',  icon: CalendarDays },
  { key: 'favorites', label: '즐겨찾기',     icon: Heart },
]

const PLAN_STATUS = {
  plan:     { label: '방문 예정', color: 'var(--color-accent)',  bg: 'var(--color-accent-subtle)' },
  interest: { label: '관심',     color: '#d97706',               bg: '#fef3c7' },
}

const FAV_TYPE_META = {
  artist: { label: '작가',  icon: Users,     path: '/artists' },
  genre:  { label: '장르',  icon: BookOpen,  path: '/works' },
  booth:  { label: '부스',  icon: Store,     path: null },
  event:  { label: '행사',  icon: CalendarDays, path: '/events' },
}

// ── 즐겨찾기 카드 ──────────────────────────────────────────
function FavoriteItem({ item, onRemove }) {
  const navigate = useNavigate()
  const meta = FAV_TYPE_META[item.target_type] ?? FAV_TYPE_META.event
  const Icon = meta.icon

  return (
    <div className={styles.favItem}>
      <div className={styles.favIcon}>
        <Icon size={15} strokeWidth={1.75} />
      </div>
      <div className={styles.favBody}>
        <span className={styles.favType}>{meta.label}</span>
        <span className={styles.favName}>{item.target_id}</span>
      </div>
      <div className={styles.favActions}>
        {meta.path && (
          <button
            className={styles.favGoBtn}
            onClick={() => navigate(meta.path)}
            aria-label="페이지로 이동"
          >
            <ChevronRight size={14} />
          </button>
        )}
        <button
          className={styles.favRemoveBtn}
          onClick={() => onRemove(item.target_type, item.target_id)}
          aria-label="즐겨찾기 제거"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}

// ── 플래너 부스 카드 ──────────────────────────────────────
function PlanItem({ plan, onRemove, onStatusChange }) {
  const navigate  = useNavigate()
  const booth     = plan.booth
  const statusMeta = PLAN_STATUS[plan.status]

  return (
    <div className={styles.planItem}>
      <div
        className={styles.planStatus}
        style={{ background: statusMeta.bg, color: statusMeta.color }}
      >
        {statusMeta.label}
      </div>

      <div className={styles.planBody}>
        <p className={styles.planName}>{booth?.name ?? plan.booth_id}</p>
        <div className={styles.planMeta}>
          {booth?.display_number && (
            <span className={styles.planNumber}>{booth.display_number}</span>
          )}
          {booth?.days && (
            <span className={styles.planDays}>
              {(booth.days).join('·')}
            </span>
          )}
          <span className={styles.planEvent}>{plan.event_id}</span>
        </div>
        {plan.memo && <p className={styles.planMemo}>{plan.memo}</p>}
      </div>

      <div className={styles.planActions}>
        {/* 상태 토글 */}
        <button
          className={styles.planToggleBtn}
          onClick={() =>
            onStatusChange(
              plan.booth_id,
              plan.event_id,
              plan.status === 'plan' ? 'interest' : 'plan'
            )
          }
          title="상태 변경"
        >
          <Star size={13} strokeWidth={1.75} />
        </button>
        <button
          className={styles.planGoBtn}
          onClick={() => navigate(`/booths/${plan.event_id}`)}
          title="부스 목록으로"
        >
          <ChevronRight size={14} />
        </button>
        <button
          className={styles.planRemoveBtn}
          onClick={() => onRemove(plan.booth_id, plan.event_id)}
          title="제거"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}

// ── 메인 페이지 ──────────────────────────────────────────
export default function MyPage() {
  const { user, profile, isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('planner')
  const [favFilter, setFavFilter] = useState('all')

  const { favorites, loading: favLoading, remove: removeFav, byType } = useFavorites(user?.id)
  const { plans, loading: planLoading, remove: removePlan, upsert: upsertPlan, byEvent } = useBoothPlans(user?.id)

  // 행사별 플래너 그룹핑
  const plansByEvent = useMemo(() => {
    const map = {}
    plans.forEach((p) => {
      if (!map[p.event_id]) map[p.event_id] = []
      map[p.event_id].push(p)
    })
    return map
  }, [plans])

  // 즐겨찾기 필터
  const filteredFavs = useMemo(() =>
    favFilter === 'all' ? favorites : byType(favFilter),
  [favorites, favFilter, byType])

  // 미로그인
  if (!isLoggedIn) {
    return (
      <div className={styles.page}>
        <PageHeader title="마이페이지" />
        <EmptyState
          icon={<LogIn size={36} strokeWidth={1.25} />}
          title="로그인이 필요합니다"
          description="로그인하면 즐겨찾기, 행사 플래너 등 개인화 기능을 사용할 수 있습니다."
        />
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <PageHeader title="마이페이지" />

      {/* 프로필 카드 */}
      <div className={styles.profileCard}>
        <div className={styles.profileAvatar}>
          {profile?.avatar_url
            ? <img src={profile.avatar_url} alt="프로필" />
            : <User size={24} strokeWidth={1.5} />
          }
        </div>
        <div className={styles.profileInfo}>
          <p className={styles.profileName}>{profile?.nickname ?? user?.email}</p>
          <p className={styles.profileEmail}>{user?.email}</p>
        </div>
        <div className={styles.profileStats}>
          <div className={styles.profileStat}>
            <span className={styles.profileStatNum}>{favorites.length}</span>
            <span className={styles.profileStatLabel}>즐겨찾기</span>
          </div>
          <div className={styles.profileStat}>
            <span className={styles.profileStatNum}>{plans.length}</span>
            <span className={styles.profileStatLabel}>플래너</span>
          </div>
        </div>
      </div>

      {/* 탭 */}
      <div className={styles.tabs}>
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            className={`${styles.tab} ${tab === key ? styles.tabActive : ''}`}
            onClick={() => setTab(key)}
          >
            <Icon size={15} strokeWidth={1.75} />
            {label}
          </button>
        ))}
      </div>

      {/* ── 행사 플래너 탭 ── */}
      {tab === 'planner' && (
        <div className={styles.content}>
          {planLoading ? (
            <div className={styles.skeletonList}>
              {[...Array(4)].map((_, i) => <div key={i} className={styles.skeleton} />)}
            </div>
          ) : plans.length === 0 ? (
            <EmptyState
              icon={<CalendarDays size={32} strokeWidth={1.25} />}
              title="플래너가 비어있습니다"
              description="부스 목록에서 방문 예정이나 관심 부스를 추가해보세요."
            >
              <button
                className={styles.emptyBtn}
                onClick={() => navigate('/booths')}
              >
                부스 목록 보기
              </button>
            </EmptyState>
          ) : (
            Object.entries(plansByEvent).map(([eventId, eventPlans]) => (
              <section key={eventId} className={styles.eventSection}>
                <div className={styles.eventSectionHead}>
                  <MapPin size={14} strokeWidth={1.75} />
                  <h3 className={styles.eventSectionTitle}>{eventId}</h3>
                  <span className={styles.eventSectionCount}>{eventPlans.length}개</span>
                  <div className={styles.eventSectionStats}>
                    <span className={styles.statPlan}>
                      방문 예정 {eventPlans.filter((p) => p.status === 'plan').length}
                    </span>
                    <span className={styles.statInterest}>
                      관심 {eventPlans.filter((p) => p.status === 'interest').length}
                    </span>
                  </div>
                </div>
                <div className={styles.planList}>
                  {eventPlans.map((plan) => (
                    <PlanItem
                      key={`${plan.booth_id}-${plan.event_id}`}
                      plan={plan}
                      onRemove={removePlan}
                      onStatusChange={(boothId, eventId, status) =>
                        upsertPlan(boothId, eventId, status, plan.memo)
                      }
                    />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      )}

      {/* ── 즐겨찾기 탭 ── */}
      {tab === 'favorites' && (
        <div className={styles.content}>
          {/* 타입 필터 */}
          <div className={styles.favFilterBar}>
            {['all', 'event', 'booth', 'artist', 'genre'].map((type) => (
              <button
                key={type}
                className={`${styles.favFilterBtn} ${favFilter === type ? styles.favFilterActive : ''}`}
                onClick={() => setFavFilter(type)}
              >
                {type === 'all' ? '전체' : FAV_TYPE_META[type]?.label ?? type}
                <span className={styles.favFilterCount}>
                  {type === 'all' ? favorites.length : byType(type).length}
                </span>
              </button>
            ))}
          </div>

          {favLoading ? (
            <div className={styles.skeletonList}>
              {[...Array(4)].map((_, i) => <div key={i} className={styles.skeleton} />)}
            </div>
          ) : filteredFavs.length === 0 ? (
            <EmptyState
              icon={<Heart size={32} strokeWidth={1.25} />}
              title="즐겨찾기가 없습니다"
              description="작가, 장르, 부스, 행사를 즐겨찾기에 추가해보세요."
            />
          ) : (
            <div className={styles.favList}>
              {filteredFavs.map((item) => (
                <FavoriteItem
                  key={`${item.target_type}-${item.target_id}`}
                  item={item}
                  onRemove={removeFav}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
