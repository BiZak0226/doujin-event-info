import { toPercent } from '../../utils/statsUtils'
import styles from './StatCard.module.css'

/** 기본 카드 래퍼 */
export function StatCard({ title, desc, children, fullWidth }) {
  return (
    <div className={`${styles.card} ${fullWidth ? styles.full : ''}`}>
      <div className={styles.cardHead}>
        <h3 className={styles.cardTitle}>{title}</h3>
        {desc && <p className={styles.cardDesc}>{desc}</p>}
      </div>
      <div className={styles.cardBody}>{children}</div>
    </div>
  )
}

/** 숫자 요약 카드 */
export function MetricCard({ label, value, sub }) {
  return (
    <div className={styles.metric}>
      <p className={styles.metricLabel}>{label}</p>
      <p className={styles.metricValue}>{value}</p>
      {sub && <p className={styles.metricSub}>{sub}</p>}
    </div>
  )
}

/** 가로 바 차트 (순위형) */
export function HBarChart({ data, maxItems, colorVar = '--color-accent' }) {
  const items = maxItems ? data.slice(0, maxItems) : data
  const maxCount = items[0]?.count ?? 1

  return (
    <div className={styles.hbar}>
      {items.map(({ key, count, ratio }) => (
        <div key={key} className={styles.hbarRow}>
          <span className={styles.hbarLabel} title={key}>{key}</span>
          <div className={styles.hbarTrack}>
            <div
              className={styles.hbarFill}
              style={{
                width: `${(count / maxCount) * 100}%`,
                background: `var(${colorVar})`,
              }}
            />
          </div>
          <span className={styles.hbarValue}>{count}</span>
        </div>
      ))}
    </div>
  )
}

/** 세로 바 차트 (연도/월별 추이) */
export function VBarChart({ data, colorVar = '--color-accent' }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1)

  return (
    <div className={styles.vbar}>
      {data.map(({ key, count }) => (
        <div key={key} className={styles.vbarCol}>
          <span className={styles.vbarCount}>{count > 0 ? count : ''}</span>
          <div className={styles.vbarTrack}>
            <div
              className={styles.vbarFill}
              style={{
                height: `${(count / maxCount) * 100}%`,
                background: `var(${colorVar})`,
              }}
            />
          </div>
          <span className={styles.vbarLabel}>{key}</span>
        </div>
      ))}
    </div>
  )
}

/** 도넛 차트 (SVG) */
export function DonutChart({ data, colors, size = 140 }) {
  const r      = 50
  const cx     = 60
  const cy     = 60
  const stroke = 18
  const circ   = 2 * Math.PI * r

  let offset = 0
  const total = data.reduce((s, d) => s + d.count, 0)

  const segments = data.map((d, i) => {
    const pct  = d.count / total
    const dash = pct * circ
    const seg  = { ...d, dash, gap: circ - dash, offset, color: colors[i % colors.length] }
    offset += dash
    return seg
  })

  return (
    <div className={styles.donut}>
      <svg viewBox="0 0 120 120" width={size} height={size} className={styles.donutSvg}>
        {/* 배경 트랙 */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="var(--color-bg-subtle)"
          strokeWidth={stroke}
        />
        {/* 세그먼트 */}
        {segments.map((seg, i) => (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth={stroke}
            strokeDasharray={`${seg.dash} ${seg.gap}`}
            strokeDashoffset={-seg.offset}
            strokeLinecap="butt"
            transform="rotate(-90, 60, 60)"
          />
        ))}
      </svg>
      <div className={styles.donutLegend}>
        {data.map((d, i) => (
          <div key={d.key} className={styles.donutLegendRow}>
            <span className={styles.donutDot} style={{ background: colors[i % colors.length] }} />
            <span className={styles.donutLegendKey}>{d.key}</span>
            <span className={styles.donutLegendVal}>{toPercent(d.ratio)}</span>
            <span className={styles.donutLegendCount}>({d.count})</span>
          </div>
        ))}
      </div>
    </div>
  )
}
