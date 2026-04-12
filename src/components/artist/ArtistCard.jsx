import { Globe } from 'lucide-react'
import BrandIcon, { getBrandLabel, getBrandColor } from '../common/BrandIcon'
import styles from './ArtistCard.module.css'

function PlatformDot({ platform, url }) {
  const label = getBrandLabel(platform)
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.platformDot}
      title={label}
      onClick={(e) => e.stopPropagation()}
    >
      <BrandIcon platform={platform} size={14} color="currentColor" />
    </a>
  )
}

export default function ArtistCard({ artist, boothEntry, onClick }) {
  const { nickname, avatar, links } = artist
  const topTags  = boothEntry?.topTags  ?? []
  const boothCnt = boothEntry?.boothList?.length ?? 0

  // 이니셜 (한국어는 첫 글자, 영문은 첫 두 글자)
  const initial = nickname.match(/[a-zA-Z]/)
    ? nickname.slice(0, 2).toUpperCase()
    : nickname[0]

  return (
    <article className={styles.card} onClick={() => onClick(artist)}>
      {/* 아바타 */}
      <div className={styles.avatarWrap}>
        {avatar
          ? <img src={avatar} alt={nickname} className={styles.avatar} loading="lazy" />
          : <div className={styles.avatarFallback}>{initial}</div>
        }
      </div>

      {/* 정보 */}
      <div className={styles.body}>
        <p className={styles.nickname}>{nickname}</p>

        {/* 태그 */}
        {topTags.length > 0 && (
          <div className={styles.tags}>
            {topTags.slice(0, 3).map((t) => (
              <span key={t} className={styles.tag}>{t}</span>
            ))}
          </div>
        )}

        {/* 링크 아이콘 행 */}
        {links && Object.keys(links).length > 0 && (
          <div className={styles.platforms}>
            {Object.entries(links).map(([platform, url]) => (
              <PlatformDot key={platform} platform={platform} url={url} />
            ))}
          </div>
        )}

        {/* 참여 부스 수 */}
        {boothCnt > 0 && (
          <p className={styles.boothCount}>{boothCnt}개 부스 참여</p>
        )}
      </div>
    </article>
  )
}
