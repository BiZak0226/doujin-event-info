import { useState, useMemo } from 'react'
import { Search, Users, X } from 'lucide-react'
import { useArtists, useFilteredArtists, buildArtistBoothMap } from '../hooks/useArtists'
import { useBooths } from '../hooks/useBooths'
import PageHeader from '../components/common/PageHeader'
import EmptyState from '../components/common/EmptyState'
import ArtistCard from '../components/artist/ArtistCard'
import ArtistDetailModal from '../components/artist/ArtistDetailModal'
import styles from './ArtistListPage.module.css'

const PLATFORM_OPTIONS = [
  { value: 'all',       label: '전체' },
  { value: 'twitter',   label: 'Twitter / X' },
  { value: 'pixiv',     label: 'Pixiv' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'youtube',   label: 'YouTube' },
  { value: 'bluesky',   label: 'Bluesky' },
]

// 현재 부스 데이터가 cw_331 하나 — 향후 여러 행사로 확장 가능
const BOOTH_EVENT_IDS = ['cw_331']

export default function ArtistListPage() {
  const { artists, loading: aLoading, error: aError } = useArtists()

  // 모든 행사 부스 병합 (향후 여러 eventId 지원)
  const { booths: booths331, loading: bLoading } = useBooths('cw_331')
  const allBooths = useMemo(() => [...booths331], [booths331])
  const boothMap  = useMemo(() => buildArtistBoothMap(allBooths), [allBooths])

  const [query,          setQuery]          = useState('')
  const [filterPlatform, setFilterPlatform] = useState('all')
  const [filterTag,      setFilterTag]      = useState('')
  const [selected,       setSelected]       = useState(null)

  const filtered = useFilteredArtists(artists, boothMap, { query, filterPlatform, filterTag })

  // 자주 등장하는 태그 top 15 (필터 칩용)
  const topTags = useMemo(() => {
    const freq = {}
    artists.forEach((a) => {
      boothMap.get(a.id)?.topTags?.forEach((t) => {
        freq[t] = (freq[t] ?? 0) + 1
      })
    })
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([tag]) => tag)
  }, [artists, boothMap])

  const loading = aLoading || bLoading
  const hasFilter = query || filterPlatform !== 'all' || filterTag

  const resetFilters = () => {
    setQuery('')
    setFilterPlatform('all')
    setFilterTag('')
  }

  if (loading) {
    return (
      <div>
        <PageHeader title="작가 목록" />
        <div className={styles.skeletonGrid}>
          {[...Array(12)].map((_, i) => <div key={i} className={styles.skeleton} />)}
        </div>
      </div>
    )
  }

  if (aError) {
    return (
      <div>
        <PageHeader title="작가 목록" />
        <EmptyState
          icon={<Users size={36} strokeWidth={1.25} />}
          title="데이터를 불러오지 못했습니다"
          description={aError}
        />
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <PageHeader
        title="작가 목록"
        description="행사에 참여한 작가들의 프로필과 SNS 링크를 확인하세요."
      />

      {/* ── 필터 바 ── */}
      <div className={styles.filterBar}>
        {/* 검색 */}
        <div className={styles.searchWrap}>
          <Search size={15} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            type="text"
            placeholder="작가명 검색..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button className={styles.clearBtn} onClick={() => setQuery('')} aria-label="초기화">
              <X size={14} />
            </button>
          )}
        </div>

        {/* 플랫폼 필터 */}
        <select
          className={styles.select}
          value={filterPlatform}
          onChange={(e) => setFilterPlatform(e.target.value)}
          aria-label="플랫폼 필터"
        >
          {PLATFORM_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {hasFilter && (
          <button className={styles.resetBtn} onClick={resetFilters}>
            <X size={13} /> 초기화
          </button>
        )}
      </div>

      {/* 태그 필터 칩 */}
      {topTags.length > 0 && (
        <div className={styles.tagChips}>
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
      )}

      {/* 결과 수 */}
      <div className={styles.resultMeta}>
        <span className={styles.resultCount}>
          {filtered.length}
          <span className={styles.resultTotal}>/{artists.length}</span>
          명
        </span>
        {hasFilter && (
          <span className={styles.filterOn}>필터 적용 중</span>
        )}
      </div>

      {/* ── 카드 그리드 ── */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Users size={32} strokeWidth={1.25} />}
          title="검색 결과가 없습니다"
          description="다른 검색어나 필터를 사용해보세요."
        >
          <button className={styles.resetBtn2} onClick={resetFilters}>
            필터 초기화
          </button>
        </EmptyState>
      ) : (
        <div className={styles.grid}>
          {filtered.map((artist) => (
            <ArtistCard
              key={artist.id}
              artist={artist}
              boothEntry={boothMap.get(artist.id)}
              onClick={setSelected}
            />
          ))}
        </div>
      )}

      {/* 상세 모달 */}
      {selected && (
        <ArtistDetailModal
          artist={selected}
          boothEntry={boothMap.get(selected.id)}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
