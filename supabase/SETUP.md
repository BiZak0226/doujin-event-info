# Supabase + 구글 OAuth 설정 가이드

## 1. Supabase 프로젝트 생성

1. https://supabase.com 접속 → 새 프로젝트 생성
2. 프로젝트 이름, 비밀번호, 리전(Northeast Asia 권장) 설정
3. 생성 후 **Settings → API** 에서 아래 두 값 복사
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (마이그레이션 전용, 절대 커밋 금지)

---

## 2. 스키마 적용

Supabase 대시보드 → **SQL Editor** → `schema.sql` 전체 내용 붙여넣기 → Run

---

## 3. 구글 OAuth 설정

### Google Cloud Console
1. https://console.cloud.google.com → 새 프로젝트 생성
2. **API 및 서비스 → OAuth 동의 화면** 설정
   - User Type: 외부
   - 앱 이름, 이메일 입력
3. **사용자 인증 정보 → OAuth 2.0 클라이언트 ID** 생성
   - 애플리케이션 유형: 웹 애플리케이션
   - 승인된 리디렉션 URI 추가:
     ```
     https://<your-project>.supabase.co/auth/v1/callback
     ```
4. 생성된 **클라이언트 ID**와 **클라이언트 보안 비밀번호** 복사

### Supabase 대시보드
1. **Authentication → Providers → Google** 활성화
2. 위에서 복사한 클라이언트 ID, 보안 비밀번호 입력
3. Site URL 설정: `https://your-vercel-domain.vercel.app`
4. Redirect URLs 추가:
   ```
   https://your-vercel-domain.vercel.app
   http://localhost:5173
   ```

---

## 4. 환경변수 설정

### 로컬 개발 (.env.local)
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```
> `.env.local`은 `.gitignore`에 포함되어 있어 커밋되지 않습니다.

### Vercel 배포
Vercel 대시보드 → 프로젝트 → **Settings → Environment Variables**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
> `SUPABASE_SERVICE_ROLE_KEY`는 Vercel에 추가하지 않습니다 (로컬 마이그레이션 전용).

---

## 5. 패키지 설치

```bash
npm install @supabase/supabase-js
```

---

## 6. 마이그레이션 실행

```bash
# 마이그레이션용 dotenv 설치 (최초 1회)
npm install dotenv

# 마이그레이션 실행
node supabase/migrate.js
```

---

## 7. 관리자 계정 설정

1. 배포된 사이트에서 구글 로그인
2. Supabase SQL Editor에서 실행:

```sql
UPDATE public.user_profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users
  WHERE email = 'YOUR_GOOGLE_EMAIL@gmail.com'
  LIMIT 1
);
```

---

## 8. App.jsx 수정

```jsx
import { AuthProvider } from './hooks/useAuth'

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* 기존 라우터 내용 */}
      </Router>
    </AuthProvider>
  )
}
```
