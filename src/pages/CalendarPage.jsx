import { useState } from 'react'
import PageHeader from '../components/common/PageHeader'

export default function CalendarPage() {
  const [view, setView] = useState('monthly') // 'monthly' | 'weekly'

  return (
    <div>
      <PageHeader title="이벤트 캘린더">
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button
            onClick={() => setView('monthly')}
            style={{
              padding: 'var(--space-2) var(--space-4)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--weight-medium)',
              border: '1px solid var(--color-border)',
              background: view === 'monthly' ? 'var(--color-accent)' : 'transparent',
              color: view === 'monthly' ? '#fff' : 'var(--color-text-secondary)',
              transition: 'all var(--transition)',
            }}
          >
            월간
          </button>
          <button
            onClick={() => setView('weekly')}
            style={{
              padding: 'var(--space-2) var(--space-4)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--weight-medium)',
              border: '1px solid var(--color-border)',
              background: view === 'weekly' ? 'var(--color-accent)' : 'transparent',
              color: view === 'weekly' ? '#fff' : 'var(--color-text-secondary)',
              transition: 'all var(--transition)',
            }}
          >
            주간
          </button>
        </div>
      </PageHeader>
      {/* TODO: 월간/주간 캘린더 컴포넌트 */}
      <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
        {view === 'monthly' ? '월간 캘린더' : '주간 캘린더'} 준비 중입니다.
      </p>
    </div>
  )
}
