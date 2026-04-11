import styles from './BoothListItem.module.css'

const SPEC_COLOR = {
  '성덕':     { bg: '#eef2ff', color: '#4338ca' },
  '청년':     { bg: '#ecfdf5', color: '#065f46' },
  '전문':     { bg: '#fff7ed', color: '#9a3412' },
  '문구청년': { bg: '#f0fdf4', color: '#166534' },
  '문구전문': { bg: '#fef9c3', color: '#854d0e' },
  '코스어성덕': { bg: '#fdf2f8', color: '#9d174d' },
}

export default function BoothListItem({ booth, onClick }) {
  const { name, displayNumber, spec, days, tags, artists } = booth
  const specStyle = SPEC_COLOR[spec] ?? { bg: 'var(--color-bg-subtle)', color: 'var(--color-text-muted)' }

  return (
    <div className={styles.row} onClick={() => onClick(booth)}>

      {/* 부스 번호 */}
      <span className={styles.number}>{displayNumber}</span>

      {/* 요일 */}
      <div className={styles.days}>
        {days.map((d) => (
          <span key={d} className={styles.day}>{d}</span>
        ))}
      </div>

      {/* 규격 */}
      <span
        className={styles.spec}
        style={{ background: specStyle.bg, color: specStyle.color }}
      >
        {spec}
      </span>

      {/* 부스명 */}
      <span className={styles.name}>{name}</span>

      {/* 작가 */}
      <span className={styles.artists}>
        {artists?.length > 0 ? artists.join(', ') : ''}
      </span>

      {/* 태그 */}
      <div className={styles.tags}>
        {tags?.slice(0, 3).map((t) => (
          <span key={t} className={styles.tag}>{t}</span>
        ))}
        {(tags?.length ?? 0) > 3 && (
          <span className={styles.tagMore}>+{tags.length - 3}</span>
        )}
      </div>
    </div>
  )
}
