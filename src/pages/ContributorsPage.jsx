import { Globe, Mail, Heart } from 'lucide-react'
import BrandIcon, { getBrandLabel } from '../components/common/BrandIcon'
import PageHeader from '../components/common/PageHeader'
import styles from './ContributorsPage.module.css'

/**
 * 개발자·기여자 데이터
 * 추후 contributors.json으로 분리 가능
 */
const DEVELOPERS = [
  {
    id: 'dev-1',
    nickname: '개발자 닉네임',
    role: '개발 · 디자인',
    bio: '사이트 기획 및 개발',
    avatar: '',
    links: {
      github:  '',
      twitter: '',
      email:   '',
    },
  },
]

const CONTRIBUTORS = [
  // 데이터 기여자 목록
  // { id: '', nickname: '', role: '데이터 수집', links: { twitter: '' } },
]

// email·website은 BrandIcon이 없으므로 별도 처리
const NON_BRAND_LINKS = {
  website: { icon: Globe, label: '웹사이트',  isEmail: false },
  email:   { icon: Mail,  label: '이메일',    isEmail: true },
}

function PersonCard({ person }) {
  const initial = person.nickname.match(/[a-zA-Z]/)
    ? person.nickname.slice(0, 2).toUpperCase()
    : person.nickname[0]

  const activeLinks = Object.entries(person.links ?? {}).filter(([, v]) => v)

  return (
    <div className={styles.personCard}>
      {/* 아바타 */}
      <div className={styles.avatarWrap}>
        {person.avatar
          ? <img src={person.avatar} alt={person.nickname} className={styles.avatar} />
          : <div className={styles.avatarFallback}>{initial}</div>
        }
      </div>

      {/* 정보 */}
      <div className={styles.personBody}>
        <p className={styles.personNickname}>{person.nickname}</p>
        <p className={styles.personRole}>{person.role}</p>
        {person.bio && (
          <p className={styles.personBio}>{person.bio}</p>
        )}

        {/* 링크 */}
        {activeLinks.length > 0 && (
          <div className={styles.personLinks}>
            {activeLinks.map(([platform, value]) => {
              const nonBrand = NON_BRAND_LINKS[platform]
              const href  = nonBrand?.isEmail ? `mailto:${value}` : value
              const label = nonBrand?.label ?? getBrandLabel(platform)
              const Icon  = nonBrand?.icon
              return (
                <a
                  key={platform}
                  href={href}
                  target={nonBrand?.isEmail ? undefined : '_blank'}
                  rel="noopener noreferrer"
                  className={styles.personLink}
                  title={label}
                >
                  {nonBrand
                    ? <Icon size={15} strokeWidth={1.75} />
                    : <BrandIcon platform={platform} size={15} color="currentColor" />
                  }
                </a>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ContributorsPage() {
  return (
    <div className={styles.page}>
      <PageHeader
        title="기여자"
        description="이 사이트를 만들고 데이터를 기여해주신 분들입니다."
      />

      {/* 개발자 섹션 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>개발</h2>
        <div className={styles.cardGrid}>
          {DEVELOPERS.map((dev) => (
            <PersonCard key={dev.id} person={dev} />
          ))}
        </div>
      </section>

      {/* 기여자 섹션 */}
      {CONTRIBUTORS.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>데이터 기여</h2>
          <div className={styles.cardGrid}>
            {CONTRIBUTORS.map((c) => (
              <PersonCard key={c.id} person={c} />
            ))}
          </div>
        </section>
      )}

      {/* 오픈소스 고지 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>사용 기술</h2>
        <div className={styles.techGrid}>
          {[
            { name: 'React',        desc: 'UI 라이브러리' },
            { name: 'Vite',         desc: '빌드 도구' },
            { name: 'React Router', desc: '라우팅' },
            { name: 'dayjs',        desc: '날짜 처리' },
            { name: 'lucide-react', desc: '아이콘' },
            { name: 'Pretendard',   desc: '서체' },
          ].map((t) => (
            <div key={t.name} className={styles.techItem}>
              <span className={styles.techName}>{t.name}</span>
              <span className={styles.techDesc}>{t.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 하단 감사 문구 */}
      <div className={styles.footer}>
        <Heart size={14} className={styles.footerHeart} />
        <p className={styles.footerText}>
          데이터를 기여해주신 모든 분들과 피드백을 주신 분들께 감사드립니다.
        </p>
      </div>
    </div>
  )
}
