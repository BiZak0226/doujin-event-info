import { useState, useEffect, useContext, createContext } from 'react'
import { supabase } from '../lib/supabaseClient'

// ── Context ───────────────────────────────────────────────
const AuthContext = createContext(null)

/**
 * AuthProvider — App 루트에 감싸서 사용
 */
export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)   // auth.users 세션
  const [profile, setProfile] = useState(null)   // user_profiles 행
  const [loading, setLoading] = useState(true)

  // 프로필 로드
  const loadProfile = async (userId) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (!error) setProfile(data)
  }

  useEffect(() => {
    // 현재 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) loadProfile(session.user.id)
      setLoading(false)
    })

    // 세션 변경 감지 (로그인/로그아웃)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          await loadProfile(session.user.id)
        } else {
          setProfile(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // 구글 로그인
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })
    if (error) console.error('로그인 오류:', error.message)
  }

  // 로그아웃
  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const value = {
    user,
    profile,
    loading,
    isLoggedIn: !!user,
    isAdmin:    profile?.role === 'admin',
    isUser:     !!profile,
    signInWithGoogle,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * useAuth — 인증 상태 접근 훅
 */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth는 AuthProvider 내부에서 사용해야 합니다.')
  return ctx
}
