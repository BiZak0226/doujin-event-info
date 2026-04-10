import { useParams } from 'react-router-dom'
import PageHeader from '../components/common/PageHeader'
import EmptyState from '../components/common/EmptyState'
import { Store } from 'lucide-react'

export default function BoothListPage() {
  const { eventId } = useParams()

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
          description="행사 목록에서 부스 목록 보기를 클릭하거나, 행사 ID를 URL에 직접 입력하세요."
        />
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="부스 목록"
        description={`행사 ID: ${eventId}`}
      />
      {/* TODO: eventId에 맞는 부스 목록 로드 및 표시 */}
      <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
        준비 중입니다. (행사: {eventId})
      </p>
    </div>
  )
}
