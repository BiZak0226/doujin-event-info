/**
 * migrate.js — JSON 데이터를 Supabase로 마이그레이션
 *
 * 실행 방법:
 *   1. .env.local 에 아래 두 변수 설정
 *      VITE_SUPABASE_URL=https://xxxx.supabase.co
 *      VITE_SUPABASE_ANON_KEY=eyJ...
 *      SUPABASE_SERVICE_ROLE_KEY=eyJ...  ← 마이그레이션에는 service role key 필요
 *
 *   2. 패키지 설치
 *      npm install @supabase/supabase-js dotenv
 *
 *   3. 실행
 *      node supabase/migrate.js
 *
 * 주의: service_role key는 RLS를 우회하므로 마이그레이션 후 절대 노출 금지
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir   = resolve(__dirname, '../public/data')


// 여기 추가 ↓↓↓
console.log('URL:', process.env.VITE_SUPABASE_URL)
console.log(
  'SERVICE KEY PREFIX:',
  process.env.SUPABASE_SECRET_KEY?.slice(0, 20)
)

if (!process.env.SUPABASE_SECRET_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY 없음')
}

if (
  process.env.SUPABASE_SECRET_KEY ===
  process.env.VITE_SUPABASE_ANON_KEY
) {
  throw new Error('service role key 대신 anon key를 사용 중입니다.')
}
// 여기 추가 ↑↑↑



// const supabase = createClient(
//   process.env.VITE_SUPABASE_URL,
//   process.env.SUPABASE_SECRET_KEY   // service role key — RLS 우회
// )

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)



// ── 유틸 ─────────────────────────────────────────────────
function readJSON(filename) {
  const raw = readFileSync(resolve(dataDir, filename), 'utf-8')
  return JSON.parse(raw)
}

function readBoothFile(eventId) {
  try {
    const raw = readFileSync(resolve(dataDir, `booths/${eventId}.json`), 'utf-8')
    const json = JSON.parse(raw)
    return Array.isArray(json) ? json : (json.list ?? [])
  } catch {
    return null
  }
}

async function upsert(table, data, options = {}) {
  const { error } = await supabase
    .from(table)
    .upsert(data, { onConflict: options.conflict ?? 'id', ...options })
  if (error) {
    console.error(`  ✗ ${table} upsert 오류:`, error.message)
    return false
  }
  return true
}

// ── genres.json aliases 기반 태그 매핑 맵 빌드 ───────────
function buildTagMap(genreList) {
  const map = new Map()
  const normalize = (s) => s.toLowerCase().replace(/[\s\-·:!?。、!?]/g, '')
  for (const g of genreList) {
    map.set(normalize(g.name), g.id)
    for (const alias of g.aliases ?? []) {
      map.set(normalize(alias), g.id)
    }
  }
  return map
}

// ── 마이그레이션 함수들 ───────────────────────────────────

async function migrateEventTypes(eventsData) {
  console.log('\n[1] event_types 마이그레이션...')
  const rows = Object.entries(eventsData.eventTypes ?? {}).map(([id, t]) => ({
    id,
    name:       t.name,
    short_name: t.shortName,
    color:      t.color,
    links:      t.links ?? {},
  }))
  const ok = await upsert('event_types', rows)
  console.log(ok ? `  ✓ ${rows.length}개 완료` : '  ✗ 실패')
}

async function migrateEvents(eventsData) {
  console.log('\n[2] events 마이그레이션...')
  const rows = eventsData.events.map((e) => ({
    id:             e.id,
    type_id:        e.type,
    name:           e.name,
    short_name:     e.shortName,
    category:       e.category ?? null,
    city:           e.city,
    venue:          e.venue,
    date_start:     e.dates.start,
    date_end:       e.dates.end,
    links:          e.links ?? {},
    partner_events: e.partnerEvents ?? [],
  }))
  const ok = await upsert('events', rows)
  console.log(ok ? `  ✓ ${rows.length}개 완료` : '  ✗ 실패')
}

async function migrateArtists(artistsData) {
  console.log('\n[3] artists 마이그레이션...')
  const rows = artistsData.map((a) => ({
    id:         a.id,
    nickname:   a.nickname,
    bio:        a.bio ?? '',
    avatar_url: a.avatar ?? '',
    links:      a.links ?? {},
  }))
  const ok = await upsert('artists', rows)
  console.log(ok ? `  ✓ ${rows.length}개 완료` : '  ✗ 실패')
}

async function migrateGenres(genresData) {
  console.log('\n[4] genre_groups 마이그레이션...')
  const groupRows = (genresData.groups ?? []).map((g) => ({
    id:      g.id,
    name:    g.name,
    aliases: g.aliases ?? [],
  }))
  const ok1 = await upsert('genre_groups', groupRows)
  console.log(ok1 ? `  ✓ ${groupRows.length}개 완료` : '  ✗ 실패')

  console.log('\n[5] genres 마이그레이션...')
  const genreRows = (genresData.list ?? []).map((g) => ({
    id:       g.id,
    name:     g.name,
    aliases:  g.aliases ?? [],
    category: g.category ?? 'other',
  }))
  const ok2 = await upsert('genres', genreRows)
  console.log(ok2 ? `  ✓ ${genreRows.length}개 완료` : '  ✗ 실패')

  console.log('\n[6] genre_group_members 마이그레이션...')
  const memberRows = []
  for (const g of genresData.groups ?? []) {
    for (const workId of g.works ?? []) {
      memberRows.push({ group_id: g.id, genre_id: workId })
    }
  }
  const ok3 = await upsert('genre_group_members', memberRows, {
    conflict: 'group_id,genre_id',
  })
  console.log(ok3 ? `  ✓ ${memberRows.length}개 완료` : '  ✗ 실패')
}

async function migrateBooths(eventsData, genreList) {
  const tagMap = buildTagMap(genreList)
  const eventIds = eventsData.events.map((e) => e.id)

  let boothTotal       = 0
  let boothArtistTotal = 0
  let boothGenreTotal  = 0

  for (const eventId of eventIds) {
    const booths = readBoothFile(eventId)
    if (!booths) continue

    console.log(`\n[7] booths — ${eventId} (${booths.length}개)`)

    // 부스 기본 정보
    const boothRows = booths.map((b) => ({
      id:             b.id,
      event_id:       eventId,
      name:           b.name,
      numbers:        b.numbers ?? [],
      display_number: b.displayNumber ?? '',
      spec:           b.spec ?? '',
      days:           b.days ?? [],
      description:    b.description ?? '',
      info_image_url: b.infoImage ?? '',
      goods:          b.goods ?? [],
      links:          b.links ?? [],
    }))

    const ok = await upsert('booths', boothRows, { conflict: 'id,event_id' })
    if (!ok) continue
    boothTotal += boothRows.length

    // 부스 ↔ 작가
    const artistRows = []
    for (const b of booths) {
      for (const artistId of b.artists ?? []) {
        artistRows.push({ booth_id: b.id, event_id: eventId, artist_id: artistId })
      }
    }
    if (artistRows.length > 0) {
      await upsert('booth_artists', artistRows, { conflict: 'booth_id,event_id,artist_id' })
      boothArtistTotal += artistRows.length
    }

    // 부스 ↔ 장르 (태그 매핑)
    const genreRows = []
    const normalize = (s) => s.toLowerCase().replace(/[\s\-·:!?。、!?]/g, '')
    for (const b of booths) {
      for (const tag of b.tags ?? []) {
        const genreId = tagMap.get(normalize(tag))
        if (genreId) {
          genreRows.push({
            booth_id: b.id,
            event_id: eventId,
            genre_id: genreId,
            raw_tag:  tag,
          })
        }
        // 매핑되지 않은 태그는 raw_tag만으로 저장하는 방식도 고려 가능
      }
    }
    if (genreRows.length > 0) {
      await upsert('booth_genres', genreRows, { conflict: 'booth_id,event_id,genre_id' })
      boothGenreTotal += genreRows.length
    }

    console.log(
      `  ✓ 부스 ${boothRows.length}개 / 작가연결 ${artistRows.length}개 / 장르연결 ${genreRows.length}개`
    )
  }

  console.log(`\n  총계 — 부스 ${boothTotal}개, 작가연결 ${boothArtistTotal}개, 장르연결 ${boothGenreTotal}개`)
}

// ── 메인 ────────────────────────────────────────────────────
async function main() {
  console.log('=== 마이그레이션 시작 ===')
  console.log('Supabase URL:', process.env.VITE_SUPABASE_URL)

  const eventsData  = readJSON('events.json')
  const artistsData = readJSON('artists.json')
  const genresData  = readJSON('genres.json')

  await migrateEventTypes(eventsData)
  await migrateEvents(eventsData)
  await migrateArtists(artistsData)
  await migrateGenres(genresData)
  await migrateBooths(eventsData, genresData.list ?? [])

  console.log('\n=== 마이그레이션 완료 ===')
}

main().catch((err) => {
  console.error('마이그레이션 실패:', err)
  process.exit(1)
})
