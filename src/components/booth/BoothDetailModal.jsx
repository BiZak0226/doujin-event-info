import { X, ExternalLink, CreditCard, Twitter, Globe, Users, Hash } from 'lucide-react'
import styles from './BoothDetailModal.module.css'

const SPEC_COLOR = {
  '성덕':     { bg: '#eef2ff', color: '#4338ca' },
  '청년':     { bg: '#ecfdf5', color: '#065f46' },
  '전문':     { bg: '#fff7ed', color: '#9a3412' },
  '문구청년': { bg: '#f0fdf4', color: '#166534' },
  '문구전문': { bg: '#fef9c3', color: '#854d0e' },
  '코스어성덕': { bg: '#fdf2f8', color: '#9d174d' },
}

const LINK_META = {
  payment:   { label: '사전 주문 / 결제',  icon: CreditCard },
  official:  { label: '공식 페이지',        icon: Globe },
  twitter:   { label: 'Twitter / X',        icon: Twitter },
  community: { label: '커뮤니티',           icon: Users },
  other:     { label: '링크',               icon: ExternalLink },
}

function LinkButton({ link }) {
  const meta = LINK_META[link.type] ?? LINK_META.other
  const Icon = meta.icon
  const label = link.label?.trim() || meta.label

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.linkBtn}
      data-type={link.type}
    >
      <Icon size={14} strokeWidth={1.75} />
      <span>{label}</span>
      <ExternalLink size={11} className={styles.extIcon} />
    </a>
  )
}

export default function BoothDetailModal({ booth, onClose }) {
  if (!booth) return null

  const {
    name, displayNumber, numbers, spec, days,
    description, artists, tags, links,
    infoImage, infoImages, goods,
  } = booth

  const specStyle = SPEC_COLOR[spec] ?? { bg: 'var(--color-bg-subtle)', color: 'var(--color-text-muted)' }
  const images = infoImages?.length ? infoImages : (infoImage ? [infoImage] : [])

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

        {/* 닫기 버튼 */}
        <button className={styles.closeBtn} onClick={onClose} aria-label="닫기">
          <X size={18} />
        </button>

        {/* 이미지 슬라이더 */}
        {images.length > 0 && (
          <div className={styles.imageArea}>
            <div className={styles.imageScroll}>
              {images.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`${name} 이미지 ${i + 1}`}
                  className={styles.image}
                  loading="lazy"
                />
              ))}
            </div>
          </div>
        )}

        <div className={styles.content}>

          {/* 헤더 */}
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <div className={styles.metaRow}>
                <span className={styles.number}>{displayNumber}</span>
                <div className={styles.dayBadges}>
                  {days.map((d) => (
                    <span key={d} className={styles.dayBadge}>{d}요일</span>
                  ))}
                </div>
                <span
                  className={styles.spec}
                  style={{ background: specStyle.bg, color: specStyle.color }}
                >
                  {spec}
                </span>
              </div>
              <h2 className={styles.name}>{name}</h2>
              {artists?.length > 0 && (
                <p className={styles.artists}>
                  <Users size={13} strokeWidth={1.75} />
                  {artists.join(', ')}
                </p>
              )}
            </div>
          </div>

          {/* 소개 */}
          {description?.trim() && (
            <p className={styles.description}>{description}</p>
          )}

          {/* 링크 */}
          {links?.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>링크</h3>
              <div className={styles.linkList}>
                {links.map((l, i) => <LinkButton key={i} link={l} />)}
              </div>
            </div>
          )}

          {/* 태그 */}
          {tags?.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <Hash size={13} strokeWidth={1.75} />
                장르 · 작품
              </h3>
              <div className={styles.tagList}>
                {tags.map((t) => (
                  <span key={t} className={styles.tag}>{t}</span>
                ))}
              </div>
            </div>
          )}

          {/* 부스 번호 전체 (여러 칸인 경우) */}
          {numbers.length > 1 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>배정 부스 번호</h3>
              <div className={styles.numberList}>
                {numbers.map((n) => (
                  <span key={n} className={styles.numberChip}>{n}</span>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
