import { X, ExternalLink, Store } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import BrandIcon, { getBrandColor, getBrandLabel } from '../common/BrandIcon'
import styles from './ArtistDetailModal.module.css'

function LinkTreeItem({ platform, url }) {
  const label   = getBrandLabel(platform)
  const bgColor = getBrandColor(platform)

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.linkItem}
    >
      <span
        className={styles.linkIcon}
        style={{ background: bgColor, color: '#fff' }}
      >
        <BrandIcon platform={platform} size={16} color="#fff" />
      </span>
      <span className={styles.linkLabel}>{label}</span>
      <ExternalLink size={13} className={styles.linkExtIcon} />
    </a>
  )
}

export default function ArtistDetailModal({ artist, boothEntry, onClose }) {
  const navigate = useNavigate()
  if (!artist) return null

  const { nickname, avatar, bio, links } = artist
  const topTags  = boothEntry?.topTags  ?? []
  const boothList = boothEntry?.boothList ?? []

  const initial = nickname.match(/[a-zA-Z]/)
    ? nickname.slice(0, 2).toUpperCase()
    : nickname[0]

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

        {/* 닫기 */}
        <button className={styles.closeBtn} onClick={onClose} aria-label="닫기">
          <X size={18} />
        </button>

        {/* 프로필 헤더 */}
        <div className={styles.profileHeader}>
          <div className={styles.avatarWrap}>
            {avatar
              ? <img src={avatar} alt={nickname} className={styles.avatar} />
              : <div className={styles.avatarFallback}>{initial}</div>
            }
          </div>
          <h2 className={styles.nickname}>{nickname}</h2>
          {bio?.trim() && (
            <p className={styles.bio}>{bio}</p>
          )}
        </div>

        <div className={styles.content}>

          {/* 링크트리 */}
          {links && Object.keys(links).length > 0 && (
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>링크</h3>
              <div className={styles.linkList}>
                {Object.entries(links).map(([platform, url]) => (
                  <LinkTreeItem key={platform} platform={platform} url={url} />
                ))}
              </div>
            </section>
          )}

          {/* 주요 장르 */}
          {topTags.length > 0 && (
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>주요 장르 · 작품</h3>
              <div className={styles.tagList}>
                {topTags.map((t, i) => (
                  <span key={t} className={`${styles.tag} ${i === 0 ? styles.tagTop : ''}`}>
                    {t}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* 참여 부스 */}
          {boothList.length > 0 && (
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>참여 부스 ({boothList.length})</h3>
              <div className={styles.boothList}>
                {boothList.map((b) => (
                  <button
                    key={b.boothId}
                    className={styles.boothItem}
                    onClick={() => {
                      if (b.eventId) {
                        navigate(`/booths/${b.eventId}`)
                        onClose()
                      }
                    }}
                  >
                    <Store size={13} strokeWidth={1.75} className={styles.boothIcon} />
                    <div className={styles.boothInfo}>
                      <span className={styles.boothName}>{b.boothName}</span>
                      <span className={styles.boothNumber}>{b.displayNumber}</span>
                    </div>
                    {b.eventId && (
                      <ExternalLink size={12} className={styles.boothArrow} />
                    )}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* 참여 정보 없음 */}
          {topTags.length === 0 && boothList.length === 0 && (
            <p className={styles.noData}>참여 부스 정보가 아직 없습니다.</p>
          )}

        </div>
      </div>
    </div>
  )
}
