import { useState } from 'react'
import { Plus, Pencil, Trash2, Download, RefreshCw, Copy, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react'
import dayjs from 'dayjs'
import 'dayjs/locale/ko'
import PageHeader from '../components/common/PageHeader'
import EmptyState from '../components/common/EmptyState'
import EventTypeForm from '../components/admin/EventTypeForm'
import EventEpisodeForm from '../components/admin/EventEpisodeForm'
import { useEventsAdmin } from '../hooks/useEventsAdmin'
import { getEventStatus, getTypeColor, getTypeBgColor } from '../utils/eventUtils'
import styles from './EventAdminPage.module.css'

dayjs.locale('ko')

// 모달 래퍼
function Modal({ onClose, children }) {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

// 삭제 확인 모달
function DeleteConfirm({ label, onConfirm, onCancel }) {
  return (
    <div className={styles.deleteConfirm}>
      <AlertTriangle size={28} className={styles.deleteIcon} />
      <p className={styles.deleteTitle}>정말 삭제하시겠습니까?</p>
      <p className={styles.deleteDesc}>
        <strong>{label}</strong>을(를) 삭제합니다. 이 작업은 JSON을 내보내기 전까지 되돌릴 수 있습니다.
      </p>
      <div className={styles.deleteActions}>
        <button className={styles.cancelBtn2} onClick={onCancel}>취소</button>
        <button className={styles.deleteBtn2} onClick={onConfirm}>삭제</button>
      </div>
    </div>
  )
}

export default function EventAdminPage() {
  const {
    eventTypes, events, loading, error, isDirty,
    addEventType, updateEventType, deleteEventType,
    addEvent, updateEvent, deleteEvent,
    exportJSON, resetToFile,
  } = useEventsAdmin()

  // 모달 상태
  const [modal, setModal] = useState(null)
  // null | { type: 'addType' | 'editType' | 'addEpisode' | 'editEpisode' | 'deleteType' | 'deleteEpisode', data?: any }

  const [typesOpen,    setTypesOpen]    = useState(true)
  const [episodesOpen, setEpisodesOpen] = useState(true)
  const [copied,       setCopied]       = useState(false)
  const [filterType,   setFilterType]   = useState('all')

  const closeModal = () => setModal(null)

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(exportJSON()).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleDownloadJSON = () => {
    const blob = new Blob([exportJSON()], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = 'events.json'; a.click()
    URL.revokeObjectURL(url)
  }

  // 회차 목록 필터
  const filteredEvents = filterType === 'all'
    ? [...events].sort((a, b) => (b.dates?.start ?? '').localeCompare(a.dates?.start ?? ''))
    : [...events]
        .filter((e) => e.type === filterType)
        .sort((a, b) => (b.dates?.start ?? '').localeCompare(a.dates?.start ?? ''))

  if (loading) return (
    <div><PageHeader title="행사 관리" />
      <div className={styles.loading}>데이터 로드 중...</div>
    </div>
  )

  if (error) return (
    <div><PageHeader title="행사 관리" />
      <EmptyState title="데이터를 불러오지 못했습니다" description={error} />
    </div>
  )

  return (
    <div className={styles.page}>
      <PageHeader
        title="행사 관리"
        description="행사 타입(시리즈)과 회차 데이터를 추가·수정·삭제합니다."
      >
        <div className={styles.headerActions}>
          {isDirty && (
            <span className={styles.dirtyBadge}>
              <span className={styles.dirtyDot} />
              미저장 변경사항
            </span>
          )}
          <button className={styles.iconBtn} onClick={handleCopyJSON} title="JSON 복사">
            <Copy size={15} /> {copied ? '복사됨!' : 'JSON 복사'}
          </button>
          <button className={styles.iconBtn} onClick={handleDownloadJSON} title="JSON 내보내기">
            <Download size={15} /> 내보내기
          </button>
          <button className={styles.iconBtnWarn} onClick={() => {
            if (window.confirm('파일 원본으로 초기화하시겠습니까? 임시 변경사항이 모두 사라집니다.')) {
              resetToFile()
            }
          }} title="원본 파일로 초기화">
            <RefreshCw size={15} /> 초기화
          </button>
        </div>
      </PageHeader>

      {/* ── 행사 타입 섹션 ── */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <button className={styles.sectionToggle} onClick={() => setTypesOpen((v) => !v)}>
            <h2 className={styles.sectionTitle}>
              행사 타입 <span className={styles.count}>{Object.keys(eventTypes).length}</span>
            </h2>
            {typesOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button
            className={styles.addBtn}
            onClick={() => setModal({ type: 'addType' })}
          >
            <Plus size={14} /> 타입 추가
          </button>
        </div>

        {typesOpen && (
          Object.keys(eventTypes).length === 0
            ? <EmptyState title="등록된 행사 타입이 없습니다" description="타입 추가 버튼으로 시리즈를 먼저 등록하세요." />
            : (
              <div className={styles.typeGrid}>
                {Object.entries(eventTypes).map(([key, t]) => (
                  <div key={key} className={styles.typeCard}>
                    <div className={styles.typeCardTop}>
                      <div>
                        <p className={styles.typeCardName}>{t.name}</p>
                        <p className={styles.typeCardKey}>{key} · {t.shortName}</p>
                      </div>
                      <div className={styles.cardActions}>
                        <button
                          className={styles.editBtn}
                          onClick={() => setModal({ type: 'editType', data: { key, ...t } })}
                          title="수정"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          className={styles.delBtn}
                          onClick={() => setModal({ type: 'deleteType', data: { key, name: t.name } })}
                          title="삭제"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                    {t.links && (
                      <div className={styles.typeLinks}>
                        {Object.entries(t.links).map(([lk, lv]) => (
                          <a key={lk} href={lv} target="_blank" rel="noopener noreferrer" className={styles.typeLink}>
                            {lk}
                          </a>
                        ))}
                      </div>
                    )}
                    {/* 해당 타입의 회차 수 */}
                    <p className={styles.typeEpCount}>
                      {events.filter((e) => e.type === key).length}개 회차 등록됨
                    </p>
                  </div>
                ))}
              </div>
            )
        )}
      </section>

      {/* ── 회차 섹션 ── */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <button className={styles.sectionToggle} onClick={() => setEpisodesOpen((v) => !v)}>
            <h2 className={styles.sectionTitle}>
              회차 목록 <span className={styles.count}>{events.length}</span>
            </h2>
            {episodesOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <div className={styles.sectionHeadRight}>
            {/* 타입 필터 */}
            <select
              className={styles.filterSelect}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">전체 타입</option>
              {Object.entries(eventTypes).map(([key, t]) => (
                <option key={key} value={key}>{t.name}</option>
              ))}
            </select>
            <button
              className={styles.addBtn}
              onClick={() => setModal({ type: 'addEpisode' })}
              disabled={Object.keys(eventTypes).length === 0}
              title={Object.keys(eventTypes).length === 0 ? '먼저 행사 타입을 추가하세요' : ''}
            >
              <Plus size={14} /> 회차 추가
            </button>
          </div>
        </div>

        {episodesOpen && (
          filteredEvents.length === 0
            ? <EmptyState title="등록된 회차가 없습니다" description="회차 추가 버튼으로 행사를 등록하세요." />
            : (
              <div className={styles.episodeTable}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>상태</th>
                      <th>타입</th>
                      <th>이름</th>
                      <th>날짜</th>
                      <th>장소</th>
                      <th>ID</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEvents.map((ev) => {
                      const status    = getEventStatus(ev.dates?.start, ev.dates?.end)
                      const typeColor = getTypeColor(ev.type)
                      const typeBg    = getTypeBgColor(ev.type)
                      const typeInfo  = eventTypes[ev.type]
                      return (
                        <tr key={ev.id}>
                          <td>
                            <span className={`${styles.statusDot} ${styles[`dot_${status}`]}`} />
                          </td>
                          <td>
                            <span
                              className={styles.typePill}
                              style={{ color: typeColor, background: typeBg }}
                            >
                              {typeInfo?.shortName ?? ev.type}
                            </span>
                          </td>
                          <td className={styles.nameCell}>
                            <span className={styles.evName}>{ev.name}</span>
                            {ev.episode && <span className={styles.evEp}>{ev.episode}회</span>}
                          </td>
                          <td className={styles.dateCell}>
                            {ev.dates?.start}
                            {ev.dates?.start !== ev.dates?.end && ` – ${ev.dates?.end}`}
                          </td>
                          <td className={styles.venueCell}>
                            {ev.city} · {ev.venue}
                          </td>
                          <td>
                            <code className={styles.idCode}>{ev.id}</code>
                          </td>
                          <td>
                            <div className={styles.rowActions}>
                              <button
                                className={styles.editBtn}
                                onClick={() => setModal({ type: 'editEpisode', data: ev })}
                                title="수정"
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                className={styles.delBtn}
                                onClick={() => setModal({ type: 'deleteEpisode', data: { id: ev.id, name: ev.name } })}
                                title="삭제"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )
        )}
      </section>

      {/* ── 모달 ── */}
      {modal && (
        <Modal onClose={closeModal}>

          {modal.type === 'addType' && (
            <EventTypeForm
              existingKeys={Object.keys(eventTypes)}
              onSubmit={(data) => { addEventType(data.key, { name: data.name, shortName: data.shortName, links: data.links }); closeModal() }}
              onCancel={closeModal}
            />
          )}

          {modal.type === 'editType' && (
            <EventTypeForm
              initial={modal.data}
              existingKeys={Object.keys(eventTypes)}
              onSubmit={(data) => { updateEventType(data.key, { name: data.name, shortName: data.shortName, links: data.links }); closeModal() }}
              onCancel={closeModal}
            />
          )}

          {modal.type === 'addEpisode' && (
            <EventEpisodeForm
              eventTypes={eventTypes}
              existingIds={events.map((e) => e.id)}
              onSubmit={(data) => { addEvent(data); closeModal() }}
              onCancel={closeModal}
            />
          )}

          {modal.type === 'editEpisode' && (
            <EventEpisodeForm
              initial={modal.data}
              eventTypes={eventTypes}
              existingIds={events.map((e) => e.id)}
              onSubmit={(data) => { updateEvent(data.id, data); closeModal() }}
              onCancel={closeModal}
            />
          )}

          {modal.type === 'deleteType' && (
            <DeleteConfirm
              label={modal.data.name}
              onConfirm={() => { deleteEventType(modal.data.key); closeModal() }}
              onCancel={closeModal}
            />
          )}

          {modal.type === 'deleteEpisode' && (
            <DeleteConfirm
              label={modal.data.name}
              onConfirm={() => { deleteEvent(modal.data.id); closeModal() }}
              onCancel={closeModal}
            />
          )}

        </Modal>
      )}
    </div>
  )
}
