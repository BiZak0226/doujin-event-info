import { useState, useRef } from 'react'
import {
  Upload, FileJson, FileText, Plus, Download,
  CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronUp,
  Trash2, Copy,
} from 'lucide-react'
import PageHeader from '../components/common/PageHeader'
import { SCHEMAS } from '../constants/schema'
import { parseCSV, parseJSONData, mapCSVToSchema, validateRecord, toCSV, createEmptyRecord } from '../utils/dataUtils'
import styles from './DataImportPage.module.css'

const SCHEMA_OPTIONS = [
  { value: 'booth',  label: '부스 데이터',  desc: 'booths/{eventId}.json' },
  { value: 'event',  label: '행사 데이터',  desc: 'events.json → events[]' },
  { value: 'artist', label: '작가 데이터',  desc: 'artists.json' },
  { value: 'work',   label: '작품 데이터',  desc: 'works.json' },
]

// 검증 결과 아이콘
function StatusIcon({ valid, errors }) {
  if (valid) return <CheckCircle size={16} className={styles.iconOk} />
  if (errors?.length) return <XCircle size={16} className={styles.iconError} />
  return <AlertCircle size={16} className={styles.iconWarn} />
}

export default function DataImportPage() {
  const [schemaKey,    setSchemaKey]    = useState('booth')
  const [tab,          setTab]          = useState('file')   // 'file' | 'manual' | 'paste'
  const [records,      setRecords]      = useState([])
  const [validations,  setValidations]  = useState([])
  const [errorMsg,     setErrorMsg]     = useState('')
  const [outputOpen,   setOutputOpen]   = useState(false)
  const [copied,       setCopied]       = useState(false)
  const fileInputRef   = useRef(null)
  const schema = SCHEMAS[schemaKey]

  // ── 파일 업로드 처리 ──
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setErrorMsg('')

    try {
      const text = await file.text()
      let parsed = []

      if (file.name.endsWith('.json')) {
        parsed = parseJSONData(text)
      } else if (file.name.endsWith('.csv')) {
        const rows = parseCSV(text)
        parsed = mapCSVToSchema(rows, schemaKey)
      } else {
        throw new Error('.json 또는 .csv 파일만 지원합니다.')
      }

      applyRecords(parsed)
    } catch (err) {
      setErrorMsg(err.message)
    }

    // input 초기화 (같은 파일 재업로드 허용)
    e.target.value = ''
  }

  // ── 텍스트 붙여넣기 처리 ──
  const handlePaste = (text, type) => {
    setErrorMsg('')
    try {
      let parsed = []
      if (type === 'json') {
        parsed = parseJSONData(text)
      } else {
        const rows = parseCSV(text)
        parsed = mapCSVToSchema(rows, schemaKey)
      }
      applyRecords(parsed)
    } catch (err) {
      setErrorMsg(err.message)
    }
  }

  // ── 레코드 적용 + 검증 ──
  const applyRecords = (parsed) => {
    const validated = parsed.map((rec) => ({
      ...validateRecord(rec, schemaKey),
    }))
    setRecords(parsed)
    setValidations(validated)
    setOutputOpen(true)
  }

  // ── 빈 레코드 추가 (수동 입력) ──
  const addEmptyRecord = () => {
    const empty = createEmptyRecord(schemaKey)
    setRecords((prev) => [...prev, empty])
    setValidations((prev) => [...prev, { valid: false, errors: ['필수 필드를 입력해주세요.'] }])
  }

  // ── 레코드 필드 변경 ──
  const updateField = (recIdx, key, value) => {
    setRecords((prev) => {
      const next = [...prev]
      next[recIdx] = { ...next[recIdx], [key]: value }
      return next
    })
    setValidations((prev) => {
      const next = [...prev]
      next[recIdx] = validateRecord(records[recIdx], schemaKey)
      return next
    })
  }

  // ── 레코드 삭제 ──
  const deleteRecord = (idx) => {
    setRecords((prev) => prev.filter((_, i) => i !== idx))
    setValidations((prev) => prev.filter((_, i) => i !== idx))
  }

  // ── JSON 출력 복사 ──
  const copyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(records, null, 2)).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  // ── CSV 다운로드 ──
  const downloadCSV = () => {
    const csv = toCSV(records, schemaKey)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = `${schemaKey}_data.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const validCount   = validations.filter((v) => v.valid).length
  const invalidCount = validations.filter((v) => !v.valid).length

  return (
    <div className={styles.page}>
      <PageHeader
        title="데이터 입력"
        description="행사·부스·작가·작품 데이터를 수동 입력하거나 JSON·CSV 파일로 가져옵니다."
      />

      {/* ── 스키마 선택 ── */}
      <div className={styles.schemaBar}>
        {SCHEMA_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            className={`${styles.schemaChip} ${schemaKey === opt.value ? styles.schemaActive : ''}`}
            onClick={() => { setSchemaKey(opt.value); setRecords([]); setValidations([]); setErrorMsg('') }}
          >
            <span>{opt.label}</span>
            <span className={styles.schemaDesc}>{opt.desc}</span>
          </button>
        ))}
      </div>

      {/* ── 입력 방법 탭 ── */}
      <div className={styles.tabBar}>
        {[
          { key: 'file',   label: '파일 업로드', icon: Upload },
          { key: 'paste',  label: '텍스트 붙여넣기', icon: FileText },
          { key: 'manual', label: '직접 입력',    icon: Plus },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            className={`${styles.tab} ${tab === key ? styles.tabActive : ''}`}
            onClick={() => setTab(key)}
          >
            <Icon size={14} strokeWidth={1.75} />
            {label}
          </button>
        ))}
      </div>

      {/* ── 파일 업로드 ── */}
      {tab === 'file' && (
        <div
          className={styles.dropZone}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            const file = e.dataTransfer.files[0]
            if (file) {
              const fakeEvent = { target: { files: [file], value: '' } }
              handleFileChange(fakeEvent)
            }
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.csv"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <Upload size={32} strokeWidth={1.25} className={styles.dropIcon} />
          <p className={styles.dropTitle}>파일을 드래그하거나 클릭해서 선택</p>
          <p className={styles.dropSub}>.json · .csv 지원</p>
        </div>
      )}

      {/* ── 텍스트 붙여넣기 ── */}
      {tab === 'paste' && (
        <PastePanel onApply={handlePaste} />
      )}

      {/* ── 직접 입력 ── */}
      {tab === 'manual' && (
        <div className={styles.manualPanel}>
          <p className={styles.manualDesc}>
            아래 버튼으로 빈 항목을 추가하고 필드를 직접 입력하세요.
            필수 필드: {schema.requiredFields.join(', ')}
          </p>
          <button className={styles.addBtn} onClick={addEmptyRecord}>
            <Plus size={15} /> 항목 추가
          </button>
        </div>
      )}

      {/* ── 오류 메시지 ── */}
      {errorMsg && (
        <div className={styles.errorBanner}>
          <XCircle size={15} />
          {errorMsg}
        </div>
      )}

      {/* ── 레코드 목록 ── */}
      {records.length > 0 && (
        <section className={styles.resultSection}>
          <div className={styles.resultHeader}>
            <div className={styles.resultStats}>
              <span className={styles.statTotal}>{records.length}개 항목</span>
              {validCount > 0   && <span className={styles.statOk}><CheckCircle size={13} /> {validCount}개 유효</span>}
              {invalidCount > 0 && <span className={styles.statErr}><XCircle size={13} /> {invalidCount}개 오류</span>}
            </div>
            <div className={styles.resultActions}>
              <button className={styles.actionBtn} onClick={copyJSON}>
                <Copy size={13} /> {copied ? '복사됨!' : 'JSON 복사'}
              </button>
              <button className={styles.actionBtn} onClick={downloadCSV}>
                <Download size={13} /> CSV 내보내기
              </button>
            </div>
          </div>

          {/* 레코드 테이블 */}
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.thStatus}></th>
                  {schema.fields
                    .filter((f) => !['infoImage', 'infoImages', 'goods'].includes(f.key))
                    .map((f) => (
                      <th key={f.key} className={styles.th}>{f.label}</th>
                    ))}
                  <th className={styles.thAction}></th>
                </tr>
              </thead>
              <tbody>
                {records.map((rec, ri) => {
                  const v = validations[ri]
                  return (
                    <tr key={ri} className={v?.valid ? '' : styles.rowInvalid}>
                      <td className={styles.tdStatus}>
                        <StatusIcon valid={v?.valid} errors={v?.errors} />
                      </td>
                      {schema.fields
                        .filter((f) => !['infoImage', 'infoImages', 'goods'].includes(f.key))
                        .map((field) => (
                          <td key={field.key} className={styles.td}>
                            {tab === 'manual' ? (
                              <FieldInput
                                field={field}
                                value={rec[field.key]}
                                onChange={(v) => updateField(ri, field.key, v)}
                              />
                            ) : (
                              <span className={styles.cellValue}>
                                {formatCellValue(rec[field.key])}
                              </span>
                            )}
                          </td>
                        ))}
                      <td className={styles.tdAction}>
                        <button
                          className={styles.deleteBtn}
                          onClick={() => deleteRecord(ri)}
                          aria-label="삭제"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* JSON 미리보기 */}
          <button
            className={styles.outputToggle}
            onClick={() => setOutputOpen((v) => !v)}
          >
            <FileJson size={14} />
            JSON 미리보기
            {outputOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {outputOpen && (
            <pre className={styles.jsonPreview}>
              {JSON.stringify(records, null, 2)}
            </pre>
          )}
        </section>
      )}

      {/* ── 필드 레퍼런스 ── */}
      <FieldReference schema={schema} schemaKey={schemaKey} />
    </div>
  )
}

// ── 텍스트 붙여넣기 패널 ──
function PastePanel({ onApply }) {
  const [text, setText] = useState('')
  const [type, setType] = useState('json')

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        {['json', 'csv'].map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            style={{
              padding: '4px 12px',
              borderRadius: '6px',
              border: '1px solid var(--color-border)',
              background: type === t ? 'var(--color-accent)' : 'var(--color-bg-elevated)',
              color: type === t ? '#fff' : 'var(--color-text-secondary)',
              fontSize: 'var(--text-sm)',
              cursor: 'pointer',
            }}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>
      <textarea
        className={undefined}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={type === 'json'
          ? '[{"id": "...", "name": "..."}]'
          : 'id,name,spec,days\nda-01,부스명,성덕,토|일'
        }
        style={{
          width: '100%',
          height: '160px',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid var(--color-border)',
          background: 'var(--color-bg-elevated)',
          fontFamily: 'var(--font-mono)',
          fontSize: '13px',
          color: 'var(--color-text-primary)',
          resize: 'vertical',
          outline: 'none',
          marginBottom: '8px',
        }}
      />
      <button
        onClick={() => onApply(text, type)}
        style={{
          padding: '8px 20px',
          borderRadius: '8px',
          background: 'var(--color-accent)',
          color: '#fff',
          fontSize: 'var(--text-sm)',
          fontWeight: '500',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        적용
      </button>
    </div>
  )
}

// ── 필드 입력 위젯 ──
function FieldInput({ field, value, onChange }) {
  if (field.options) {
    return (
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        style={{ fontSize: '12px', width: '100%', padding: '2px 4px', border: '1px solid var(--color-border)', borderRadius: '4px', background: 'var(--color-bg-elevated)', color: 'var(--color-text-primary)' }}
      >
        <option value="">선택</option>
        {field.options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    )
  }
  if (field.type === 'array') {
    return (
      <input
        type="text"
        value={Array.isArray(value) ? value.join('|') : value ?? ''}
        onChange={(e) => onChange(e.target.value.split('|').map(s => s.trim()))}
        placeholder="값1|값2"
        style={{ fontSize: '12px', width: '100%', padding: '2px 4px', border: '1px solid var(--color-border)', borderRadius: '4px', background: 'var(--color-bg-elevated)', color: 'var(--color-text-primary)' }}
      />
    )
  }
  return (
    <input
      type={field.type === 'number' ? 'number' : 'text'}
      value={value ?? ''}
      onChange={(e) => onChange(field.type === 'number' ? Number(e.target.value) : e.target.value)}
      style={{ fontSize: '12px', width: '100%', padding: '2px 4px', border: '1px solid var(--color-border)', borderRadius: '4px', background: 'var(--color-bg-elevated)', color: 'var(--color-text-primary)' }}
    />
  )
}

// ── 셀 값 포맷 ──
function formatCellValue(val) {
  if (val === null || val === undefined || val === '') return <span style={{ color: 'var(--color-text-muted)' }}>—</span>
  if (Array.isArray(val)) {
    if (val.length === 0) return <span style={{ color: 'var(--color-text-muted)' }}>—</span>
    return val.join(', ')
  }
  if (typeof val === 'object') return JSON.stringify(val)
  return String(val)
}

// ── 필드 레퍼런스 패널 ──
function FieldReference({ schema, schemaKey }) {
  const [open, setOpen] = useState(false)

  return (
    <section>
      <button className={styles.outputToggle} onClick={() => setOpen((v) => !v)}>
        <FileText size={14} />
        필드 레퍼런스
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {open && (
        <div className={styles.referenceTable}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>키</th>
                <th className={styles.th}>이름</th>
                <th className={styles.th}>타입</th>
                <th className={styles.th}>필수</th>
                <th className={styles.th}>값 목록</th>
                <th className={styles.th}>설명</th>
              </tr>
            </thead>
            <tbody>
              {schema.fields.map((f) => (
                <tr key={f.key}>
                  <td className={styles.td}><code className={styles.code}>{f.key}</code></td>
                  <td className={styles.td}>{f.label}</td>
                  <td className={styles.td}><span className={styles.typePill}>{f.type}</span></td>
                  <td className={styles.td}>{schema.requiredFields.includes(f.key) ? <span className={styles.reqBadge}>필수</span> : <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>선택</span>}</td>
                  <td className={styles.td}>
                    {f.options ? (
                      <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                        {f.options.join(' / ')}
                      </span>
                    ) : '—'}
                  </td>
                  <td className={styles.td} style={{ fontSize: '12px', color: 'var(--color-text-secondary)', maxWidth: '280px' }}>{f.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
