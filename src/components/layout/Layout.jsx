import { useState } from 'react'
import { Menu } from 'lucide-react'
import Sidebar from './Sidebar'
import styles from './Layout.module.css'

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className={styles.root}>
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className={styles.main}>
        {/* 모바일 헤더 */}
        <header className={styles.mobileHeader}>
          <button
            className={styles.menuBtn}
            onClick={() => setMobileOpen(true)}
            aria-label="메뉴 열기"
          >
            <Menu size={20} />
          </button>
          <span className={styles.mobileTitle}>동인 행사 정보</span>
        </header>

        {/* 페이지 콘텐츠 */}
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  )
}
