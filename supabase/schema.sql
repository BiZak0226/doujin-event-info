-- ============================================================
-- 동인 행사 정보 사이트 — Supabase 스키마
-- ============================================================

-- ── 확장 ──────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. 사용자 프로필
-- ============================================================
CREATE TABLE public.user_profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  nickname    TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 신규 가입 시 자동으로 프로필 생성
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, nickname, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 2. 행사 타입 (코믹월드 / 일러스타 페스 / 코미버스)
-- ============================================================
CREATE TABLE public.event_types (
  id          TEXT PRIMARY KEY,              -- "comicworld"
  name        TEXT NOT NULL,                 -- "코믹월드"
  short_name  TEXT,                          -- "CW"
  color       TEXT,                          -- "#c84b1a"
  links       JSONB DEFAULT '{}',            -- {"homepage": "...", "twitter": "..."}
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3. 행사 회차
-- ============================================================
CREATE TABLE public.events (
  id            TEXT PRIMARY KEY,            -- "cw_331"
  type_id       TEXT REFERENCES event_types(id),
  name          TEXT NOT NULL,               -- "코믹월드 331 부산"
  short_name    TEXT,                        -- "CW 331"
  category      TEXT,                        -- "regular" | "special" | "petit"
  city          TEXT,                        -- "부산"
  venue         TEXT,                        -- "부산 벡스코 2전시장 4홀"
  date_start    DATE NOT NULL,
  date_end      DATE NOT NULL,
  links         JSONB DEFAULT '{}',
  partner_events JSONB DEFAULT '[]',         -- ["comiverse_1"]
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 4. 부스
-- ============================================================
CREATE TABLE public.booths (
  id              TEXT,                       -- "da-01"
  event_id        TEXT REFERENCES events(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,              -- "딸기네피규어"
  numbers         JSONB DEFAULT '[]',         -- ["DA_01", "DA_02"]
  display_number  TEXT,                       -- "DA_01~DA_02"
  spec            TEXT,                       -- "청년" | "전문" | ...
  days            JSONB DEFAULT '[]',         -- ["토", "일"]
  description     TEXT DEFAULT '',
  info_image_url  TEXT DEFAULT '',
  goods           JSONB DEFAULT '[]',
  links           JSONB DEFAULT '[]',         -- [{"type": "twitter", "url": "..."}]
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id, event_id)
);

-- ============================================================
-- 5. 작가
-- ============================================================
CREATE TABLE public.artists (
  id          TEXT PRIMARY KEY,              -- "Hingumon"
  nickname    TEXT NOT NULL,
  bio         TEXT DEFAULT '',
  avatar_url  TEXT DEFAULT '',
  links       JSONB DEFAULT '{}',            -- {"twitter": "...", "pixiv": "..."}
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 6. 장르 그룹 (호요버스, 프로젝트 문 등)
-- ============================================================
CREATE TABLE public.genre_groups (
  id          TEXT PRIMARY KEY,              -- "hoyoverse"
  name        TEXT NOT NULL,                 -- "호요버스"
  aliases     JSONB DEFAULT '[]',            -- ["호요게임", "miHoYo"]
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 7. 장르/작품
-- ============================================================
CREATE TABLE public.genres (
  id          TEXT PRIMARY KEY,              -- "blue_archive"
  name        TEXT NOT NULL,                 -- "블루 아카이브"
  aliases     JSONB DEFAULT '[]',            -- ["블아", "블루아카", "BA"]
  category    TEXT NOT NULL DEFAULT 'other', -- "game" | "anime" | ...
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 8. 중간 테이블 (M:N 관계)
-- ============================================================

-- 부스 ↔ 작가
CREATE TABLE public.booth_artists (
  booth_id    TEXT NOT NULL,
  event_id    TEXT NOT NULL,
  artist_id   TEXT NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  PRIMARY KEY (booth_id, event_id, artist_id),
  FOREIGN KEY (booth_id, event_id) REFERENCES booths(id, event_id) ON DELETE CASCADE
);

-- 부스 ↔ 장르
CREATE TABLE public.booth_genres (
  booth_id    TEXT NOT NULL,
  event_id    TEXT NOT NULL,
  genre_id    TEXT NOT NULL REFERENCES genres(id) ON DELETE CASCADE,
  -- 원본 태그 문자열 보존 (매핑 전 값)
  raw_tag     TEXT,
  PRIMARY KEY (booth_id, event_id, genre_id),
  FOREIGN KEY (booth_id, event_id) REFERENCES booths(id, event_id) ON DELETE CASCADE
);

-- 장르 ↔ 그룹
CREATE TABLE public.genre_group_members (
  group_id    TEXT NOT NULL REFERENCES genre_groups(id) ON DELETE CASCADE,
  genre_id    TEXT NOT NULL REFERENCES genres(id) ON DELETE CASCADE,
  PRIMARY KEY (group_id, genre_id)
);

-- ============================================================
-- 9. 사용자 즐겨찾기
-- ============================================================
CREATE TABLE public.user_favorites (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('artist', 'genre', 'booth', 'event')),
  target_id   TEXT NOT NULL,                 -- artist.id / genre.id / booth.id / event.id
  event_id    TEXT,                          -- 부스일 경우 소속 행사 id
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, target_type, target_id)
);

-- ============================================================
-- 10. 행사 플래너 (방문 예정 / 관심)
-- ============================================================
CREATE TABLE public.user_booth_plans (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  booth_id    TEXT NOT NULL,
  event_id    TEXT NOT NULL,
  status      TEXT NOT NULL CHECK (status IN ('plan', 'interest')),
  -- 'plan'     = 방문 예정
  -- 'interest' = 관심 (가고 싶지만 미확정)
  memo        TEXT DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, booth_id, event_id),
  FOREIGN KEY (booth_id, event_id) REFERENCES booths(id, event_id) ON DELETE CASCADE
);

-- ============================================================
-- 11. 인덱스
-- ============================================================
CREATE INDEX idx_booths_event_id       ON booths(event_id);
CREATE INDEX idx_booth_artists_artist  ON booth_artists(artist_id);
CREATE INDEX idx_booth_genres_genre    ON booth_genres(genre_id);
CREATE INDEX idx_user_favorites_user   ON user_favorites(user_id);
CREATE INDEX idx_user_plans_user       ON user_booth_plans(user_id);
CREATE INDEX idx_user_plans_event      ON user_booth_plans(event_id);

-- ============================================================
-- 12. RLS (Row Level Security) 정책
-- ============================================================
ALTER TABLE user_profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_types       ENABLE ROW LEVEL SECURITY;
ALTER TABLE events            ENABLE ROW LEVEL SECURITY;
ALTER TABLE booths            ENABLE ROW LEVEL SECURITY;
ALTER TABLE artists           ENABLE ROW LEVEL SECURITY;
ALTER TABLE genres            ENABLE ROW LEVEL SECURITY;
ALTER TABLE genre_groups      ENABLE ROW LEVEL SECURITY;
ALTER TABLE booth_artists     ENABLE ROW LEVEL SECURITY;
ALTER TABLE booth_genres      ENABLE ROW LEVEL SECURITY;
ALTER TABLE genre_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites    ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_booth_plans  ENABLE ROW LEVEL SECURITY;

-- ── 헬퍼 함수 ─────────────────────────────────────────────
-- 현재 사용자의 role 반환
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.user_profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- admin 여부 확인
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT get_user_role() = 'admin';
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ── 공개 데이터 (누구나 읽기 가능) ─────────────────────────
CREATE POLICY "public read" ON event_types       FOR SELECT USING (true);
CREATE POLICY "public read" ON events            FOR SELECT USING (true);
CREATE POLICY "public read" ON booths            FOR SELECT USING (true);
CREATE POLICY "public read" ON artists           FOR SELECT USING (true);
CREATE POLICY "public read" ON genres            FOR SELECT USING (true);
CREATE POLICY "public read" ON genre_groups      FOR SELECT USING (true);
CREATE POLICY "public read" ON booth_artists     FOR SELECT USING (true);
CREATE POLICY "public read" ON booth_genres      FOR SELECT USING (true);
CREATE POLICY "public read" ON genre_group_members FOR SELECT USING (true);

-- ── 관리자만 쓰기 가능 ────────────────────────────────────
CREATE POLICY "admin write" ON event_types   FOR ALL USING (is_admin());
CREATE POLICY "admin write" ON events        FOR ALL USING (is_admin());
CREATE POLICY "admin write" ON booths        FOR ALL USING (is_admin());
CREATE POLICY "admin write" ON artists       FOR ALL USING (is_admin());
CREATE POLICY "admin write" ON genres        FOR ALL USING (is_admin());
CREATE POLICY "admin write" ON genre_groups  FOR ALL USING (is_admin());
CREATE POLICY "admin write" ON booth_artists FOR ALL USING (is_admin());
CREATE POLICY "admin write" ON booth_genres  FOR ALL USING (is_admin());
CREATE POLICY "admin write" ON genre_group_members FOR ALL USING (is_admin());

-- ── 사용자 프로필: 본인만 읽기/수정 ──────────────────────
CREATE POLICY "own profile read"   ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "own profile update" ON user_profiles FOR UPDATE USING (auth.uid() = id);
-- 관리자는 모든 프로필 조회/수정 가능
CREATE POLICY "admin all profiles" ON user_profiles FOR ALL USING (is_admin());

-- ── 즐겨찾기: 본인 데이터만 ───────────────────────────────
CREATE POLICY "own favorites" ON user_favorites
  FOR ALL USING (auth.uid() = user_id);

-- ── 플래너: 본인 데이터만 ─────────────────────────────────
CREATE POLICY "own plans" ON user_booth_plans
  FOR ALL USING (auth.uid() = user_id);
