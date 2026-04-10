import PageHeader from '../components/common/PageHeader'

export default function ContributorsPage() {
  return (
    <div>
      <PageHeader
        title="기여자"
        description="이 사이트를 만들고 데이터를 기여해주신 분들입니다."
      />
      {/* TODO: 개발자 및 기여자 카드 */}
      <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
        준비 중입니다.
      </p>
    </div>
  )
}
