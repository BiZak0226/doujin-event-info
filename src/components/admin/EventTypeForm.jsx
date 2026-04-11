import { useState, useEffect } from 'react'
import { Plus, Trash2, Globe, X, Hash, Cloud } from 'lucide-react'
import styles from './EventForm.module.css'

const LINK_TYPES = [
  { key: 'homepage', label: '공식 홈페이지', icon: Globe,   placeholder: 'https://...' },
  { key: 'twitter',  label: 'Twitter / X',  icon: X, placeholder: 'https://x.com/...' },
  { key: 'bluesky',  label: 'Bluesky',      icon: Cloud,   placeholder: 'https://bsky.app/...' },
  { key: 'gall',     label: 'DC 갤러리',    icon: Hash,    placeholder: 'https://gall.dcinside.com/...' },
]

const EMPTY = {
  key:       '',
  name:      '',
  shortName: '',
  links: { homepage: '', twitter: '', bluesky: '', gall: '' },
}

export default function EventTypeForm({ initial, existingKeys = [], onSubmit, onCancel }) {
  const isEdit = !!initial
  const [form, setForm]     = useState(EMPTY)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (initial) {
      setForm({
        key:       initial.key ?? '',
        name:      initial.name ?? '',
        shortName: initial.shortName ?? '',
        links: {
          homepage: initial.links?.homepage ?? '',
          twitter:  initial.links?.twitter  ?? '',
          bluesky:  initial.links?.bluesky  ?? '',
          gall:     initial.links?.gall     ?? '',
        },
      })
    }
  }, [initial])

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const setLink = (key, value) => {
    setForm((prev) => ({ ...prev, links: { ...prev.links, [key]: value } }))
  }

  const validate = () => {
    const e = {}
    if (!form.key.trim())       e.key       = 'ID는 필수입니다.'
    if (!form.name.trim())      e.name      = '이름은 필수입니다.'
    if (!form.shortName.trim()) e.shortName = '약칭은 필수입니다.'
    if (!isEdit && existingKeys.includes(form.key.trim())) {
      e.key = '이미 존재하는 ID입니다.'
    }
    // key는 영문+숫자+언더스코어만
    if (form.key && !/^[a-z0-9_]+$/.test(form.key)) {
      e.key = '영문 소문자, 숫자, 언더스코어(_)만 사용 가능합니다.'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    const links = {}
    Object.entries(form.links).forEach(([k, v]) => {
      if (v.trim()) links[k] = v.trim()
    })
    onSubmit({
      key:       form.key.trim(),
      name:      form.name.trim(),
      shortName: form.shortName.trim(),
      links,
    })
  }

  return (
    <div className={styles.form}>
      <h2 className={styles.formTitle}>
        {isEdit ? '행사 타입 수정' : '행사 타입 추가'}
      </h2>
      <p className={styles.formDesc}>
        코믹월드, 일러스타 페스처럼 반복 개최되는 행사 시리즈를 등록합니다.
      </p>

      <div className={styles.fieldGroup}>

        {/* ID */}
        <div className={styles.field}>
          <label className={styles.label}>
            행사 타입 ID <span className={styles.req}>*</span>
          </label>
          <input
            className={`${styles.input} ${errors.key ? styles.inputError : ''}`}
            value={form.key}
            onChange={(e) => set('key', e.target.value.toLowerCase())}
            placeholder="예: comicworld / illustarfes / comiverse"
            disabled={isEdit}
          />
          {errors.key
            ? <p className={styles.errorMsg}>{errors.key}</p>
            : <p className={styles.hint}>영문 소문자, 숫자, 언더스코어만 사용. 회차 데이터의 type 필드와 일치해야 합니다.</p>
          }
        </div>

        {/* 이름 + 약칭 */}
        <div className={styles.row2}>
          <div className={styles.field}>
            <label className={styles.label}>
              행사 이름 <span className={styles.req}>*</span>
            </label>
            <input
              className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="예: 코믹월드"
            />
            {errors.name && <p className={styles.errorMsg}>{errors.name}</p>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              약칭 <span className={styles.req}>*</span>
            </label>
            <input
              className={`${styles.input} ${errors.shortName ? styles.inputError : ''}`}
              value={form.shortName}
              onChange={(e) => set('shortName', e.target.value)}
              placeholder="예: CW"
            />
            {errors.shortName && <p className={styles.errorMsg}>{errors.shortName}</p>}
          </div>
        </div>

        {/* 링크 */}
        <div className={styles.field}>
          <label className={styles.label}>공식 링크</label>
          <div className={styles.linkGroup}>
            {LINK_TYPES.map(({ key, label, icon: Icon, placeholder }) => (
              <div key={key} className={styles.linkRow}>
                <span className={styles.linkIcon}><Icon size={14} strokeWidth={1.75} /></span>
                <span className={styles.linkLabel}>{label}</span>
                <input
                  className={styles.linkInput}
                  value={form.links[key] ?? ''}
                  onChange={(e) => setLink(key, e.target.value)}
                  placeholder={placeholder}
                  type="url"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 버튼 */}
      <div className={styles.actions}>
        <button className={styles.cancelBtn} onClick={onCancel}>취소</button>
        <button className={styles.submitBtn} onClick={handleSubmit}>
          {isEdit ? '수정 저장' : '추가'}
        </button>
      </div>
    </div>
  )
}
