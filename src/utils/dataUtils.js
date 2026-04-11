import { SCHEMAS } from '../constants/schema'

/**
 * CSV 텍스트 → 객체 배열 파싱
 * 헤더 행 필수. 구분자: 쉼표(,)
 */
export function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length < 2) throw new Error('CSV에 헤더와 데이터가 모두 필요합니다.')

  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''))

  return lines.slice(1).map((line, i) => {
    // 따옴표 안 쉼표 처리
    const values = line.match(/(".*?"|[^,]+)(?=,|$)/g) ?? []
    if (values.length === 0) return null

    const obj = {}
    headers.forEach((h, idx) => {
      obj[h] = (values[idx] ?? '').trim().replace(/^"|"$/g, '')
    })
    return obj
  }).filter(Boolean)
}

/**
 * CSV 행 배열 → 스키마 매핑 적용한 도메인 객체 배열
 * @param {object[]} rows  - parseCSV 결과
 * @param {string}   schemaKey - SCHEMAS 키 ('event' | 'booth' | 'artist' | 'work')
 */
export function mapCSVToSchema(rows, schemaKey) {
  const schema = SCHEMAS[schemaKey]
  if (!schema) throw new Error(`알 수 없는 스키마: ${schemaKey}`)

  return rows.map((row) => {
    const obj = {}
    schema.csvColumns.forEach(({ csvHeader, field, transform }) => {
      const raw = row[csvHeader]
      if (raw === undefined) return
      const value = transform ? transform(raw) : raw
      setNested(obj, field, value)
    })
    return obj
  })
}

/**
 * 중첩 경로(dot notation)로 객체에 값 설정
 * 예: setNested(obj, 'links.twitter', 'url')
 */
export function setNested(obj, path, value) {
  const keys = path.split('.')
  let cur = obj
  keys.forEach((k, i) => {
    if (i === keys.length - 1) {
      cur[k] = value
    } else {
      if (!cur[k] || typeof cur[k] !== 'object') cur[k] = {}
      cur = cur[k]
    }
  })
}

/**
 * 스키마 기준 필수 필드 검증
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateRecord(record, schemaKey) {
  const schema = SCHEMAS[schemaKey]
  if (!schema) return { valid: false, errors: [`알 수 없는 스키마: ${schemaKey}`] }

  const errors = []
  schema.requiredFields.forEach((key) => {
    const val = key.includes('.') ? getNested(record, key) : record[key]
    if (val === undefined || val === null || val === '') {
      const fieldDef = schema.fields.find((f) => f.key === key)
      errors.push(`필수 필드 누락: ${fieldDef?.label ?? key}`)
    }
  })

  return { valid: errors.length === 0, errors }
}

/**
 * dot notation으로 중첩 값 읽기
 */
export function getNested(obj, path) {
  return path.split('.').reduce((cur, k) => cur?.[k], obj)
}

/**
 * JSON 텍스트 파싱 + 배열 여부 확인
 * @returns {object[]}
 */
export function parseJSONData(text) {
  const parsed = JSON.parse(text)
  if (Array.isArray(parsed)) return parsed
  // events.json처럼 { events: [...] } 구조
  if (parsed.events && Array.isArray(parsed.events)) return parsed.events
  if (parsed.booths && Array.isArray(parsed.booths)) return parsed.booths
  // 단일 객체면 배열로 감싸기
  if (typeof parsed === 'object') return [parsed]
  throw new Error('파싱할 수 없는 JSON 구조입니다.')
}

/**
 * 객체 배열 → CSV 문자열 변환 (다운로드용)
 */
export function toCSV(records, schemaKey) {
  const schema = SCHEMAS[schemaKey]
  if (!schema || !records.length) return ''

  const headers = schema.csvColumns.map((c) => c.csvHeader)
  const rows = records.map((rec) =>
    schema.csvColumns.map(({ csvHeader, field }) => {
      const val = getNested(rec, field) ?? rec[csvHeader] ?? ''
      const str = Array.isArray(val) ? val.join('|') : String(val)
      return str.includes(',') ? `"${str}"` : str
    })
  )

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
}

/**
 * 빈 레코드 템플릿 생성
 */
export function createEmptyRecord(schemaKey) {
  const schema = SCHEMAS[schemaKey]
  if (!schema) return {}

  const rec = {}
  schema.fields.forEach(({ key, type }) => {
    if (type === 'array')  rec[key] = []
    else if (type === 'object') rec[key] = {}
    else if (type === 'number') rec[key] = null
    else if (type === 'boolean') rec[key] = false
    else rec[key] = ''
  })
  return rec
}
