import styles from './BoothCard.module.css'

const SPEC_COLOR = {
  '성덕':     { bg: '#eef2ff', color: '#4338ca' },
  '청년':     { bg: '#ecfdf5', color: '#065f46' },
  '전문':     { bg: '#fff7ed', color: '#9a3412' },
  '문구청년': { bg: '#f0fdf4', color: '#166534' },
  '문구전문': { bg: '#fef9c3', color: '#854d0e' },
  '코스어성덕': { bg: '#fdf2f8', color: '#9d174d' },
}

export default function BoothCard({ booth, onClick }) {
  const { name, displayNumber, spec, days, tags, infoImage, artists } = booth
  const specStyle = SPEC_COLOR[spec] ?? { bg: 'var(--color-bg-subtle)', color: 'var(--color-text-muted)' }

  return (
    <article className={styles.card} onClick={() => onClick(booth)}>

      {/* 썸네일 */}
      <div className={styles.thumb}>
        {infoImage
          ? <img src={infoImage} alt={name} className={styles.thumbImg} loading="lazy" />
          : <div className={styles.thumbEmpty}>
              <span className={styles.thumbInitial}>{name[0]}</span>
            </div>
        }
        {/* 요일 뱃지 */}
        <div className={styles.dayBadges}>
          {days.map((d) => (
            <span key={d} className={styles.dayBadge}>{d}</span>
          ))}
        </div>
      </div>

      {/* 정보 */}
      <div className={styles.body}>
        <div className={styles.header}>
          <span className={styles.number}>{displayNumber}</span>
          <span className={styles.spec} style={{ background: specStyle.bg, color: specStyle.color }}>
            {spec}
          </span>
        </div>

        <h3 className={styles.name}>{name}</h3>

        {artists?.length > 0 && (
          <p className={styles.artists}>{artists.join(', ')}</p>
        )}

        {tags?.length > 0 && (
          <div className={styles.tags}>
            {tags.slice(0, 4).map((t) => (
              <span key={t} className={styles.tag}>{t}</span>
            ))}
            {tags.length > 4 && (
              <span className={styles.tagMore}>+{tags.length - 4}</span>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
