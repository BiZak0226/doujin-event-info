import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

/**
 * 행사 목록 로드 (회차 선택용)
 */
export function useAdminEvents() {
  const [events,     setEvents]     = useState([])
  const [eventTypes, setEventTypes] = useState({})
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('events').select('*').order('date_start', { ascending: false }),
      supabase.from('event_types').select('*'),
    ]).then(([evRes, typeRes]) => {
      if (!evRes.error)   setEvents(evRes.data ?? [])
      if (!typeRes.error) {
        const map = {}
        typeRes.data?.forEach(t => { map[t.id] = t })
        setEventTypes(map)
      }
      setLoading(false)
    })
  }, [])

  return { events, eventTypes, loading }
}

/**
 * 특정 행사의 부스 목록 로드
 */
export function useAdminBooths(eventId) {
  const [booths,  setBooths]  = useState([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const load = useCallback(async () => {
    if (!eventId) { setBooths([]); return }
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('booths')
      .select(`
        *,
        booth_artists(artist_id),
        booth_genres(genre_id, raw_tag)
      `)
      .eq('event_id', eventId)
      .order('display_number')
    if (error) { setError(error.message); setLoading(false); return }
    setBooths(data ?? [])
    setLoading(false)
  }, [eventId])

  useEffect(() => { load() }, [load])

  // ── 부스 수정 ────────────────────────────────────────
  const updateBooth = useCallback(async (boothId, updates) => {
    const { error } = await supabase
      .from('booths')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', boothId)
      .eq('event_id', eventId)
    if (error) { console.error('[BoothAdmin] 수정 오류:', error.message); return false }

    setBooths(prev => prev.map(b =>
      b.id === boothId ? { ...b, ...updates } : b
    ))
    return true
  }, [eventId])

  // ── 작가 연결 업데이트 ────────────────────────────────
  const updateBoothArtists = useCallback(async (boothId, artistIds) => {
    // 기존 연결 삭제
    await supabase
      .from('booth_artists')
      .delete()
      .eq('booth_id', boothId)
      .eq('event_id', eventId)

    // 새 연결 추가
    if (artistIds.length > 0) {
      const rows = artistIds.map(a => ({ booth_id: boothId, event_id: eventId, artist_id: a }))
      const { error } = await supabase.from('booth_artists').insert(rows)
      if (error) { console.error('[BoothAdmin] 작가 연결 오류:', error.message); return false }
    }
    await load()
    return true
  }, [eventId, load])

  // ── 장르 연결 업데이트 ────────────────────────────────
  const updateBoothGenres = useCallback(async (boothId, tags) => {
    // 기존 연결 삭제
    await supabase
      .from('booth_genres')
      .delete()
      .eq('booth_id', boothId)
      .eq('event_id', eventId)

    // genres 에서 태그 매핑
    if (tags.length > 0) {
      const { data: genres } = await supabase
        .from('genres')
        .select('id, name, aliases')

      const normalize = s => s.toLowerCase().replace(/[\s\-·:!?]/g, '')
      const genreMap  = new Map()
      genres?.forEach(g => {
        genreMap.set(normalize(g.name), g.id)
        ;(g.aliases ?? []).forEach(a => genreMap.set(normalize(a), g.id))
      })

      const rows = tags.map(tag => ({
        booth_id: boothId,
        event_id: eventId,
        genre_id: genreMap.get(normalize(tag)) ?? null,
        raw_tag:  tag,
      })).filter(r => r.genre_id)  // 매핑 안 된 태그는 제외

      if (rows.length > 0) {
        const { error } = await supabase.from('booth_genres').insert(rows)
        if (error) { console.error('[BoothAdmin] 장르 연결 오류:', error.message); return false }
      }
    }
    await load()
    return true
  }, [eventId, load])

  // ── DB → JSON 내보내기 ────────────────────────────────
  const exportJSON = useCallback(async () => {
    const { data, error } = await supabase
      .from('booths')
      .select('*')
      .eq('event_id', eventId)
      .order('display_number')
    if (error) return null

    // 부스 형식으로 변환
    const list = data.map(b => ({
      id:            b.id,
      name:          b.name,
      numbers:       b.numbers,
      displayNumber: b.display_number,
      spec:          b.spec,
      days:          b.days,
      description:   b.description,
      artists:       [],
      infoImage:     b.info_image_url,
      goods:         b.goods,
      links:         b.links,
      tags:          [],
    }))

    const json = JSON.stringify(
      { lastUpdate: new Date().toISOString().slice(0, 10), list },
      null, 2
    )
    // 다운로드 트리거
    const blob = new Blob([json], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `${eventId}.json`
    a.click()
    URL.revokeObjectURL(url)
    return true
  }, [eventId])

  return {
    booths, loading, error,
    updateBooth, updateBoothArtists, updateBoothGenres,
    exportJSON, reload: load,
  }
}
