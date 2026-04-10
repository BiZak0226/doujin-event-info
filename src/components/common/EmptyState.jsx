import styles from './EmptyState.module.css'

export default function EmptyState({ icon, title, description, children }) {
  return (
    <div className={styles.wrapper}>
      {icon && <div className={styles.icon}>{icon}</div>}
      <p className={styles.title}>{title}</p>
      {description && (
        <p className={styles.description}>{description}</p>
      )}
      {children}
    </div>
  )
}
