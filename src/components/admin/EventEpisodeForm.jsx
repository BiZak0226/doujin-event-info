import { useState, useEffect } from 'react'
import styles from './EventForm.module.css'

const CATEGORY_OPTIONS = [
  { value: '',        label: '없음 (기본)' },
  { value: 'regular', label: '정기' },
  { value: 'special', label: '특별' },
  { value: 'petit',   label: '쁘띠' },
]

const CITY_PRESETS = ['서울', '부산', '일산', '수원', '판교', '부천', '전주', '순천', '대구', '광주']

function buildId(typeKey, shortName, episode, category) {
  if (!typeKey) return ''
  const cat = category ? `_${category}` : ''
  const ep  = episode  ? `_${episode}`  : ''
  return `${typeKey}${cat}${ep}`.toLowerCase().replace(/\s+/g, '_')
}

function buildName(typeName, episode, city, category) {
  if (!typeName) return ''
  const catMap = { regular: '', special: '(특별)', petit: '쁘띠 ' }
  const catStr = catMap[category] ?? ''
  const epStr  = episode ? ` ${episode}회` : ''
  const cityStr = city ? ` ${city}` : ''
  return `${typeName}${catStr}${epStr}${cityStr}`
}

function buildShortName(shortName, episode, city, category) {
  if (!shortName) return ''
  const catMap = { petit: ' Petit', special: ' Special', regular: '' }
  const catStr = catMap[category] ?? ''
  const epStr  = episode ? ` ${episode}` : ''
  const cityStr = city ? ` ${city}` : ''
  return `${shortName}${catStr}${epStr}${cityStr}`
}

export default function EventEpisodeForm({ initial, eventTypes, existingIds = [], onSubmit, onCancel }) {
  const isEdit = !!initial

  const [form, setForm] = useState({
    type:          '',
    episode:       '',
    category:      '',
    city:          '',
    venue:         '',
    startDate:     '',
    endDate:       '',
    collaboration: '',
    // 자동 생성 필드 (수동 오버라이드 가능)
    id:            '',
    name:          '',
    shortName:     '',
    // 오버라이드 토글
    overrideId:    false,
    overrideName:  false,
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (initial) {
      setForm({
        type:          initial.type         ?? '',
        episode:       initial.episode      ?? '',
        category:      initial.category     ?? '',
        city:          initial.city         ?? '',
        venue:         initial.venue        ?? '',
        startDate:     initial.dates?.start ?? '',
        endDate:       initial.dates?.end   ?? '',
        collaboration: (initial.collaboration ?? []).join(', '),
        id:            initial.id           ?? '',
        name:          initial.name         ?? '',
        shortName:     initial.shortName    ?? '',
        overrideId:    true,
        overrideName:  true,
      })
    }
  }, [initial])

  const set = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value }

      // 자동 생성 필드 재계산
      const typeInfo = eventTypes[next.type] ?? {}
      if (!next.overrideId) {
        next.id = buildId(next.type, typeInfo.shortName, next.episode, next.category)
      }
      if (!next.overrideName) {
        next.name      = buildName(typeInfo.name, next.episode, next.city, next.category)
        next.shortName = buildShortName(typeInfo.shortName, next.episode, next.city, next.category)
      }
      // 종료일 자동 동기화 (시작일 변경 시 종료일이 비어있으면 동일 날짜로)
      if (field === 'startDate' && !prev.endDate) {
        next.endDate = value
      }
      return next
    })
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.type)       e.type      = '행사 타입을 선택해주세요.'
    if (!form.city)       e.city      = '도시를 입력해주세요.'
    if (!form.venue)      e.venue     = '장소를 입력해주세요.'
    if (!form.startDate)  e.startDate = '시작일을 입력해주세요.'
    if (!form.endDate)    e.endDate   = '종료일을 입력해주세요.'
    if (form.startDate && form.endDate && form.startDate > form.endDate) {
      e.endDate = '종료일은 시작일 이후여야 합니다.'
    }
    if (!form.id)         e.id        = 'ID가 생성되지 않았습니다.'
    if (!isEdit && existingIds.includes(form.id)) {
      e.id = '이미 존재하는 ID입니다. ID를 직접 수정해주세요.'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    const collabArr = form.collaboration
      .split(',').map((s) => s.trim()).filter(Boolean)

    onSubmit({
      id:            form.id,
      name:          form.name,
      shortName:     form.shortName,
      type:          form.type,
      episode:       form.episode ? Number(form.episode) : null,
      category:      form.category || null,
      city:          form.city,
      venue:         form.venue,
      dates:         { start: form.startDate, end: form.endDate },
      collaboration: collabArr.length ? collabArr : undefined,
    })
  }

  const typeInfo = eventTypes[form.type]

  return (
    <div className={styles.form}>
      <h2 className={styles.formTitle}>
        {isEdit ? '회차 수정' : '회차 추가'}
      </h2>
      <p className={styles.formDesc}>
        등록된 행사 타입의 특정 회차 정보를 입력합니다.
      </p>

      <div className={styles.fieldGroup}>

        {/* 행사 타입 선택 */}
        <div className={styles.field}>
          <label className={styles.label}>
            행사 타입 <span className={styles.req}>*</span>
          </label>
          <div className={styles.typeCards}>
            {Object.entries(eventTypes).map(([key, t]) => (
              <button
                key={key}
                type="button"
                className={`${styles.typeCard} ${form.type === key ? styles.typeCardActive : ''}`}
                onClick={() => set('type', key)}
                disabled={isEdit}
              >
                <span className={styles.typeCardName}>{t.name}</span>
                <span className={styles.typeCardShort}>{t.shortName}</span>
              </button>
            ))}
          </div>
          {errors.type && <p className={styles.errorMsg}>{errors.type}</p>}
        </div>

        {/* 회차 + 카테고리 */}
        <div className={styles.row2}>
          <div className={styles.field}>
            <label className={styles.label}>회차</label>
            <input
              className={styles.input}
              type="number"
              min="1"
              value={form.episode}
              onChange={(e) => set('episode', e.target.value)}
              placeholder="예: 331"
            />
            <p className={styles.hint}>정기 행사가 아닌 경우 비워두세요.</p>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>카테고리</label>
            <select
              className={styles.select}
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
            >
              {CATEGORY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <p className={styles.hint}>일러스타 페스 전용. 코믹월드는 없음으로 두세요.</p>
          </div>
        </div>

        {/* 도시 + 장소 */}
        <div className={styles.row2}>
          <div className={styles.field}>
            <label className={styles.label}>
              도시 <span className={styles.req}>*</span>
            </label>
            <input
              className={`${styles.input} ${errors.city ? styles.inputError : ''}`}
              value={form.city}
              onChange={(e) => set('city', e.target.value)}
              list="city-presets"
              placeholder="예: 부산"
            />
            <datalist id="city-presets">
              {CITY_PRESETS.map((c) => <option key={c} value={c} />)}
            </datalist>
            {errors.city && <p className={styles.errorMsg}>{errors.city}</p>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              장소 <span className={styles.req}>*</span>
            </label>
            <input
              className={`${styles.input} ${errors.venue ? styles.inputError : ''}`}
              value={form.venue}
              onChange={(e) => set('venue', e.target.value)}
              placeholder="예: BEXCO 제2전시장"
            />
            {errors.venue && <p className={styles.errorMsg}>{errors.venue}</p>}
          </div>
        </div>

        {/* 날짜 */}
        <div className={styles.row2}>
          <div className={styles.field}>
            <label className={styles.label}>
              시작일 <span className={styles.req}>*</span>
            </label>
            <input
              className={`${styles.input} ${errors.startDate ? styles.inputError : ''}`}
              type="date"
              value={form.startDate}
              onChange={(e) => set('startDate', e.target.value)}
            />
            {errors.startDate && <p className={styles.errorMsg}>{errors.startDate}</p>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              종료일 <span className={styles.req}>*</span>
            </label>
            <input
              className={`${styles.input} ${errors.endDate ? styles.inputError : ''}`}
              type="date"
              value={form.endDate}
              onChange={(e) => set('endDate', e.target.value)}
            />
            {errors.endDate && <p className={styles.errorMsg}>{errors.endDate}</p>}
            <p className={styles.hint}>당일 행사라면 시작일과 동일하게 입력하세요.</p>
          </div>
        </div>

        {/* 협력 행사 */}
        <div className={styles.field}>
          <label className={styles.label}>협력 행사</label>
          <input
            className={styles.input}
            value={form.collaboration}
            onChange={(e) => set('collaboration', e.target.value)}
            placeholder="예: G-STAR 2024, VOCASTAR  (쉼표로 구분)"
          />
          <p className={styles.hint}>없으면 비워두세요.</p>
        </div>

        {/* 자동 생성 필드 미리보기 + 오버라이드 */}
        <div className={styles.autoSection}>
          <p className={styles.autoLabel}>자동 생성 값 미리보기</p>

          <div className={styles.autoGrid}>
            {/* ID */}
            <div className={styles.autoField}>
              <div className={styles.autoHeader}>
                <span className={styles.autoKey}>id</span>
                <button
                  className={styles.overrideBtn}
                  onClick={() => setForm((p) => ({ ...p, overrideId: !p.overrideId }))}
                >
                  {form.overrideId ? '자동으로 돌아가기' : '직접 수정'}
                </button>
              </div>
              <input
                className={`${styles.input} ${styles.monoInput} ${errors.id ? styles.inputError : ''}`}
                value={form.id}
                onChange={(e) => setForm((p) => ({ ...p, id: e.target.value, overrideId: true }))}
                readOnly={!form.overrideId}
              />
              {errors.id && <p className={styles.errorMsg}>{errors.id}</p>}
            </div>

            {/* name */}
            <div className={styles.autoField}>
              <div className={styles.autoHeader}>
                <span className={styles.autoKey}>name</span>
                <button
                  className={styles.overrideBtn}
                  onClick={() => setForm((p) => ({ ...p, overrideName: !p.overrideName }))}
                >
                  {form.overrideName ? '자동으로 돌아가기' : '직접 수정'}
                </button>
              </div>
              <input
                className={`${styles.input} ${form.overrideName ? '' : ''}`}
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value, overrideName: true }))}
                readOnly={!form.overrideName}
              />
            </div>

            {/* shortName */}
            <div className={styles.autoField}>
              <div className={styles.autoHeader}>
                <span className={styles.autoKey}>shortName</span>
              </div>
              <input
                className={styles.input}
                value={form.shortName}
                onChange={(e) => setForm((p) => ({ ...p, shortName: e.target.value, overrideName: true }))}
                readOnly={!form.overrideName}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 버튼 */}
      <div className={styles.actions}>
        <button className={styles.cancelBtn} onClick={onCancel}>취소</button>
        <button className={styles.submitBtn} onClick={handleSubmit}>
          {isEdit ? '수정 저장' : '회차 추가'}
        </button>
      </div>
    </div>
  )
}
