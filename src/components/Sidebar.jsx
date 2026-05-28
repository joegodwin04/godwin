// Sidebar.jsx — Premium animated sidebar with mobile drawer support
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import styles from './Sidebar.module.css'

const NAV_MAIN = [
  { id: 'dashboard', label: 'Dashboard',  icon: GridIcon },
  { id: 'tasks',     label: 'My Tasks',   icon: TaskIcon },
  { id: 'habits',    label: 'Habits',     icon: FlameIcon },
  { id: 'goals',     label: 'Goals',      icon: TargetIcon },
]
const NAV_TOOLS = [
  { id: 'focus',     label: 'Focus Timer', icon: TimerIcon },
  { id: 'analytics', label: 'Analytics',   icon: ChartIcon },
]

function useIsMobile() {
  if (typeof window === 'undefined') return false
  return window.innerWidth <= 768
}

export default function Sidebar({ view, setView, stats, collapsed, setCollapsed }) {
  const { theme, toggle: toggleTheme } = useTheme()

  // On mobile, close sidebar when navigating
  const handleNavClick = (id) => {
    setView(id)
    if (window.innerWidth <= 768) {
      setCollapsed(true)
    }
  }

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && !collapsed) setCollapsed(true)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [collapsed, setCollapsed])

  // On desktop, collapsed means icon-only. On mobile, collapsed means hidden drawer.
  const isMobileCollapsed = typeof window !== 'undefined' && window.innerWidth <= 768 && collapsed

  return (
    <>
      {/* Mobile overlay — shown when sidebar is open on mobile */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setCollapsed(true)}
            aria-label="Close sidebar"
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={`${styles.sidebar} ${isMobileCollapsed ? styles.sidebarCollapsed : ''}`}
        animate={{ width: collapsed && window.innerWidth > 768 ? 68 : 260 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={isMobileCollapsed ? { transform: 'translateX(-100%)' } : {}}
      >
        {/* Brand */}
        <div className={styles.brand}>
          <motion.div className={styles.logo} whileHover={{ scale: 1.08, rotate: 5 }} whileTap={{ scale: 0.95 }}>
            <LogoIcon />
          </motion.div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div className={styles.brandText}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                <span className={styles.brandName}>TaskFlow</span>
                <span className={styles.brandSub}>Productivity Suite</span>
              </motion.div>
            )}
          </AnimatePresence>
          <motion.button className={styles.collapseBtn}
            onClick={() => setCollapsed(v => !v)}
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.3 }}>
              <ChevronLeftIcon />
            </motion.div>
          </motion.button>
        </div>

        <div className={styles.divider} />

        {/* Main nav */}
        <nav className={styles.nav} aria-label="Main navigation">
          {!collapsed && <span className={styles.navSection}>MAIN</span>}
          {NAV_MAIN.map((navItem, i) => (
            <NavButton
              key={navItem.id}
              item={navItem}
              active={view === navItem.id}
              onClick={() => handleNavClick(navItem.id)}
              collapsed={collapsed}
              badge={navItem.id === 'tasks' && stats.active > 0 ? stats.active : null}
              delay={i * 0.04}
            />
          ))}

          {!collapsed && <span className={styles.navSection} style={{ marginTop: 12 }}>TOOLS</span>}
          {collapsed && <div className={styles.divider} style={{ margin: '8px 0' }} />}
          {NAV_TOOLS.map((navItem, i) => (
            <NavButton
              key={navItem.id}
              item={navItem}
              active={view === navItem.id}
              onClick={() => handleNavClick(navItem.id)}
              collapsed={collapsed}
              delay={(NAV_MAIN.length + i) * 0.04}
            />
          ))}
        </nav>

        {/* Bottom section */}
        <div className={styles.bottom}>
          {/* Progress (expanded only) */}
          <AnimatePresence>
            {!collapsed && (
              <motion.div className={styles.progressCard}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.2 }}>
                <div className={styles.progressTop}>
                  <span className={styles.progressLabel}>Today's Progress</span>
                  <span className={styles.progressPct}>{stats.completionRate}%</span>
                </div>
                <div className={styles.progressTrack}>
                  <motion.div className={styles.progressFill}
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.completionRate}%` }}
                    transition={{ duration: 1, ease: [0.16,1,0.3,1], delay: 0.2 }} />
                </div>
                <div className={styles.progressMeta}>
                  <span>{stats.completed} done</span>
                  {stats.overdue > 0 && <span style={{ color: 'var(--rose)' }}>⚠ {stats.overdue} overdue</span>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className={styles.divider} />

          {/* Theme toggle */}
          <motion.button
            className={styles.themeBtn}
            onClick={toggleTheme}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <span className={styles.themeIcon}>{theme === 'dark' ? '☀️' : '🌙'}</span>
            <AnimatePresence>
              {!collapsed && (
                <motion.span className={styles.themeLabel}
                  initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}>
                  {theme === 'dark' ? 'Light mode' : 'Dark mode'}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          {/* User row */}
          <div className={styles.userRow}>
            <div className={styles.avatar}>JG</div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div className={styles.userInfo}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.18 }}>
                  <span className={styles.userName}>Joe Godwin</span>
                  <span className={styles.userRole}>⚡ Pro Plan</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>
    </>
  )
}

function NavButton({ item, active, onClick, collapsed, badge, delay }) {
  const Icon = item.icon
  return (
    <motion.button
      id={`nav-${item.id}`}
      className={`${styles.navItem} ${active ? styles.navActive : ''}`}
      onClick={onClick}
      whileHover={{ x: collapsed ? 0 : 3 }}
      whileTap={{ scale: 0.97 }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      title={collapsed ? item.label : ''}
      aria-label={item.label}
      aria-current={active ? 'page' : undefined}
    >
      {active && (
        <motion.div className={styles.activeIndicator} layoutId="activeNav"
          transition={{ type: 'spring', stiffness: 400, damping: 35 }} />
      )}
      <span className={`${styles.navIcon} ${active ? styles.navIconActive : ''}`}><Icon /></span>
      <AnimatePresence>
        {!collapsed && (
          <motion.span className={styles.navLabel}
            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.18 }}>
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
      {badge && !collapsed && (
        <motion.span className={styles.badge} initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400 }}>{badge}</motion.span>
      )}
    </motion.button>
  )
}

/* ── Icons ── */
function LogoIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" style={{ width: 36, height: 36 }}>
      <rect width="32" height="32" rx="10" fill="url(#lg2)" />
      <path d="M9 16.5L13.5 21L23 11" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <defs>
        <linearGradient id="lg2" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7c6af7"/><stop offset="1" stopColor="#a78bfa"/>
        </linearGradient>
      </defs>
    </svg>
  )
}
function GridIcon()     { return <svg viewBox="0 0 20 20" fill="none" width="17" height="17"><rect x="3" y="3" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.7"/><rect x="11.5" y="3" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.7"/><rect x="3" y="11.5" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.7"/><rect x="11.5" y="11.5" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.7"/></svg> }
function TaskIcon()     { return <svg viewBox="0 0 20 20" fill="none" width="17" height="17"><rect x="3" y="3" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="1.7"/><path d="M7 10h6M7 7h6M7 13h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg> }
function FlameIcon()    { return <svg viewBox="0 0 20 20" fill="none" width="17" height="17"><path d="M10 2s-1.5 2.5-1.5 5c0 .8.3 1.5.8 2C8.5 8.5 8 7.8 8 7c0-2 2-5 2-5zm3 5c0 2.5-3 4.5-3 7a3 3 0 006 0c0-3-3-7-3-7z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function TargetIcon()   { return <svg viewBox="0 0 20 20" fill="none" width="17" height="17"><circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.7"/><circle cx="10" cy="10" r="3.5" stroke="currentColor" strokeWidth="1.7"/><circle cx="10" cy="10" r="1" fill="currentColor"/></svg> }
function TimerIcon()    { return <svg viewBox="0 0 20 20" fill="none" width="17" height="17"><circle cx="10" cy="11" r="6" stroke="currentColor" strokeWidth="1.7"/><path d="M10 8v3l2 1.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/><path d="M8 2h4M10 2v3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg> }
function ChartIcon()    { return <svg viewBox="0 0 20 20" fill="none" width="17" height="17"><path d="M3 15l4-5 3 3 3-5 4 3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 4v12h14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg> }
function ChevronLeftIcon() { return <svg viewBox="0 0 20 20" fill="none" width="14" height="14"><path d="M12 5l-5 5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> }
