-- ============================================================
-- seed.sql — 초기 데이터 및 관리자 설정
-- ============================================================
-- 실행 순서:
--   1. schema.sql 먼저 실행
--   2. Supabase 대시보드에서 구글 로그인 후 auth.users에 계정 생성
--   3. 아래 쿼리에서 이메일을 본인 구글 계정으로 수정 후 실행

-- ── 관리자 권한 부여 ──────────────────────────────────────
-- auth.users에서 이메일로 id를 찾아 role을 admin으로 변경
UPDATE public.user_profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users
  WHERE email = 'YOUR_GOOGLE_EMAIL@gmail.com'  -- ← 여기를 본인 이메일로 변경
  LIMIT 1
);

-- 확인 쿼리
-- SELECT u.email, p.role
-- FROM auth.users u
-- JOIN public.user_profiles p ON u.id = p.id;
