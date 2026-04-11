import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY_EVENTS      = 'admin_events_data'
const STORAGE_KEY_EVENT_TYPES = 'admin_event_types_data'

/**
 * 행사 CRUD 훅
 * - 초기 로드: /data/events.json fetch
 * - 변경사항은 localStorage에 임시 저장
 * - 최종 저장은 JSON 내보내기 방식
 */
export function useEventsAdmin() {
  const [eventTypes, setEventTypes] = useState({})
  const [events,     setEvents]     = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [isDirty,    setIsDirty]    = useState(false)

  // 초기 로드: localStorage 우선, 없으면 fetch
  useEffect(() => {
    const cachedTypes  = localStorage.getItem(STORAGE_KEY_EVENT_TYPES)
    const cachedEvents = localStorage.getItem(STORAGE_KEY_EVENTS)

    if (cachedTypes && cachedEvents) {
      try {
        setEventTypes(JSON.parse(cachedTypes))
        setEvents(JSON.parse(cachedEvents))
        setLoading(false)
        setIsDirty(true)
        return
      } catch {
        // 파싱 실패 시 fetch로 fallback
      }
    }

    fetch('/data/events.json')
      .then((r) => { if (!r.ok) throw new Error('events.json 로드 실패'); return r.json() })
      .then((json) => {
        setEventTypes(json.eventTypes ?? {})
        setEvents(json.events ?? [])
        setLoading(false)
      })
      .catch((err) => { setError(err.message); setLoading(false) })
  }, [])

  // localStorage 동기화
  const persist = useCallback((types, evts) => {
    localStorage.setItem(STORAGE_KEY_EVENT_TYPES, JSON.stringify(types))
    localStorage.setItem(STORAGE_KEY_EVENTS,      JSON.stringify(evts))
    setIsDirty(true)
  }, [])

  // ── 행사 타입 CRUD ──
  const addEventType = useCallback((key, data) => {
    setEventTypes((prev) => {
      const next = { ...prev, [key]: data }
      persist(next, events)
      return next
    })
  }, [events, persist])

  const updateEventType = useCallback((key, data) => {
    setEventTypes((prev) => {
      const next = { ...prev, [key]: { ...prev[key], ...data } }
      persist(next, events)
      return next
    })
  }, [events, persist])

  const deleteEventType = useCallback((key) => {
    setEventTypes((prev) => {
      const next = { ...prev }
      delete next[key]
      persist(next, events)
      return next
    })
  }, [events, persist])

  // ── 회차 CRUD ──
  const addEvent = useCallback((event) => {
    setEvents((prev) => {
      const next = [...prev, event]
      persist(eventTypes, next)
      return next
    })
  }, [eventTypes, persist])

  const updateEvent = useCallback((id, data) => {
    setEvents((prev) => {
      const next = prev.map((e) => e.id === id ? { ...e, ...data } : e)
      persist(eventTypes, next)
      return next
    })
  }, [eventTypes, persist])

  const deleteEvent = useCallback((id) => {
    setEvents((prev) => {
      const next = prev.filter((e) => e.id !== id)
      persist(eventTypes, next)
      return next
    })
  }, [eventTypes, persist])

  // ── 내보내기 ──
  const exportJSON = useCallback(() => {
    return JSON.stringify({ eventTypes, events }, null, 2)
  }, [eventTypes, events])

  // ── 로컬 캐시 초기화 (파일 재로드) ──
  const resetToFile = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY_EVENT_TYPES)
    localStorage.removeItem(STORAGE_KEY_EVENTS)
    setIsDirty(false)
    setLoading(true)
    fetch('/data/events.json')
      .then((r) => r.json())
      .then((json) => {
        setEventTypes(json.eventTypes ?? {})
        setEvents(json.events ?? [])
        setLoading(false)
      })
  }, [])

  return {
    eventTypes, events, loading, error, isDirty,
    addEventType, updateEventType, deleteEventType,
    addEvent, updateEvent, deleteEvent,
    exportJSON, resetToFile,
  }
}
