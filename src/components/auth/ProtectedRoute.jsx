import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'

/**
 * 관리자 전용 라우트
 * - 미로그인 → 메인 페이지로 리다이렉트
 * - 로그인했지만 admin 아님 → 메인 페이지로 리다이렉트
 * - admin → 정상 렌더링
 */
export function AdminRoute({ children }) {
  const { isLoggedIn, isAdmin, loading } = useAuth()

  // 세션 확인 중 — 아무것도 렌더링하지 않음
  if (loading) return null

  if (!isLoggedIn || !isAdmin) {
    return <Navigate to="/" replace />
  }

  return children
}

/**
 * 로그인 필요 라우트 (일반 사용자 포함)
 * - 미로그인 → 메인 페이지로 리다이렉트
 */
export function AuthRoute({ children }) {
  const { isLoggedIn, loading } = useAuth()

  if (loading) return null

  if (!isLoggedIn) {
    return <Navigate to="/" replace />
  }

  return children
}
