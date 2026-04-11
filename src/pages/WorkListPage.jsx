import { useState, useMemo } from 'react'
import { Search, BookOpen, X } from 'lucide-react'
import { useWorks, useFilteredWorks } from '../hooks/useWorks'
import { useBooths } from '../hooks/useBooths'
import { WORK_SCHEMA } from '../constants/schema'
import PageHeader from '../components/common/PageHeader'
import EmptyState from '../components/common/EmptyState'
import styles from './WorkListPage.module.css'

export default function WorkListPage() {
  const { works, loading: wLoading, error } = useWorks()
  const { booths }                           = useBooths('cw_331')
  const allBooths = useMemo(() => [...booths], [booths])

  const [query,          setQuery]          = useState('')
  const [filterCategory, setFilterCategory] = useState('all')

  const { grouped, categories, boothCountMap } = useFilteredWorks(works, allBooths, {
    query, filterCategory,
  })

  const totalFiltered = grouped.reduce((s, g) => s + g.items.length, 0)
  const hasFilter = query || filterCategory !== 'all'
  const resetFilters = () => { setQuery(''); setFilterCategory('all') }

  const catLabels = WORK_SCHEMA.categoryLabels

  if (wLoading) {
    return (
      <div>
        <PageHeader title="작품 목록" />
        <div className={styles.skeletonWrap}>
          {[...Array(5)].map((_, i) => (
            <div key={i} className={styles.skeletonGroup}>
              <div className={styles.skeletonHead} />
              <div className={styles.skeletonPills}>
                {[...Array(8)].map((_, j) => <div key={j} className={styles.skeletonPill} />)}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <PageHeader title="작품 목록" />
        <EmptyState
          icon={<BookOpen size={36} strokeWidth={1.25} />}
          title="데이터를 불러오지 못했습니다"
          description={error}
        />
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <PageHeader
        title="작품 목록"
        description="부스에 등록된 장르·작품 목록입니다. 가나다순으로 정렬됩니다."
      />

      {/* 필터 바 */}
      <div className={styles.filterBar}>
        <div className={styles.searchWrap}>
          <Search size={15} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            type="text"
            placeholder="작품명 검색..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button className={styles.clearBtn} onClick={() => setQuery('')} aria-label="초기화">
              <X size={14} />
            </button>
          )}
        </div>

        <select
          className={styles.select}
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          aria-label="매체 필터"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c === 'all' ? '전체 매체' : (catLabels[c] ?? c)}
            </option>
          ))}
        </select>

        {hasFilter && (
          <button className={styles.resetBtn} onClick={resetFilters}>
            <X size={13} /> 초기화
          </button>
        )}
      </div>

      {/* 결과 수 */}
      <div className={styles.resultMeta}>
        <span className={styles.resultCount}>
          {totalFiltered}
          <span className={styles.resultTotal}>/{works.length}</span>
          개 작품
        </span>
        {hasFilter && (
          <span className={styles.filterOn}>필터 적용 중</span>
        )}
      </div>

      {/* 초성 인덱스 점프 */}
      {grouped.length > 0 && (
        <div className={styles.indexBar}>
          {grouped.map(({ group }) => (
            <a key={group} href={`#group-${group}`} className={styles.indexLink}>
              {group}
            </a>
          ))}
        </div>
      )}

      {/* 그룹별 작품 목록 */}
      {grouped.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={32} strokeWidth={1.25} />}
          title="검색 결과가 없습니다"
          description="다른 검색어나 필터를 사용해보세요."
        >
          <button className={styles.resetBtn2} onClick={resetFilters}>
            필터 초기화
          </button>
        </EmptyState>
      ) : (
        <div className={styles.groupList}>
          {grouped.map(({ group, items }) => (
            <section key={group} id={`group-${group}`} className={styles.group}>
              <h2 className={styles.groupHead}>
                <span className={styles.groupLabel}>{group}</span>
                <span className={styles.groupCount}>{items.length}</span>
              </h2>
              <div className={styles.pills}>
                {items.map((work) => {
                  const cnt = boothCountMap[work.name] ?? 0
                  return (
                    <div key={work.id} className={styles.pill}>
                      <span className={styles.pillName}>{work.name}</span>
                      {cnt > 0 && (
                        <span className={styles.pillCount} title={`${cnt}개 부스`}>
                          {cnt}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
