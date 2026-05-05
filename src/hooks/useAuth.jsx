import { useState, useEffect, useContext, createContext, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext(null)

// 유휴 자동 로그아웃 기준
const IDLE_TIMEOUT = 5 * 60 * 1000  // 5분

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const idleTimer = useRef(null)

  // ── 프로필 로드 ────────────────────────────────────────
  const loadProfile = useCallback(async (userId) => {
    console.log('[Auth] 프로필 로드 중...', userId)
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (error) {
      console.warn('[Auth] 프로필 로드 실패:', error.message)
    } else {
      console.log('[Auth] 프로필 로드 완료:', data.nickname, '| role:', data.role)
      setProfile(data)
    }
  }, [])

  // ── 세션 복구 (토큰 만료 시 갱신 시도) ───────────────
  const recoverSession = useCallback(async () => {
    console.log('[Auth] 세션 복구 시도...')
    const { data, error } = await supabase.auth.refreshSession()
    if (error) {
      console.warn('[Auth] 세션 복구 실패 — 로그아웃 처리:', error.message)
      // 복구 실패 시 로컬 세션 강제 제거
      await supabase.auth.signOut({ scope: 'local' })
      setUser(null)
      setProfile(null)
      return false
    }
    console.log('[Auth] 세션 복구 성공')
    return true
  }, [])

  // ── 로그아웃 ─────────────────────────────────────────
  const signOut = useCallback(async () => {
    console.log('[Auth] 로그아웃 시도...')
    clearIdleTimer()

    try {
      // localStorage에서 세션 직접 확인 (네트워크 불필요)
      console.log('[Auth] 1단계: 로컬 세션 확인...')
      const storageKey = `sb-${import.meta.env.VITE_SUPABASE_URL.split('//')[1].split('.')[0]}-auth-token`
      const raw = localStorage.getItem(storageKey)
      const localSession = raw ? JSON.parse(raw) : null
      console.log('[Auth] 2단계: 로컬 세션 =', localSession ? '있음' : '없음')

      if (!localSession) {
        console.log('[Auth] 로컬 세션 없음 — 상태만 초기화')
        setUser(null)
        setProfile(null)
        return
      }

      // 토큰 만료 확인
      const expiresAt = localSession.expires_at * 1000
      const remaining = expiresAt - Date.now()
      console.log('[Auth] 3단계: 토큰 만료까지', Math.round(remaining / 1000), '초')

      // 로그아웃 요청 (타임아웃 5초)
      console.log('[Auth] 4단계: 로그아웃 요청...')
      await Promise.race([
        supabase.auth.signOut(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('로그아웃 타임아웃')), 5000)
        ),
      ]).catch(async (err) => {
        console.warn('[Auth] 서버 로그아웃 실패:', err.message, '— 로컬만 제거')
        await supabase.auth.signOut({ scope: 'local' }).catch(() => {})
        // localStorage 직접 클리어 (완전 보장)
        const key = Object.keys(localStorage).find(k => k.includes('auth-token'))
        if (key) { localStorage.removeItem(key); console.log('[Auth] localStorage 직접 제거:', key) }
      })

      console.log('[Auth] 5단계: 완료')

    } catch (err) {
      console.error('[Auth] 로그아웃 예외:', err.message)
      await supabase.auth.signOut({ scope: 'local' }).catch(() => {})
      const key = Object.keys(localStorage).find(k => k.includes('auth-token'))
      if (key) localStorage.removeItem(key)
    } finally {
      console.log('[Auth] finally — setUser/setProfile null 처리')
      setUser(null)
      setProfile(null)
    }
  }, [])

  // ── 자동 로그아웃 (유휴 감지) ────────────────────────
  const resetIdleTimer = useCallback(() => {
    clearIdleTimer()
    idleTimer.current = setTimeout(() => {
      console.log('[Auth] 유휴 시간 초과 — 자동 로그아웃')
      signOut()
    }, IDLE_TIMEOUT)
  }, [signOut])

  function clearIdleTimer() {
    if (idleTimer.current) {
      clearTimeout(idleTimer.current)
      idleTimer.current = null
    }
  }

  // ── Vite HMR full reload 감지 → 로그아웃 ────────────
  useEffect(() => {
    if (!import.meta.hot) return  // 프로덕션에서는 동작 안 함

    const handleBeforeUpdate = () => {
      console.log('[Auth] Vite HMR 감지 — 로그아웃 처리')
      // 로컬 세션 즉시 제거
      const key = Object.keys(localStorage).find(k => k.includes('auth-token'))
      if (key) localStorage.removeItem(key)
      supabase.auth.signOut({ scope: 'local' }).catch(() => {})
      setUser(null)
      setProfile(null)
    }

    import.meta.hot.on('vite:beforeFullReload', handleBeforeUpdate)

    return () => {
      import.meta.hot?.off('vite:beforeFullReload', handleBeforeUpdate)
    }
  }, [])

  // 유저 활동 이벤트 감지
  useEffect(() => {
    if (!user) return

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'pointermove']
    const handler = () => resetIdleTimer()

    events.forEach((e) => window.addEventListener(e, handler, { passive: true }))
    resetIdleTimer()  // 로그인 시 타이머 시작

    return () => {
      events.forEach((e) => window.removeEventListener(e, handler))
      clearIdleTimer()
    }
  }, [user, resetIdleTimer])

  // ── 세션 초기화 ──────────────────────────────────────
  useEffect(() => {
    console.log('[Auth] 초기 세션 확인...')
    let initialized = false  // INITIAL_SESSION 처리 후 SIGNED_IN 중복 방지

    const loadingTimeout = setTimeout(() => {
      console.warn('[Auth] 세션 확인 타임아웃 — 로딩 강제 해제')
      setLoading(false)
    }, 3000)

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[Auth] 상태 변경:', event)
        clearTimeout(loadingTimeout)

        if (event === 'INITIAL_SESSION') {
          initialized = true
          if (session?.user) {
            setUser(session.user)
            await loadProfile(session.user.id)
          }
          setLoading(false)
          return
        }

        if (event === 'TOKEN_REFRESHED') {
          console.log('[Auth] 토큰 갱신 완료')
          return
        }

        if (event === 'SIGNED_OUT') {
          console.log('[Auth] 로그아웃 감지')
          setUser(null)
          setProfile(null)
          setLoading(false)
          return
        }

        if (event === 'SIGNED_IN') {
          if (initialized) {
            console.log('[Auth] SIGNED_IN 중복 — 무시')
            return
          }
          initialized = true

          if (session?.user) {
            setUser(session.user)
            await loadProfile(session.user.id)
          }
          setLoading(false)  
          return
        }

        if (session?.user) {
          setUser(session.user)
          await loadProfile(session.user.id)
        } else {
          setUser(null)
          setProfile(null)
        }
      }
    )

    return () => {
      clearTimeout(loadingTimeout)
      subscription.unsubscribe()
    }
  }, [loadProfile])

  // ── 구글 로그인 (항상 계정 선택 화면 표시) ──────────
  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: {
          prompt: 'select_account',  // 항상 계정 선택 화면 표시
        },
      },
    })
    if (error) console.error('[Auth] 로그인 오류:', error.message)
  }, [])

  // ── 강제 로그아웃 (서버 응답 없이 즉시) ─────────────
  const forceSignOut = useCallback(async () => {
    console.log('[Auth] 강제 로그아웃 실행')
    clearIdleTimer()

    // 1. Supabase localStorage 키 전체 제거
    const keysToRemove = Object.keys(localStorage).filter(
      k => k.includes('supabase') || k.includes('auth-token') || k.includes('sb-')
    )
    keysToRemove.forEach(k => {
      localStorage.removeItem(k)
      console.log('[Auth] localStorage 제거:', k)
    })

    // 2. 로컬 signOut
    await supabase.auth.signOut({ scope: 'local' }).catch(() => {})

    // 3. 상태 초기화 후 페이지 새로고침 (UI 즉시 반영)
    setUser(null)
    setProfile(null)
    console.log('[Auth] 강제 로그아웃 완료 — 페이지 새로고침')
    location.reload()
  }, [])

  const value = {
    user,
    profile,
    loading,
    isLoggedIn: !!user,
    isAdmin:    profile?.role === 'admin',
    isUser:     !!profile,
    signInWithGoogle,
    signOut,
    forceSignOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth는 AuthProvider 내부에서 사용해야 합니다.')
  return ctx
}
