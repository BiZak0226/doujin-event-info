import { NavLink, Link } from 'react-router-dom'
import {
  Home,
  CalendarDays,
  Store,
  Users,
  BookOpen,
  BarChart2,
  Heart,
  ChevronDown,
  Upload,
  Settings,
  X,
} from 'lucide-react'
import { useState } from 'react'
import styles from './Sidebar.module.css'

const NAV = [
  {
    type: 'link',
    to: '/',
    icon: Home,
    label: '메인',
  },
  {
    type: 'group',
    label: '정보',
    children: [
      { to: '/events',    icon: CalendarDays, label: '행사 목록' },
      { to: '/booths',    icon: Store,        label: '부스 목록' },
      { to: '/artists',   icon: Users,        label: '작가 목록' },
      { to: '/works',     icon: BookOpen,     label: '작품 목록' },
    ],
  },
  {
    type: 'group',
    label: '데이터',
    children: [
      { to: '/stats', icon: BarChart2, label: '통계' },
    ],
  },
  {
    type: 'link',
    to: '/calendar',
    icon: CalendarDays,
    label: '이벤트 캘린더',
  },
  {
    type: 'link',
    to: '/contributors',
    icon: Heart,
    label: '기여자',
  },
  {
    type: 'group',
    label: '관리',
    children: [
      { to: '/admin/events', icon: Settings, label: '행사 관리' },
      { to: '/data-import',  icon: Upload,   label: '데이터 입력' },
    ],
  },
]

export default function Sidebar({ mobileOpen, onClose }) {
  const [collapsed, setCollapsed] = useState({})

  const toggleGroup = (label) => {
    setCollapsed(prev => ({ ...prev, [label]: !prev[label] }))
  }

  return (
    <>
      {/* 모바일 오버레이 */}
      {mobileOpen && (
        <div className={styles.overlay} onClick={onClose} aria-hidden="true" />
      )}

      <aside className={`${styles.sidebar} ${mobileOpen ? styles.open : ''}`}>
        {/* 로고 */}
        <div className={styles.logo}>
          <Link to="/" onClick={onClose}>
            <span className={styles.logoMark}>◈</span>
            <span className={styles.logoText}>동인 행사 정보</span>
          </Link>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="메뉴 닫기"
          >
            <X size={18} />
          </button>
        </div>

        {/* 네비게이션 */}
        <nav className={styles.nav} aria-label="주 메뉴">
          {NAV.map((item) => {
            if (item.type === 'link') {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `${styles.navItem} ${isActive ? styles.active : ''}`
                  }
                  onClick={onClose}
                >
                  <Icon size={16} strokeWidth={1.75} />
                  <span>{item.label}</span>
                </NavLink>
              )
            }

            if (item.type === 'group') {
              const isCollapsed = collapsed[item.label]
              return (
                <div key={item.label} className={styles.group}>
                  <button
                    className={styles.groupHeader}
                    onClick={() => toggleGroup(item.label)}
                    aria-expanded={!isCollapsed}
                  >
                    <span>{item.label}</span>
                    <ChevronDown
                      size={14}
                      className={`${styles.chevron} ${isCollapsed ? styles.chevronClosed : ''}`}
                    />
                  </button>
                  {!isCollapsed && (
                    <div className={styles.groupChildren}>
                      {item.children.map((child) => {
                        const Icon = child.icon
                        return (
                          <NavLink
                            key={child.to}
                            to={child.to}
                            className={({ isActive }) =>
                              `${styles.navItem} ${styles.child} ${isActive ? styles.active : ''}`
                            }
                            onClick={onClose}
                          >
                            <Icon size={15} strokeWidth={1.75} />
                            <span>{child.label}</span>
                          </NavLink>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            }

            return null
          })}
        </nav>

        {/* 하단 */}
        <div className={styles.footer}>
          <p className={styles.footerText}>동인 행사 정보 v0.2</p>
        </div>
      </aside>
    </>
  )
}
