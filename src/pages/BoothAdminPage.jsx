import { useState, useMemo } from 'react'
import {
  Search, Save, Download, ChevronDown, ChevronUp,
  X, Plus, Store, RefreshCw, ExternalLink,
} from 'lucide-react'
import { useAdminEvents, useAdminBooths } from '../hooks/useBoothAdmin'
import PageHeader from '../components/common/PageHeader'
import EmptyState from '../components/common/EmptyState'
import styles from './BoothAdminPage.module.css'

const LINK_TYPES = [
  { value: 'twitter',  label: 'Twitter / X' },
  { value: 'payment',  label: '사전주문 / 결제' },
  { value: 'official', label: '공식 페이지' },
  { value: 'other',    label: '기타' },
]

const DAYS_OPTIONS = ['월', '화', '수', '목', '금', '토', '일']
const SPEC_OPTIONS = ['청년', '전문', '문구청년', '문구전문', '성덕', '코스어성덕', '']

// ── 링크 편집 행 ──────────────────────────────────────
function LinkRow({ link, onChange, onRemove }) {
  return (
    <div className={styles.linkRow}>
      <select
        className={styles.linkTypeSelect}
        value={link.type}
        onChange={e => onChange({ ...link, type: e.target.value })}
      >
        {LINK_TYPES.map(t => (
          <option key={t.value} value={t.value}>{t.label}</option>
        ))}
      </select>
      <input
        className={styles.linkInput}
        type="url"
        placeholder="https://..."
        value={link.url}
        onChange={e => onChange({ ...link, url: e.target.value })}
      />
      {link.url && (
        <a href={link.url} target="_blank" rel="noopener noreferrer" className={styles.linkPreview}>
          <ExternalLink size={13} />
        </a>
      )}
      <button className={styles.linkRemoveBtn} onClick={onRemove}>
        <X size={13} />
      </button>
    </div>
  )
}

// ── 부스 편집 폼 ──────────────────────────────────────
function BoothEditForm({ booth, onSave, onCancel }) {
  const [form, setForm] = useState({
    name:          booth.name          ?? '',
    display_number:booth.display_number ?? '',
    spec:          booth.spec           ?? '',
    days:          booth.days           ?? [],
    description:   booth.description   ?? '',
    info_image_url:booth.info_image_url ?? '',
    links:         booth.links          ?? [],
    goods:         booth.goods          ?? [],
  })

  const [artists, setArtists] = useState(
    booth.booth_artists?.map(a => a.artist_id).join(', ') ?? ''
  )
  const [tags, setTags] = useState(
    booth.booth_genres?.map(g => g.raw_tag).join(', ') ?? ''
  )
  const [saving, setSaving] = useState(false)

  const toggleDay = (day) => {
    setForm(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day],
    }))
  }

  const addLink = () => {
    setForm(prev => ({
      ...prev,
      links: [...prev.links, { type: 'twitter', url: '', label: '' }],
    }))
  }

  const updateLink = (i, updated) => {
    setForm(prev => {
      const links = [...prev.links]
      links[i] = updated
      return { ...prev, links }
    })
  }

  const removeLink = (i) => {
    setForm(prev => ({
      ...prev,
      links: prev.links.filter((_, idx) => idx !== i),
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    const artistIds = artists.split(',').map(s => s.trim()).filter(Boolean)
    const tagList   = tags.split(',').map(s => s.trim()).filter(Boolean)
    await onSave(booth.id, form, artistIds, tagList)
    setSaving(false)
  }

  return (
    <div className={styles.editForm}>
      <div className={styles.formGrid}>

        {/* 부스명 */}
        <div className={styles.formField}>
          <label className={styles.fieldLabel}>부스명</label>
          <input
            className={styles.fieldInput}
            value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
          />
        </div>

        {/* 부스 번호 */}
        <div className={styles.formField}>
          <label className={styles.fieldLabel}>부스 번호</label>
          <input
            className={styles.fieldInput}
            value={form.display_number}
            onChange={e => setForm(p => ({ ...p, display_number: e.target.value }))}
          />
        </div>

        {/* 규격 */}
        <div className={styles.formField}>
          <label className={styles.fieldLabel}>규격</label>
          <select
            className={styles.fieldSelect}
            value={form.spec}
            onChange={e => setForm(p => ({ ...p, spec: e.target.value }))}
          >
            {SPEC_OPTIONS.map(s => (
              <option key={s} value={s}>{s || '—'}</option>
            ))}
          </select>
        </div>

        {/* 참여 요일 */}
        <div className={styles.formField}>
          <label className={styles.fieldLabel}>참여 요일</label>
          <div className={styles.daysWrap}>
            {DAYS_OPTIONS.map(d => (
              <button
                key={d}
                type="button"
                className={`${styles.dayChip} ${form.days.includes(d) ? styles.dayChipActive : ''}`}
                onClick={() => toggleDay(d)}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* 이미지 URL */}
        <div className={`${styles.formField} ${styles.fullWidth}`}>
          <label className={styles.fieldLabel}>이미지 URL</label>
          <input
            className={styles.fieldInput}
            type="url"
            placeholder="https://..."
            value={form.info_image_url}
            onChange={e => setForm(p => ({ ...p, info_image_url: e.target.value }))}
          />
        </div>

        {/* 설명 */}
        <div className={`${styles.formField} ${styles.fullWidth}`}>
          <label className={styles.fieldLabel}>설명</label>
          <textarea
            className={styles.fieldTextarea}
            rows={2}
            value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
          />
        </div>

        {/* 작가 */}
        <div className={`${styles.formField} ${styles.fullWidth}`}>
          <label className={styles.fieldLabel}>참여 작가 (쉼표로 구분)</label>
          <input
            className={styles.fieldInput}
            placeholder="작가ID1, 작가ID2"
            value={artists}
            onChange={e => setArtists(e.target.value)}
          />
        </div>

        {/* 장르 태그 */}
        <div className={`${styles.formField} ${styles.fullWidth}`}>
          <label className={styles.fieldLabel}>장르 태그 (쉼표로 구분)</label>
          <input
            className={styles.fieldInput}
            placeholder="블루아카이브, 원신, 보컬로이드"
            value={tags}
            onChange={e => setTags(e.target.value)}
          />
        </div>

        {/* 링크 */}
        <div className={`${styles.formField} ${styles.fullWidth}`}>
          <div className={styles.fieldLabelRow}>
            <label className={styles.fieldLabel}>링크</label>
            <button className={styles.addLinkBtn} onClick={addLink} type="button">
              <Plus size={12} /> 링크 추가
            </button>
          </div>
          <div className={styles.linkList}>
            {form.links.map((link, i) => (
              <LinkRow
                key={i}
                link={link}
                onChange={updated => updateLink(i, updated)}
                onRemove={() => removeLink(i)}
              />
            ))}
            {form.links.length === 0 && (
              <p className={styles.emptyLinks}>등록된 링크가 없습니다.</p>
            )}
          </div>
        </div>

      </div>

      {/* 저장/취소 버튼 */}
      <div className={styles.formActions}>
        <button className={styles.cancelBtn} onClick={onCancel}>
          취소
        </button>
        <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
          <Save size={14} />
          {saving ? '저장 중...' : '저장'}
        </button>
      </div>
    </div>
  )
}

// ── 부스 목록 행 ──────────────────────────────────────
function BoothRow({ booth, onEdit, isEditing }) {
  return (
    <div className={`${styles.boothRow} ${isEditing ? styles.boothRowEditing : ''}`}>
      <div className={styles.boothRowMain}>
        <span className={styles.boothNumber}>{booth.display_number}</span>
        <span className={styles.boothName}>{booth.name}</span>
        <span className={styles.boothSpec}>{booth.spec}</span>
        <span className={styles.boothDays}>{(booth.days ?? []).join('·')}</span>
        <div className={styles.boothTags}>
          {booth.booth_genres?.slice(0, 3).map(g => (
            <span key={g.raw_tag} className={styles.boothTag}>{g.raw_tag}</span>
          ))}
        </div>
        <button
          className={`${styles.editBtn} ${isEditing ? styles.editBtnActive : ''}`}
          onClick={onEdit}
        >
          {isEditing ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {isEditing ? '닫기' : '수정'}
        </button>
      </div>
    </div>
  )
}

// ── 메인 페이지 ──────────────────────────────────────
export default function BoothAdminPage() {
  const { events, eventTypes, loading: evLoading } = useAdminEvents()
  const [selectedEventId, setSelectedEventId] = useState('')
  const [editingId,       setEditingId]        = useState(null)
  const [query,           setQuery]            = useState('')
  const [saveStatus,      setSaveStatus]       = useState(null) // 'success' | 'error'

  const {
    booths, loading: boothLoading, error,
    updateBooth, updateBoothArtists, updateBoothGenres,
    exportJSON, reload,
  } = useAdminBooths(selectedEventId)

  // 검색 필터
  const filtered = useMemo(() => {
    if (!query.trim()) return booths
    const q = query.toLowerCase()
    return booths.filter(b =>
      b.name.toLowerCase().includes(q) ||
      b.display_number?.toLowerCase().includes(q) ||
      b.booth_genres?.some(g => g.raw_tag?.toLowerCase().includes(q))
    )
  }, [booths, query])

  const handleSave = async (boothId, form, artistIds, tags) => {
    setSaveStatus(null)
    const [r1, r2, r3] = await Promise.all([
      updateBooth(boothId, form),
      updateBoothArtists(boothId, artistIds),
      updateBoothGenres(boothId, tags),
    ])
    if (r1 && r2 && r3) {
      setSaveStatus('success')
      setEditingId(null)
      setTimeout(() => setSaveStatus(null), 3000)
    } else {
      setSaveStatus('error')
    }
  }

  const handleExport = async () => {
    await exportJSON()
  }

  return (
    <div className={styles.page}>
      <PageHeader
        title="부스 데이터 관리"
        description="행사를 선택하고 부스 정보를 수정합니다. 저장 즉시 DB에 반영됩니다."
      />

      {/* 행사 선택 */}
      <div className={styles.eventSelector}>
        <label className={styles.selectorLabel}>행사 선택</label>
        <select
          className={styles.selectorSelect}
          value={selectedEventId}
          onChange={e => { setSelectedEventId(e.target.value); setEditingId(null); setQuery('') }}
        >
          <option value="">— 행사를 선택하세요 —</option>
          {events.map(e => {
              const type = eventTypes?.[e.type]
              return (
                <option key={e.id} value={e.id}>
                  {(type?.shortName ?? e.type)} · {e.name} ({e.dates?.start ?? '-'})
                </option>
              )
            })}
        </select>
      </div>

      {/* 저장 상태 */}
      {saveStatus === 'success' && (
        <div className={styles.statusSuccess}>✓ 저장되었습니다.</div>
      )}
      {saveStatus === 'error' && (
        <div className={styles.statusError}>저장 중 오류가 발생했습니다.</div>
      )}

      {/* 행사 미선택 */}
      {!selectedEventId && !evLoading && (
        <EmptyState
          icon={<Store size={32} strokeWidth={1.25} />}
          title="행사를 선택해주세요"
          description="위에서 수정할 행사 회차를 선택하면 부스 목록이 표시됩니다."
        />
      )}

      {/* 부스 목록 */}
      {selectedEventId && (
        <>
          {/* 툴바 */}
          <div className={styles.toolbar}>
            <div className={styles.searchWrap}>
              <Search size={14} className={styles.searchIcon} />
              <input
                className={styles.searchInput}
                placeholder="부스명, 번호, 장르 검색..."
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              {query && (
                <button className={styles.searchClear} onClick={() => setQuery('')}>
                  <X size={13} />
                </button>
              )}
            </div>
            <button className={styles.reloadBtn} onClick={reload} title="새로고침">
              <RefreshCw size={14} />
            </button>
            <button className={styles.exportBtn} onClick={handleExport} title="JSON 내보내기">
              <Download size={14} />
              JSON 내보내기
            </button>
          </div>

          {/* 결과 수 */}
          <p className={styles.resultCount}>
            {filtered.length}<span>/{booths.length}</span>개 부스
          </p>

          {/* 로딩 */}
          {boothLoading && (
            <div className={styles.skeletonList}>
              {[...Array(5)].map((_, i) => <div key={i} className={styles.skeleton} />)}
            </div>
          )}

          {/* 오류 */}
          {error && <p className={styles.errorMsg}>{error}</p>}

          {/* 부스 목록 */}
          {!boothLoading && !error && (
            <div className={styles.boothList}>
              {filtered.map(booth => (
                <div key={booth.id}>
                  <BoothRow
                    booth={booth}
                    isEditing={editingId === booth.id}
                    onEdit={() => setEditingId(
                      editingId === booth.id ? null : booth.id
                    )}
                  />
                  {editingId === booth.id && (
                    <BoothEditForm
                      booth={booth}
                      onSave={handleSave}
                      onCancel={() => setEditingId(null)}
                    />
                  )}
                </div>
              ))}
              {filtered.length === 0 && !boothLoading && (
                <EmptyState
                  icon={<Store size={28} strokeWidth={1.25} />}
                  title="검색 결과가 없습니다"
                />
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
