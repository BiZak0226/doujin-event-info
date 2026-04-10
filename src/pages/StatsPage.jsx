import PageHeader from '../components/common/PageHeader'

export default function StatsPage() {
  return (
    <div>
      <PageHeader
        title="통계"
        description="행사별 장르 분포, 부스 규모, 재참여율 등 다양한 통계 데이터입니다."
      />
      {/* TODO: 통계 차트 및 데이터 시각화 */}
      <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
        준비 중입니다.
      </p>
    </div>
  )
}
