// SettingsModal.jsx — Workspace settings and command center with PDF generator
import { useState } from 'react'
import { motion } from 'framer-motion'
import styles from './SettingsModal.module.css'

export default function SettingsModal({
  activeTab,
  setActiveTab,
  onClose,
  user,
  setUser,
  stats,
  pomoSessions,
  showToast
}) {
  // Tab keys list
  const TABS = [
    { id: 'profile',       label: 'View Profile',      icon: '⬡' },
    { id: 'edit',          label: 'Edit Details',      icon: '👤' },
    { id: 'notifications', label: 'Notifications',     icon: '🔔' },
    { id: 'billing',       label: 'Workspace billing', icon: '🚀' },
    { id: 'reports',       label: 'Productivity PDF',  icon: '📈' },
  ]

  // Form edit states
  const [editName, setEditName] = useState(user?.name || '')
  const [editEmail, setEditEmail] = useState(user?.email || '')
  const [editBio, setEditBio] = useState(user?.bio || 'Productivity enthusiast and SaaS builder.')
  const [editPassword, setEditPassword] = useState('••••••••')
  const [isSaving, setIsSaving] = useState(false)

  // Notification states
  const [notifPush, setNotifPush] = useState(user?.notifications?.push ?? true)
  const [notifEmail, setNotifEmail] = useState(user?.notifications?.email ?? true)
  const [notifWeekly, setNotifWeekly] = useState(user?.notifications?.weeklyReports ?? true)
  const [notifSound, setNotifSound] = useState(user?.notifications?.soundToggle ?? true)

  // Retrieve count metrics
  const completedCount = stats.completed || 0
  const activeCount = stats.active || 0
  const completionRate = stats.completionRate || 0
  const streakDays = 7 // Mocked premium streak loop

  // Get active user registry database
  const getUsersRegistry = () => {
    try {
      return JSON.parse(localStorage.getItem('tf_users_registry') || '[]')
    } catch { return [] }
  }

  // Save updated user to registry
  const updateRegistryUser = (updatedUser) => {
    try {
      const registry = getUsersRegistry()
      const index = registry.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase())
      if (index !== -1) {
        registry[index] = updatedUser
      } else {
        registry.push(updatedUser)
      }
      localStorage.setItem('tf_users_registry', JSON.stringify(registry))
    } catch (e) {
      console.error('Failed to update users registry', e)
    }
  }

  // Save profile edit changes
  const handleSaveProfile = (e) => {
    e.preventDefault()
    if (!editName.trim() || !editEmail.trim()) {
      showToast('Name and email fields cannot be blank.', 'error')
      return
    }

    setIsSaving(true)
    setTimeout(() => {
      const updatedUser = {
        ...user,
        name: editName,
        email: editEmail,
        bio: editBio,
        avatar: editName.substring(0, 2).toUpperCase(),
        password: editPassword !== '••••••••' ? editPassword : user.password
      }
      
      // Save changes back to registry and active session
      updateRegistryUser(updatedUser)
      setUser(updatedUser)
      localStorage.setItem('tf_user', JSON.stringify(updatedUser))
      setIsSaving(false)
      showToast('Profile credentials updated successfully!', 'success')
    }, 800)
  }

  // Handle billing plan upgrades
  const handleUpgradeAccount = () => {
    if (user?.premium) {
      showToast('You are already built as a Pro member!', 'success')
      return
    }

    setIsSaving(true)
    setTimeout(() => {
      const updatedUser = {
        ...user,
        premium: true
      }
      
      // Save changes back to registry and active session
      updateRegistryUser(updatedUser)
      setUser(updatedUser)
      localStorage.setItem('tf_user', JSON.stringify(updatedUser))
      setIsSaving(false)
      showToast('Welcome to Pro! All commercial features unlocked.', 'success')
    }, 700)
  }

  // Save notifications config
  const handleToggleNotif = (type, value) => {
    const updatedUser = {
      ...user,
      notifications: {
        ...user?.notifications,
        [type]: value
      }
    }
    updateRegistryUser(updatedUser)
    setUser(updatedUser)
    localStorage.setItem('tf_user', JSON.stringify(updatedUser))
    showToast('Notification layout changes saved.', 'success')
  }

  // Printable HTML/CSS PDF report generator
  const handleGenerateReport = () => {
    const printWindow = window.open('', '_blank')
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    const activeGoals = 3 // Standard premium seeded metrics
    const habitsCompleted = 12

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>TaskFlow Productivity Report — ${user?.name}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
          body {
            font-family: 'Inter', -apple-system, sans-serif;
            color: #0f0e2a;
            background: #ffffff;
            margin: 0;
            padding: 40px;
            line-height: 1.5;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #7c6af7;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .title-area h1 {
            font-size: 28px;
            font-weight: 800;
            margin: 0;
            color: #7c6af7;
            letter-spacing: -0.03em;
          }
          .title-area p {
            font-size: 13px;
            color: #6561a0;
            margin: 4px 0 0 0;
          }
          .meta-area {
            text-align: right;
            font-size: 13px;
            color: #6561a0;
          }
          .meta-area strong {
            color: #0f0e2a;
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 30px;
          }
          .stat-card {
            border: 1px solid #d8d4ef;
            border-radius: 12px;
            padding: 20px;
            background: #f8f7fe;
            text-align: center;
          }
          .stat-val {
            font-size: 32px;
            font-weight: 800;
            color: #7c6af7;
            margin: 0 0 6px 0;
            letter-spacing: -0.04em;
          }
          .stat-lbl {
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #6561a0;
          }
          .section-title {
            font-size: 18px;
            font-weight: 800;
            color: #0f0e2a;
            border-bottom: 1px solid #ebe8f8;
            padding-bottom: 8px;
            margin-bottom: 16px;
            margin-top: 30px;
            letter-spacing: -0.02em;
          }
          .score-box {
            border: 1px solid #7c6af7;
            border-radius: 12px;
            padding: 20px;
            background: linear-gradient(135deg, rgba(124,106,247,0.05), rgba(34,211,238,0.05));
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 30px;
          }
          .score-text {
            max-width: 70%;
          }
          .score-text h3 {
            font-size: 16px;
            font-weight: 800;
            margin: 0 0 6px 0;
          }
          .score-text p {
            font-size: 12.5px;
            color: #3c3960;
            margin: 0;
          }
          .score-circle {
            width: 70px;
            height: 70px;
            border-radius: 50%;
            border: 4px solid #7c6af7;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            font-weight: 800;
            color: #7c6af7;
          }
          .footer {
            text-align: center;
            font-size: 11px;
            color: #9d9bbf;
            border-top: 1px solid #ebe8f8;
            padding-top: 20px;
            margin-top: 50px;
          }
          @media print {
            body { padding: 0; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title-area">
            <h1>TASKFLOW PRODUCTIVITY REPORT</h1>
            <p>SaaS Premium Productivity Dashboard Analytics</p>
          </div>
          <div class="meta-area">
            User: <strong>${user?.name}</strong><br>
            Email: <strong>${user?.email}</strong><br>
            Generated: <strong>${dateStr}</strong>
          </div>
        </div>
        
        <div class="score-box">
          <div class="score-text">
            <h3>TaskFlow Productivity Score</h3>
            <p>${
              completionRate >= 80 
                ? "Exceptional workload management! Your completion rate is in the top 5% of all Pro workspace builders. Maintain your current daily workflow habit loop."
                : completionRate >= 50
                ? "Good consistent progress. Continue managing task categorizations and structuring focus sessions to push through backlog tasks."
                : "Consider breaking large projects into micro-tasks and initiating short 25-minute Pomodoro sessions to gain momentum."
            }</p>
          </div>
          <div class="score-circle">
            ${completionRate}%
          </div>
        </div>

        <div class="grid">
          <div class="stat-card">
            <div class="stat-val">${completedCount}</div>
            <div class="stat-lbl">Tasks Completed</div>
          </div>
          <div class="stat-card">
            <div class="stat-val">${streakDays} Days</div>
            <div class="stat-lbl">Habit Streak</div>
          </div>
          <div class="stat-card">
            <div class="stat-val">${pomoSessions}</div>
            <div class="stat-lbl">Focus Timer Sessions</div>
          </div>
        </div>

        <div class="section-title">Current Workspace Summary</div>
        <p style="font-size: 13.5px; color: #3c3960;">
          The user <strong>${user?.name}</strong> has a registered account join date of <strong>${user?.joinDate || 'January 2026'}</strong>. Their profile currently shows an active workload of <strong>${activeCount}</strong> tasks pending completion. In their daily cockpit loop, they have maintained <strong>${habitsCompleted}</strong> habit completions with <strong>${activeGoals}</strong> active workspace goals set.
        </p>

        <div class="footer">
          Generated automatically by TaskFlow Premium Productivity Suite — v5.0. Confidential Business Report.
        </div>
        
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          }
        </script>
      </body>
      </html>
    `
    printWindow.document.write(htmlContent)
    printWindow.document.close()
    showToast('Productivity report PDF generated!', 'success')
  }

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        
        {/* ── LEFT PANE: TAB NAVIGATION ── */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarTop}>
            <div className={styles.brand}>
              <div className={styles.brandLogo}>⬡</div>
              <span className={styles.brandText}>TaskFlow</span>
            </div>
            
            <nav className={styles.tabList}>
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  className={`${styles.tabItem} ${activeTab === tab.id ? styles.tabActive : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className={styles.tabIcon}>{tab.icon}</span>
                  <span>{tab.label}</span>
                  {activeTab === tab.id && (
                    <motion.div
                      className={styles.activeIndicator}
                      layoutId="settingsActiveIndicator"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </nav>
          </div>
          
          <div className={styles.sidebarBottom}>
            <span className={styles.proBadge}>
              {user?.premium ? '⚡ PRO PLATFORM' : '⚡ FREE ACCOUNT'}
            </span>
          </div>
        </aside>
        
        {/* ── RIGHT PANE: ACTIVE TAB VIEWPORT ── */}
        <main className={styles.viewport}>
          
          {/* Header row */}
          <div className={styles.viewportHeader}>
            <div>
              <h2 className={styles.headerTitle}>
                {activeTab === 'profile' && 'Workspace Profile'}
                {activeTab === 'edit' && 'Account Credentials'}
                {activeTab === 'notifications' && 'System Notifications'}
                {activeTab === 'billing' && 'Workspace Plans'}
                {activeTab === 'reports' && 'Export PDF Report'}
              </h2>
              <p className={styles.headerSub}>
                {activeTab === 'profile' && 'Overview of your productivity habits and scores.'}
                {activeTab === 'edit' && 'Modify your credentials and profile details.'}
                {activeTab === 'notifications' && 'Configure email and browser notification rules.'}
                {activeTab === 'billing' && 'Compare premium SaaS pricing plans and upgrade.'}
                {activeTab === 'reports' && 'Generate a clean printable A4 sheet of your statistics.'}
              </p>
            </div>
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close Settings">✕</button>
          </div>
          
          {/* Viewport Contents */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
            
            {/* VIEW PROFILE TAB */}
            {activeTab === 'profile' && (
              <>
                <div className={styles.profileCard}>
                  <div className={styles.profileAvatar}>{user?.avatar || 'JG'}</div>
                  <div className={styles.profileMeta}>
                    <h3>{user?.name || 'Joe Godwin'}</h3>
                    <p>{user?.email || 'guest@taskflow.io'} · Joined {user?.joinDate || 'January 2026'}</p>
                  </div>
                </div>
                
                <div className={styles.bioSection}>
                  {user?.bio || 'Productivity enthusiast and SaaS engineer. Building the future of automated cockpits.'}
                </div>
                
                <div className={styles.metricsGrid}>
                  <div className={styles.metricItem}>
                    <div className={styles.metricVal}>{completedCount}</div>
                    <div className={styles.metricLbl}>Completed Tasks</div>
                  </div>
                  <div className={styles.metricItem}>
                    <div className={styles.metricVal}>🔥 {streakDays}</div>
                    <div className={styles.metricLbl}>Streak Days</div>
                  </div>
                  <div className={styles.metricItem}>
                    <div className={styles.metricVal}>{pomoSessions}</div>
                    <div className={styles.metricLbl}>Focus Sessions</div>
                  </div>
                </div>
              </>
            )}
            
            {/* EDIT DETAILS TAB */}
            {activeTab === 'edit' && (
              <form className={styles.form} onSubmit={handleSaveProfile}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="edit-name">Full Name</label>
                  <input
                    type="text"
                    id="edit-name"
                    className={styles.input}
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                  />
                </div>
                
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="edit-email">Work Email</label>
                  <input
                    type="email"
                    id="edit-email"
                    className={styles.input}
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="edit-bio">Bio description</label>
                  <textarea
                    id="edit-bio"
                    className={`${styles.input} ${styles.textarea}`}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="edit-password">New Password</label>
                  <input
                    type="password"
                    id="edit-password"
                    className={styles.input}
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                  />
                </div>
                
                <button type="submit" className={styles.saveBtn} disabled={isSaving}>
                  {isSaving ? 'Saving Changes...' : 'Save credentials'}
                </button>
              </form>
            )}
            
            {/* NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className={styles.toggleRow}>
                  <div className={styles.toggleMeta}>
                    <span className={styles.toggleLabel}>Work Email Digest</span>
                    <span className={styles.toggleSub}>Receive weekly productivity score alerts and summaries.</span>
                  </div>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={notifEmail}
                      onChange={(e) => { setNotifEmail(e.target.checked); handleToggleNotif('email', e.target.checked); }}
                    />
                    <span className={styles.slider} />
                  </label>
                </div>

                <div className={styles.toggleRow}>
                  <div className={styles.toggleMeta}>
                    <span className={styles.toggleLabel}>Browser Push Notifications</span>
                    <span className={styles.toggleSub}>Receive focus reminders when focus timer mode finishes.</span>
                  </div>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={notifPush}
                      onChange={(e) => { setNotifPush(e.target.checked); handleToggleNotif('push', e.target.checked); }}
                    />
                    <span className={styles.slider} />
                  </label>
                </div>

                <div className={styles.toggleRow}>
                  <div className={styles.toggleMeta}>
                    <span className={styles.toggleLabel}>Weekly Analytics Reports</span>
                    <span className={styles.toggleSub}>Receive pre-compiled summaries of habit and goals progress.</span>
                  </div>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={notifWeekly}
                      onChange={(e) => { setNotifWeekly(e.target.checked); handleToggleNotif('weeklyReports', e.target.checked); }}
                    />
                    <span className={styles.slider} />
                  </label>
                </div>

                <div className={styles.toggleRow}>
                  <div className={styles.toggleMeta}>
                    <span className={styles.toggleLabel}>Focus Timer Bell Toggles</span>
                    <span className={styles.toggleSub}>Play custom alert sounds when deep work loops complete.</span>
                  </div>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={notifSound}
                      onChange={(e) => { setNotifSound(e.target.checked); handleToggleNotif('soundToggle', e.target.checked); }}
                    />
                    <span className={styles.slider} />
                  </label>
                </div>
              </div>
            )}
            
            {/* BILLING PLANS TAB */}
            {activeTab === 'billing' && (
              <div className={styles.pricingGrid}>
                {/* Free Plan */}
                <div className={styles.priceCard}>
                  <div className={styles.cardHead}>
                    <span className={styles.planName}>Basic Standard</span>
                    <h3 className={styles.planPrice}>$0 <span>/ month</span></h3>
                    <p className={styles.planDesc}>Essential tools to organize habits and track micro-tasks.</p>
                  </div>
                  
                  <ul className={styles.featuresList}>
                    <li className={styles.featureItem}><span className={styles.featureCheck}>✓</span> Standard dashboard widgets</li>
                    <li className={styles.featureItem}><span className={styles.featureCheck}>✓</span> Basic Pomodoro timer</li>
                    <li className={styles.featureItem}><span className={styles.featureCheck}>✓</span> Local storage workspace</li>
                  </ul>
                  
                  <button className={styles.pricingCta} disabled>
                    {!user?.premium ? 'Active Workspace' : 'Free tier'}
                  </button>
                </div>

                {/* Pro Plan */}
                <div className={`${styles.priceCard} ${styles.priceCardPopular}`}>
                  <span className={styles.popularBadge}>RECOMMENDED</span>
                  <div className={styles.cardHead}>
                    <span className={styles.planName}>TaskFlow Pro</span>
                    <h3 className={styles.planPrice}>$9 <span>/ month</span></h3>
                    <p className={styles.planDesc}>Fully loaded metrics, pro indicators, and visual report generation.</p>
                  </div>
                  
                  <ul className={styles.featuresList}>
                    <li className={styles.featureItem}><span className={styles.featureCheck}>✓</span> Gold Premium Pro badge</li>
                    <li className={styles.featureItem}><span className={styles.featureCheck}>✓</span> Dynamic multi-account registry</li>
                    <li className={styles.featureItem}><span className={styles.featureCheck}>✓</span> Printable A4 PDF analytics report</li>
                    <li className={styles.featureItem}><span className={styles.featureCheck}>✓</span> 10 GB workspace storage capacity</li>
                  </ul>
                  
                  <button
                    className={`${styles.pricingCta} ${styles.pricingCtaActive}`}
                    onClick={handleUpgradeAccount}
                    disabled={isSaving || user?.premium}
                  >
                    {user?.premium ? 'Active Pro Tier' : 'Upgrade to Pro'}
                  </button>
                </div>
              </div>
            )}
            
            {/* PRODUCTIVITY PDF TAB */}
            {activeTab === 'reports' && (
              <div className={styles.reportCard}>
                <div className={styles.reportIcon}>📈</div>
                <h3 className={styles.reportTitle}>Export Workspace Summary</h3>
                <p className={styles.reportDesc}>
                  Compile your tasks, focus sessions, goal updates, and habit streak ratios into a clean printable A4 format. Save directly as a PDF for business updates or personal portfolios.
                </p>
                <button
                  type="button"
                  className={styles.reportCta}
                  onClick={handleGenerateReport}
                >
                  ⚡ Generate PDF Report
                </button>
              </div>
            )}
            
          </div>
          
        </main>
        
      </div>
    </div>
  )
}
