// Header.jsx — Premium top bar
import { motion } from 'framer-motion'
import { useState } from 'react'
import styles from './Header.module.css'

const PAGE_TITLES = {
  dashboard: { label: 'Dashboard',  icon: '⚡' },
  tasks:     { label: 'My Tasks',   icon: '📋' },
  completed: { label: 'Completed',  icon: '✅' },
}

export default function Header({ view, stats, searchQuery, setSearchQuery, setSidebarCollapsed }) {
  const [searchFocused, setSearchFocused] = useState(false)
  const page = PAGE_TITLES[view] || PAGE_TITLES.dashboard

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {/* Left: hamburger + page title */}
        <div className={styles.left}>
          <motion.button
            className={styles.menuBtn}
            onClick={() => setSidebarCollapsed(v => !v)}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            aria-label="Toggle sidebar"
          >
            <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
              <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </motion.button>

          <motion.div
            key={view}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className={styles.pageTitle}
          >
            <span className={styles.pageTitleIcon}>{page.icon}</span>
            <h1 className={styles.pageTitleText}>{page.label}</h1>
          </motion.div>
        </div>

        {/* Center: Search */}
        <motion.div
          className={`${styles.searchWrap} ${searchFocused ? styles.searchFocused : ''}`}
          animate={{ width: searchFocused ? '300px' : '220px' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <svg className={styles.searchIcon} viewBox="0 0 20 20" fill="none" width="15" height="15">
            <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.8"/>
            <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          <input
            id="header-search"
            className={styles.searchInput}
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search tasks..."
          />
          {searchQuery && (
            <motion.button
              className={styles.clearSearch}
              onClick={() => setSearchQuery('')}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg viewBox="0 0 12 12" fill="none" width="10" height="10">
                <path d="M2 2l8 8M10 2L2 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </motion.button>
          )}
        </motion.div>

        {/* Right: progress + avatar */}
        <div className={styles.right}>
          <div className={styles.progressPill}>
            <div className={styles.progressPillBar}>
              <motion.div
                className={styles.progressPillFill}
                initial={{ width: 0 }}
                animate={{ width: `${stats.completionRate}%` }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            <span className={styles.progressPct}>{stats.completionRate}%</span>
          </div>
          <div className={styles.notifBtn} title="Notifications">
            <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
              <path d="M10 2a6 6 0 016 6v2.5l1.5 2v1H2.5v-1L4 10.5V8a6 6 0 016-6z" stroke="currentColor" strokeWidth="1.7"/>
              <path d="M8 15a2 2 0 004 0" stroke="currentColor" strokeWidth="1.7"/>
            </svg>
            {stats.overdue > 0 && <span className={styles.notifDot} />}
          </div>
          <div className={styles.avatar}>JG</div>
        </div>
      </div>

      {/* Bottom glow line */}
      <div className={styles.glowLine} />
    </header>
  )
}
