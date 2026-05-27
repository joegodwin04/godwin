// AnalyticsChart.jsx — SVG 7-day bar chart (created vs completed)
import { motion } from 'framer-motion'
import { CATEGORIES } from '../hooks/useTodos'
import styles from './AnalyticsChart.module.css'

function getLast7Days(todos) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const ds    = d.toISOString().split('T')[0]
    const label = d.toLocaleDateString('en-US', { weekday: 'short' })
    return {
      date:      ds,
      label,
      created:   todos.filter(t => t.createdAt?.startsWith(ds)).length,
      completed: todos.filter(t => t.completedAt?.startsWith(ds)).length,
    }
  })
}

function BarChart({ days }) {
  const maxVal = Math.max(...days.flatMap(d => [d.created, d.completed]), 1)
  const W = 100 / days.length
  const BAR_W = 6

  return (
    <div className={styles.chartArea}>
      <svg className={styles.svg} viewBox="0 0 400 140" preserveAspectRatio="none">
        <defs>
          <linearGradient id="createdGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7c6af7" stopOpacity="0.9"/>
            <stop offset="100%" stopColor="#7c6af7" stopOpacity="0.3"/>
          </linearGradient>
          <linearGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.9"/>
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.3"/>
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map(f => (
          <line key={f} x1="0" x2="400" y1={f * 120 + 5} y2={f * 120 + 5}
            stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
        ))}

        {days.map((d, i) => {
          const cx = (i + 0.5) * (400 / days.length)
          const createdH   = (d.created   / maxVal) * 110
          const completedH = (d.completed / maxVal) * 110
          return (
            <g key={d.date}>
              {/* Created bar */}
              <motion.rect
                x={cx - BAR_W - 2} y={120 - createdH + 5}
                width={BAR_W} height={Math.max(createdH, 2)}
                rx="3" fill="url(#createdGrad)"
                initial={{ height: 0, y: 125 }}
                animate={{ height: Math.max(createdH, 2), y: 120 - createdH + 5 }}
                transition={{ duration: 0.8, ease: [0.16,1,0.3,1], delay: i * 0.06 }}
              />
              {/* Completed bar */}
              <motion.rect
                x={cx + 2} y={120 - completedH + 5}
                width={BAR_W} height={Math.max(completedH, 2)}
                rx="3" fill="url(#completedGrad)"
                initial={{ height: 0, y: 125 }}
                animate={{ height: Math.max(completedH, 2), y: 120 - completedH + 5 }}
                transition={{ duration: 0.8, ease: [0.16,1,0.3,1], delay: i * 0.06 + 0.04 }}
              />
            </g>
          )
        })}
      </svg>

      {/* X labels */}
      <div className={styles.xLabels}>
        {days.map(d => (
          <span key={d.date} className={styles.xLabel}>{d.label}</span>
        ))}
      </div>
    </div>
  )
}

export default function AnalyticsChart({ todos, stats }) {
  const days   = getLast7Days(todos)
  const totalCreated   = days.reduce((s, d) => s + d.created, 0)
  const totalCompleted = days.reduce((s, d) => s + d.completed, 0)

  // Category stats
  const catStats = CATEGORIES.map(cat => ({
    ...cat,
    count: todos.filter(t => t.category === cat.id).length,
    done:  todos.filter(t => t.category === cat.id && t.completed).length,
  })).filter(c => c.count > 0)

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h3 className={styles.title}>Analytics</h3>
        <span className={styles.sub}>Last 7 days</span>
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: '#7c6af7' }} />
          <span>{totalCreated} Created</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: '#10b981' }} />
          <span>{totalCompleted} Completed</span>
        </div>
        <div className={styles.legendItem} style={{ marginLeft: 'auto' }}>
          <span style={{ color: 'var(--text-400)' }}>Rate: </span>
          <span style={{ color: 'var(--violet-light)', fontWeight: 700 }}>{stats.completionRate}%</span>
        </div>
      </div>

      {/* Chart */}
      <BarChart days={days} />

      {/* Category stats */}
      {catStats.length > 0 && (
        <div className={styles.catGrid}>
          {catStats.slice(0, 4).map(cat => (
            <div key={cat.id} className={styles.catCard} style={{ '--cc': cat.color }}>
              <span className={styles.catIcon}>{cat.icon}</span>
              <span className={styles.catCount}>{cat.count}</span>
              <span className={styles.catName}>{cat.label}</span>
              <div className={styles.catBar}>
                <motion.div
                  className={styles.catBarFill}
                  initial={{ width: 0 }}
                  animate={{ width: `${cat.count > 0 ? (cat.done/cat.count)*100 : 0}%` }}
                  transition={{ duration: 0.9, ease: [0.16,1,0.3,1] }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
