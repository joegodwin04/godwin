// AddTaskModal.jsx — Premium slide-up modal
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import { PRIORITIES, CATEGORIES } from '../hooks/useTodos'
import styles from './AddTaskModal.module.css'

const today = () => new Date().toISOString().split('T')[0]

export default function AddTaskModal({ isOpen, onClose, onAdd }) {
  const [text, setText] = useState('')
  const [priority, setPriority] = useState('medium')
  const [category, setCategory] = useState('other')
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')
  const [shake, setShake] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 150)
    else { setText(''); setNotes(''); setDueDate(''); setPriority('medium'); setCategory('other') }
  }, [isOpen])

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!text.trim()) { setShake(true); setTimeout(() => setShake(false), 500); return }
    onAdd({ text, priority, category, dueDate: dueDate || null, notes })
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            role="dialog"
            aria-modal="true"
            aria-label="Add new task"
          >
            {/* Header */}
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                <div className={styles.modalIcon}>✨</div>
                <div>
                  <h2 className={styles.modalHeading}>New Task</h2>
                  <p className={styles.modalSub}>What do you need to accomplish?</p>
                </div>
              </div>
              <motion.button
                className={styles.closeBtn}
                onClick={onClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Close modal"
              >
                <svg viewBox="0 0 20 20" fill="none" width="14" height="14">
                  <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </motion.button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              {/* Main input */}
              <motion.div
                className={`${styles.inputWrap} ${shake ? styles.shake : ''}`}
                animate={shake ? { x: [-8, 8, -6, 6, 0] } : {}}
                transition={{ duration: 0.4 }}
              >
                <input
                  ref={inputRef}
                  id="modal-task-input"
                  className={styles.mainInput}
                  type="text"
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="e.g., Review quarterly report..."
                  maxLength={200}
                  autoComplete="off"
                />
                <div className={styles.charCount}>{text.length}/200</div>
              </motion.div>

              {/* Priority */}
              <div className={styles.section}>
                <label className={styles.sectionLabel}>Priority</label>
                <div className={styles.priorityGrid}>
                  {Object.entries(PRIORITIES).map(([key, val]) => (
                    <motion.button
                      key={key}
                      type="button"
                      id={`modal-prio-${key}`}
                      className={`${styles.prioBtn} ${priority === key ? styles.prioBtnActive : ''}`}
                      style={{ '--p': val.color, '--pb': val.bg }}
                      onClick={() => setPriority(key)}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className={styles.prioIcon}>{val.icon}</span>
                      <span>{val.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div className={styles.section}>
                <label className={styles.sectionLabel}>Category</label>
                <div className={styles.categoryGrid}>
                  {CATEGORIES.map(cat => (
                    <motion.button
                      key={cat.id}
                      type="button"
                      id={`modal-cat-${cat.id}`}
                      className={`${styles.catBtn} ${category === cat.id ? styles.catBtnActive : ''}`}
                      style={{ '--c': cat.color }}
                      onClick={() => setCategory(cat.id)}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Due date + Notes */}
              <div className={styles.row2}>
                <div className={styles.section} style={{ flex: '0 0 auto' }}>
                  <label className={styles.sectionLabel} htmlFor="modal-due">Due Date</label>
                  <input
                    id="modal-due"
                    type="date"
                    className={styles.dateInput}
                    value={dueDate}
                    min={today()}
                    onChange={e => setDueDate(e.target.value)}
                  />
                </div>
                <div className={styles.section} style={{ flex: 1 }}>
                  <label className={styles.sectionLabel} htmlFor="modal-notes">Notes</label>
                  <input
                    id="modal-notes"
                    type="text"
                    className={styles.notesInput}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Optional details..."
                    maxLength={300}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className={styles.actions}>
                <motion.button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={onClose}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  id="modal-submit-btn"
                  className={styles.submitBtn}
                  disabled={!text.trim()}
                  whileHover={text.trim() ? { scale: 1.03, boxShadow: '0 8px 32px rgba(124,106,247,0.5)' } : {}}
                  whileTap={text.trim() ? { scale: 0.97 } : {}}
                >
                  <span>Create Task</span>
                  <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
                    <path d="M4 10h12M10 4l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </motion.button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
