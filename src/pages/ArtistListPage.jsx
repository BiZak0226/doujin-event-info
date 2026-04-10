import PageHeader from '../components/common/PageHeader'

export default function ArtistListPage() {
  return (
    <div>
      <PageHeader
        title="작가 목록"
        description="행사에 참여한 작가들의 프로필과 SNS 링크를 확인하세요."
      />
      {/* TODO: 작가 카드 목록, 검색 */}
      <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
        준비 중입니다.
      </p>
    </div>
  )
}
