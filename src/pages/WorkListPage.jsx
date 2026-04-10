import PageHeader from '../components/common/PageHeader'

export default function WorkListPage() {
  return (
    <div>
      <PageHeader
        title="작품 목록"
        description="부스에 등록된 작품 및 장르 목록입니다. 가나다순으로 정렬됩니다."
      />
      {/* TODO: 작품 목록, 매체별 필터 */}
      <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
        준비 중입니다.
      </p>
    </div>
  )
}
