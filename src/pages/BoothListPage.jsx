import { useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Store, Search, LayoutGrid, List, X,
  CalendarDays, ChevronDown,
} from 'lucide-react'
import { useBooths, useFilteredBooths } from '../hooks/useBooths'
import { useEvents } from '../hooks/useEvents'
import PageHeader from '../components/common/PageHeader'
import EmptyState from '../components/common/EmptyState'
import BoothCard from '../components/booth/BoothCard'
import BoothListItem from '../components/booth/BoothListItem'
import BoothDetailModal from '../components/booth/BoothDetailModal'
import styles from './BoothListPage.module.css'

// 리스트 헤더 (컬럼 레이블)
function ListHeader() {
  return (
    <div className={styles.listHeader}>
      <span>부스 번호</span>
      <span>요일</span>
      <span>규격</span>
      <span>부스명</span>
      <span>작가</span>
      <span>장르 · 작품</span>
    </div>
  )
}

export default function BoothListPage() {
  const { eventId } = useParams()
  const { booths, loading, error } = useBooths(eventId)
  const { events, eventTypes }     = useEvents()

  const [view,        setView]        = useState('card') // 'card' | 'list'
  const [query,       setQuery]       = useState('')
  const [filterSpec,  setFilterSpec]  = useState('all')
  const [filterDay,   setFilterDay]   = useState('all')
  const [filterTag,   setFilterTag]   = useState('')
  const [tagOpen,     setTagOpen]     = useState(false)
  const [selected,    setSelected]    = useState(null)

  const { filtered, specs, days, topTags } = useFilteredBooths(booths, {
    query, filterSpec, filterDay, filterTag,
  })

  const resetFilters = useCallback(() => {
    setQuery(''); setFilterSpec('all'); setFilterDay('all'); setFilterTag('')
  }, [])

  const hasFilter = query || filterSpec !== 'all' || filterDay !== 'all' || filterTag

  // 현재 행사 정보
  const eventInfo     = events.find((e) => e.id === eventId)
  const eventTypeInfo = eventInfo ? eventTypes[eventInfo.type] : null

  // ── 행사 미선택 ──
  if (!eventId) {
    return (
      <div>
        <PageHeader
          title="부스 목록"
          description="행사를 선택하면 해당 행사의 부스 목록을 볼 수 있습니다."
        />
        <EmptyState
          icon={<Store size={36} strokeWidth={1.25} />}
          title="행사를 선택해주세요"
          description="행사 목록에서 부스 목록 보기를 클릭하거나, 직접 URL에 행사 ID를 입력하세요."
        >
          <Link to="/events" className={styles.goEventsBtn}>
            <CalendarDays size={15} /> 행사 목록으로
          </Link>
        </EmptyState>
      </div>
    )
  }

  // ── 로딩 ──
  if (loading) {
    return (
      <div>
        <PageHeader title="부스 목록" />
        <div className={styles.skeletonGrid}>
          {[...Array(12)].map((_, i) => <div key={i} className={styles.skeleton} />)}
        </div>
      </div>
    )
  }

  // ── 데이터 없음 (404) ──
  if (error === 'NO_DATA') {
    return (
      <div>
        <PageHeader
          title="부스 목록"
          description={eventInfo ? `${eventInfo.name}` : eventId}
        />
        <EmptyState
          icon={<Store size={36} strokeWidth={1.25} />}
          title="아직 부스 데이터가 없습니다"
          description="해당 행사의 부스 목록이 아직 등록되지 않았습니다."
        />
      </div>
    )
  }

  // ── 기타 오류 ──
  if (error) {
    return (
      <div>
        <PageHeader title="부스 목록" />
        <EmptyState title="데이터를 불러오지 못했습니다" description={error} />
      </div>
    )
  }

  return (
    <div className={styles.page}>
      {/* 헤더 */}
      <PageHeader
        title={eventInfo ? `${eventInfo.name} 부스 목록` : '부스 목록'}
        description={eventInfo
          ? `${eventInfo.dates.start} · ${eventInfo.city} · ${eventInfo.venue}`
          : eventId
        }
      >
        {/* 카드/리스트 토글 */}
        <div className={styles.viewToggle}>
          <button
            className={`${styles.viewBtn} ${view === 'card' ? styles.viewActive : ''}`}
            onClick={() => setView('card')}
            aria-label="카드형"
            title="카드형"
          >
            <LayoutGrid size={16} strokeWidth={1.75} />
          </button>
          <button
            className={`${styles.viewBtn} ${view === 'list' ? styles.viewActive : ''}`}
            onClick={() => setView('list')}
            aria-label="리스트형"
            title="리스트형"
          >
            <List size={16} strokeWidth={1.75} />
          </button>
        </div>
      </PageHeader>

      {/* ── 필터 바 ── */}
      <div className={styles.filterBar}>
        {/* 검색 */}
        <div className={styles.searchWrap}>
          <Search size={15} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            type="text"
            placeholder="부스명, 번호, 태그 검색..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button className={styles.clearBtn} onClick={() => setQuery('')} aria-label="검색 초기화">
              <X size={14} />
            </button>
          )}
        </div>

        {/* 규격 필터 */}
        <select
          className={styles.select}
          value={filterSpec}
          onChange={(e) => setFilterSpec(e.target.value)}
          aria-label="규격 필터"
        >
          {specs.map((s) => (
            <option key={s} value={s}>{s === 'all' ? '전체 규격' : s}</option>
          ))}
        </select>

        {/* 요일 필터 */}
        <select
          className={styles.select}
          value={filterDay}
          onChange={(e) => setFilterDay(e.target.value)}
          aria-label="요일 필터"
        >
          {days.map((d) => (
            <option key={d} value={d}>{d === 'all' ? '전체 요일' : `${d}요일`}</option>
          ))}
        </select>

        {/* 필터 초기화 */}
        {hasFilter && (
          <button className={styles.resetBtn} onClick={resetFilters}>
            <X size={13} /> 초기화
          </button>
        )}
      </div>

      {/* 태그 필터 (상위 태그) */}
      {topTags.length > 0 && (
        <div className={styles.tagFilterArea}>
          <div className={`${styles.tagChips} ${tagOpen ? styles.tagChipsOpen : ''}`}>
            {filterTag && (
              <button
                className={`${styles.tagChip} ${styles.tagChipActive}`}
                onClick={() => setFilterTag('')}
              >
                {filterTag} <X size={11} />
              </button>
            )}
            {topTags
              .filter((t) => t !== filterTag)
              .map((t) => (
                <button
                  key={t}
                  className={styles.tagChip}
                  onClick={() => setFilterTag(t)}
                >
                  {t}
                </button>
              ))}
          </div>
          {!tagOpen && (
            <button className={styles.tagToggle} onClick={() => setTagOpen(true)}>
              <ChevronDown size={13} /> 더보기
            </button>
          )}
        </div>
      )}

      {/* 결과 수 */}
      <div className={styles.resultMeta}>
        <span className={styles.resultCount}>
          {filtered.length}
          <span className={styles.resultTotal}>/{booths.length}</span>
          개 부스
        </span>
        {hasFilter && (
          <span className={styles.filterOn}>필터 적용 중</span>
        )}
      </div>

      {/* ── 카드 / 리스트 ── */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Store size={32} strokeWidth={1.25} />}
          title="검색 결과가 없습니다"
          description="다른 검색어나 필터를 사용해보세요."
        >
          <button className={styles.resetBtn2} onClick={resetFilters}>필터 초기화</button>
        </EmptyState>
      ) : view === 'card' ? (
        <div className={styles.cardGrid}>
          {filtered.map((booth) => (
            <BoothCard key={booth.id} booth={booth} onClick={setSelected} />
          ))}
        </div>
      ) : (
        <div className={styles.listWrap}>
          <ListHeader />
          {filtered.map((booth) => (
            <BoothListItem key={booth.id} booth={booth} onClick={setSelected} />
          ))}
        </div>
      )}

      {/* 부스 상세 모달 */}
      {selected && (
        <BoothDetailModal booth={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
