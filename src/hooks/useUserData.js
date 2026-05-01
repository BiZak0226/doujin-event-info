import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

/**
 * 즐겨찾기 훅
 * target_type: 'artist' | 'genre' | 'booth' | 'event'
 */
export function useFavorites(userId) {
  const [favorites, setFavorites] = useState([])
  const [loading,   setLoading]   = useState(true)

  const load = useCallback(async () => {
    if (!userId) { setFavorites([]); setLoading(false); return }
    const { data, error } = await supabase
      .from('user_favorites')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (!error) setFavorites(data ?? [])
    setLoading(false)
  }, [userId])

  useEffect(() => { load() }, [load])

  /** 즐겨찾기 추가 */
  const add = useCallback(async (targetType, targetId, eventId = null) => {
    const { data, error } = await supabase
      .from('user_favorites')
      .insert({ user_id: userId, target_type: targetType, target_id: targetId, event_id: eventId })
      .select()
      .single()
    if (!error) setFavorites((prev) => [data, ...prev])
    return !error
  }, [userId])

  /** 즐겨찾기 제거 */
  const remove = useCallback(async (targetType, targetId) => {
    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('target_type', targetType)
      .eq('target_id', targetId)
    if (!error) {
      setFavorites((prev) =>
        prev.filter((f) => !(f.target_type === targetType && f.target_id === targetId))
      )
    }
    return !error
  }, [userId])

  /** 즐겨찾기 여부 */
  const isFavorite = useCallback((targetType, targetId) =>
    favorites.some((f) => f.target_type === targetType && f.target_id === targetId),
  [favorites])

  /** 타입별 필터 */
  const byType = useCallback((type) =>
    favorites.filter((f) => f.target_type === type),
  [favorites])

  return { favorites, loading, add, remove, isFavorite, byType, reload: load }
}

/**
 * 행사 플래너 훅 (방문 예정 / 관심)
 */
export function useBoothPlans(userId) {
  const [plans,   setPlans]   = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!userId) { setPlans([]); setLoading(false); return }
    const { data, error } = await supabase
      .from('user_booth_plans')
      .select(`
        *,
        booth:booths(id, name, display_number, spec, days, links, event_id)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (!error) setPlans(data ?? [])
    setLoading(false)
  }, [userId])

  useEffect(() => { load() }, [load])

  /** 플래너 추가/업데이트 */
  const upsert = useCallback(async (boothId, eventId, status, memo = '') => {
    const { data, error } = await supabase
      .from('user_booth_plans')
      .upsert(
        { user_id: userId, booth_id: boothId, event_id: eventId, status, memo },
        { onConflict: 'user_id,booth_id,event_id' }
      )
      .select(`*, booth:booths(id, name, display_number, spec, days, links, event_id)`)
      .single()
    if (!error) {
      setPlans((prev) => {
        const idx = prev.findIndex(
          (p) => p.booth_id === boothId && p.event_id === eventId
        )
        if (idx >= 0) {
          const next = [...prev]
          next[idx] = data
          return next
        }
        return [data, ...prev]
      })
    }
    return !error
  }, [userId])

  /** 플래너 제거 */
  const remove = useCallback(async (boothId, eventId) => {
    const { error } = await supabase
      .from('user_booth_plans')
      .delete()
      .eq('user_id', userId)
      .eq('booth_id', boothId)
      .eq('event_id', eventId)
    if (!error) {
      setPlans((prev) =>
        prev.filter((p) => !(p.booth_id === boothId && p.event_id === eventId))
      )
    }
    return !error
  }, [userId])

  /** 상태 조회 */
  const getStatus = useCallback((boothId, eventId) =>
    plans.find((p) => p.booth_id === boothId && p.event_id === eventId)?.status ?? null,
  [plans])

  /** 행사별 필터 */
  const byEvent = useCallback((eventId) =>
    plans.filter((p) => p.event_id === eventId),
  [plans])

  return { plans, loading, upsert, remove, getStatus, byEvent, reload: load }
}
