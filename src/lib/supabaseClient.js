import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnon) {
  throw new Error(
    'VITE_SUPABASE_URL 또는 VITE_SUPABASE_ANON_KEY 환경변수가 설정되지 않았습니다.\n' +
    'Vercel 대시보드 → Settings → Environment Variables 에서 추가하세요.'
  )
}

// 싱글톤 — 모듈은 한 번만 실행되므로 인스턴스가 중복 생성되지 않음
console.log('[Supabase] 클라이언트 초기화:', supabaseUrl)

export const supabase = createClient(supabaseUrl, supabaseAnon, {
  auth: {
    autoRefreshToken:   true,
    persistSession:     true,
    detectSessionInUrl: true,
    // 스토리지 명시 — localStorage 사용 보장
    storage: window.localStorage,
  },
})
