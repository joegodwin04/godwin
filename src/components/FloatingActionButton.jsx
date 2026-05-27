// FloatingActionButton.jsx
import { motion, AnimatePresence } from 'framer-motion'
import styles from './FloatingActionButton.module.css'

export default function FloatingActionButton({ isOpen, onClick }) {
  return (
    <div className={styles.wrap}>
      {/* Pulse rings */}
      {!isOpen && (
        <>
          <div className={styles.ring} style={{ animationDelay: '0s' }} />
          <div className={styles.ring} style={{ animationDelay: '0.6s' }} />
        </>
      )}

      <motion.button
        id="fab-add-task"
        className={styles.fab}
        onClick={onClick}
        whileHover={{ scale: 1.08, boxShadow: '0 0 40px rgba(124,106,247,0.6)' }}
        whileTap={{ scale: 0.93 }}
        animate={{ rotate: isOpen ? 45 : 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        aria-label={isOpen ? 'Close task form' : 'Add new task'}
        title={isOpen ? 'Close' : 'Add Task'}
      >
        <svg viewBox="0 0 24 24" fill="none" width="24" height="24">
          <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      </motion.button>

      {/* Tooltip */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            className={styles.tooltip}
            initial={{ opacity: 0, x: 8, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 8, scale: 0.9 }}
            transition={{ delay: 1.5, duration: 0.2 }}
          >
            Add Task
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
