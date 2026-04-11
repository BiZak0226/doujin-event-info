import { useState } from 'react'
import { BarChart2, Store, CalendarDays } from 'lucide-react'
import { useEvents } from '../hooks/useEvents'
import { useBooths } from '../hooks/useBooths'
import PageHeader from '../components/common/PageHeader'
import EmptyState from '../components/common/EmptyState'
import { StatCard, MetricCard, HBarChart, VBarChart, DonutChart } from '../components/stats/StatCard'
import {
  calcSpecDist, calcDayDist, calcTagDist,
  calcSizeDist, calcLinkDist,
  calcYearDist, calcCityDist, calcMonthDist, calcTypeDist,
  toPercent,
} from '../utils/statsUtils'
import styles from './StatsPage.module.css'

// 탭 정의
const TABS = [
  { key: 'booth',  label: '부스 통계',  icon: Store },
  { key: 'event',  label: '행사 통계',  icon: CalendarDays },
]

// 규격 색상
const SPEC_COLORS = ['#4338ca', '#16803c', '#9a3412', '#166534', '#854d0e', '#9d174d']

// 도넛 색상 팔레트
const DONUT_COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']
const DAY_COLORS   = ['#4f46e5', '#10b981', '#f59e0b']

export default function StatsPage() {
  const [tab, setTab] = useState('booth')

  // 행사 데이터
  const { events, eventTypes, loading: evLoading } = useEvents()

  // 부스 데이터 — CW331이 유일한 데이터
  // 데이터가 여러 행사로 늘어나면 행사 선택 UI 추가 필요
  const boothEventId = 'cw_331'
  const { booths, loading: bLoading } = useBooths(boothEventId)
  const boothEvent = events.find((e) => e.id === boothEventId)

  const loading = evLoading || bLoading

  if (loading) {
    return (
      <div>
        <PageHeader title="통계" />
        <div className={styles.skeletonGrid}>
          {[...Array(6)].map((_, i) => <div key={i} className={styles.skeleton} />)}
        </div>
      </div>
    )
  }

  // ── 부스 통계 계산 ──
  const specDist = calcSpecDist(booths)
  const dayDist  = calcDayDist(booths)
  const tagDist  = calcTagDist(booths, 20)
  const sizeDist = calcSizeDist(booths)
  const linkDist = calcLinkDist(booths)

  const boothsWithLink    = booths.filter((b) => b.links?.length > 0).length
  const boothsWithArtist  = booths.filter((b) => b.artists?.length > 0).length
  const boothsWithImage   = booths.filter((b) => b.infoImage).length
  const boothsWithTags    = booths.filter((b) => b.tags?.length > 0).length

  // ── 행사 통계 계산 ──
  const yearDist  = calcYearDist(events)
  const cityDist  = calcCityDist(events)
  const monthDist = calcMonthDist(events)
  const typeDist  = calcTypeDist(events, eventTypes)

  const upcomingCount = events.filter((e) => new Date(e.dates.start) > new Date()).length
  const endedCount    = events.length - upcomingCount

  return (
    <div className={styles.page}>
      <PageHeader
        title="통계"
        description="수집된 데이터를 바탕으로 분석한 통계입니다."
      />

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

      {/* ── 부스 통계 ── */}
      {tab === 'booth' && (
        <div className={styles.content}>
          {booths.length === 0 ? (
            <EmptyState
              icon={<Store size={36} strokeWidth={1.25} />}
              title="부스 데이터가 없습니다"
              description="부스 데이터가 등록된 행사가 없습니다."
            />
          ) : (
            <>
              {/* 데이터 출처 표시 */}
              {boothEvent && (
                <p className={styles.source}>
                  데이터 기준: <strong>{boothEvent.name}</strong>
                  &nbsp;·&nbsp; 총 {booths.length}개 부스
                </p>
              )}

              {/* 요약 메트릭 */}
              <div className={styles.metricRow}>
                <MetricCard
                  label="총 부스"
                  value={booths.length}
                  sub="등록된 전체 부스 수"
                />
                <MetricCard
                  label="양일 참가"
                  value={dayDist.find((d) => d.key === '양일 참가')?.count ?? 0}
                  sub={`전체의 ${toPercent(dayDist.find((d) => d.key === '양일 참가')?.ratio ?? 0)}`}
                />
                <MetricCard
                  label="링크 등록"
                  value={boothsWithLink}
                  sub={`전체의 ${toPercent(boothsWithLink / booths.length)}`}
                />
                <MetricCard
                  label="이미지 등록"
                  value={boothsWithImage}
                  sub={`전체의 ${toPercent(boothsWithImage / booths.length)}`}
                />
              </div>

              {/* 2열 그리드 */}
              <div className={styles.grid2}>

                {/* 규격 분포 (도넛) */}
                <StatCard title="규격 분포" desc="부스 참가 규격별 비율">
                  <DonutChart data={specDist} colors={SPEC_COLORS} />
                </StatCard>

                {/* 요일 참가 현황 (도넛) */}
                <StatCard title="요일 참가 현황" desc="토요일만·일요일만·양일 참가 비율">
                  <DonutChart data={dayDist} colors={DAY_COLORS} />
                </StatCard>

                {/* 부스 크기 분포 */}
                <StatCard title="부스 크기 분포" desc="배정 칸 수 기준">
                  <DonutChart data={sizeDist} colors={['#4f46e5', '#10b981', '#f59e0b']} />
                </StatCard>

                {/* 링크 타입 분포 */}
                <StatCard title="등록 링크 타입" desc={`링크 등록 부스 ${boothsWithLink}개 기준`}>
                  <DonutChart data={linkDist} colors={DONUT_COLORS} />
                </StatCard>

              </div>

              {/* 태그 Top 20 (전체 너비) */}
              <StatCard
                title="장르 · 작품 Top 20"
                desc="부스에 등록된 태그 기준 인기 장르"
                fullWidth
              >
                <HBarChart
                  data={tagDist}
                  colorVar="--color-accent"
                />
              </StatCard>
            </>
          )}
        </div>
      )}

      {/* ── 행사 통계 ── */}
      {tab === 'event' && (
        <div className={styles.content}>
          {events.length === 0 ? (
            <EmptyState
              icon={<CalendarDays size={36} strokeWidth={1.25} />}
              title="행사 데이터가 없습니다"
            />
          ) : (
            <>
              {/* 요약 메트릭 */}
              <div className={styles.metricRow}>
                <MetricCard
                  label="총 행사"
                  value={events.length}
                  sub="등록된 전체 회차"
                />
                <MetricCard
                  label="예정 행사"
                  value={upcomingCount}
                  sub="아직 열리지 않은 행사"
                />
                <MetricCard
                  label="종료 행사"
                  value={endedCount}
                  sub="이미 완료된 행사"
                />
                <MetricCard
                  label="행사 시리즈"
                  value={Object.keys(eventTypes).length}
                  sub="등록된 행사 타입 수"
                />
              </div>

              {/* 2열 그리드 */}
              <div className={styles.grid2}>

                {/* 행사 타입 분포 */}
                <StatCard title="행사 타입별 회차 수">
                  <DonutChart data={typeDist} colors={['#c84b1a', '#7c3aed', '#0e7490']} />
                </StatCard>

                {/* 도시별 개최 수 */}
                <StatCard title="도시별 개최 횟수" desc="같은 도시에서 열린 총 회차 수">
                  <HBarChart data={cityDist} colorVar="--color-ilfe" />
                </StatCard>

              </div>

              {/* 연도별 추이 */}
              <StatCard title="연도별 행사 수 추이" desc="연도별 등록된 회차 수">
                <VBarChart data={yearDist} colorVar="--color-accent" />
              </StatCard>

              {/* 월별 분포 */}
              <StatCard
                title="월별 행사 분포"
                desc="1월~12월 기준 누적 개최 횟수"
              >
                <VBarChart data={monthDist} colorVar="--color-comi" />
              </StatCard>

            </>
          )}
        </div>
      )}
    </div>
  )
}
