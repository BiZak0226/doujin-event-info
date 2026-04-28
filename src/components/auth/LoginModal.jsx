import { X } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth.jsx'
import BrandIcon from '../common/BrandIcon'
import styles from './LoginModal.module.css'

export default function LoginModal({ onClose }) {
  const { signInWithGoogle } = useAuth()

  const handleLogin = async () => {
    await signInWithGoogle()
    onClose()
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

        {/* 닫기 */}
        <button className={styles.closeBtn} onClick={onClose} aria-label="닫기">
          <X size={18} />
        </button>

        {/* 헤더 */}
        <div className={styles.header}>
          <span className={styles.logoMark}>◈</span>
          <h2 className={styles.title}>로그인</h2>
          <p className={styles.desc}>
            로그인하면 즐겨찾기, 행사 플래너 등<br />
            개인화 기능을 사용할 수 있습니다.
          </p>
        </div>

        {/* 구글 로그인 버튼 */}
        <div className={styles.body}>
          <button className={styles.googleBtn} onClick={handleLogin}>
            <BrandIcon platform="google" size={18} color="currentColor" />
            Google로 계속하기
          </button>
        </div>

        {/* 하단 안내 */}
        <p className={styles.notice}>
          로그인 시 서비스 이용약관 및 개인정보 처리방침에 동의하게 됩니다.
        </p>

      </div>
    </div>
  )
}
