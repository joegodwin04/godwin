// Auth.jsx — Persistent User Registry and Authentication screen Loop
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import styles from './Auth.module.css'

export default function Auth({ onLoginSuccess }) {
  const { theme } = useTheme()
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  
  // Form fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState('guest@taskflow.io')
  const [password, setPassword] = useState('password')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  
  // Feedback states
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Pre-seed mock database registry & realistic test records
  function preseedRegistry() {
    try {
      const registry = JSON.parse(localStorage.getItem('tf_users_registry') || '[]')
      const guestExists = registry.some(u => u.email === 'guest@taskflow.io')
      
      if (!guestExists) {
        const guestUser = {
          name: 'Joe Godwin',
          email: 'guest@taskflow.io',
          password: 'password',
          bio: 'Productivity enthusiast and SaaS engineer. Building the future of automated workspaces.',
          joinDate: 'March 14, 2026',
          avatar: 'JG',
          notifications: { push: true, email: true, weeklyReports: true, soundToggle: true },
          premium: true
        }
        registry.push(guestUser)
        
        // Add Second User (Joe Stripe)
        const joeUser = {
          name: 'Joe Stripe',
          email: 'joe@stripe.com',
          password: 'password',
          bio: 'Design lead at Stripe. Building beautiful visual interfaces.',
          joinDate: 'April 20, 2026',
          avatar: 'JS',
          notifications: { push: true, email: true, weeklyReports: false, soundToggle: true },
          premium: false
        }
        registry.push(joeUser)
        
        localStorage.setItem('tf_users_registry', JSON.stringify(registry))
        
        // Seeding Guest data
        const guestEmail = 'guest@taskflow.io'
        
        // 1. Scoped Todos
        const defaultTodos = [
          { id: 'todo_g1', text: 'Design high-fidelity dashboard hero', completed: true, priority: 'high', category: 'work', dueDate: null, notes: 'Complete this before shipping v5.', createdAt: new Date().toISOString(), completedAt: new Date().toISOString() },
          { id: 'todo_g2', text: 'Audit Stripe payment comparisons modal', completed: true, priority: 'medium', category: 'work', dueDate: null, notes: 'Check all Pricing Card grids.', createdAt: new Date().toISOString(), completedAt: new Date().toISOString() },
          { id: 'todo_g3', text: 'Structure multi-account scoped state keys', completed: false, priority: 'high', category: 'work', dueDate: null, notes: 'Verify todos, habits, goals, pomodoros isolation.', createdAt: new Date().toISOString(), completedAt: null },
          { id: 'todo_g4', text: 'Complete productivity report print styles', completed: false, priority: 'medium', category: 'learning', dueDate: null, notes: 'Test browser print-to-PDF formatting.', createdAt: new Date().toISOString(), completedAt: null },
        ]
        localStorage.setItem(`tf_${guestEmail}_todos`, JSON.stringify(defaultTodos))
        
        // 2. Scoped Habits (Pre-completed completions to show 7-day streak!)
        const dateStr = (daysAgo = 0) => {
          const d = new Date()
          d.setDate(d.getDate() - daysAgo)
          return d.toISOString().split('T')[0]
        }
        const guestHabits = [
          {
            id: 'h_default_1',
            name: 'Morning workout',
            icon: '💪',
            color: '#f43f5e',
            completions: {
              [dateStr(0)]: true, [dateStr(1)]: true, [dateStr(2)]: true, [dateStr(3)]: true, [dateStr(4)]: true, [dateStr(5)]: true, [dateStr(6)]: true
            },
            createdAt: new Date().toISOString()
          },
          {
            id: 'h_default_2',
            name: 'Read 20 minutes',
            icon: '📚',
            color: '#f59e0b',
            completions: {
              [dateStr(0)]: true, [dateStr(1)]: true, [dateStr(2)]: true, [dateStr(3)]: true, [dateStr(4)]: true, [dateStr(5)]: true, [dateStr(6)]: true
            },
            createdAt: new Date().toISOString()
          },
          {
            id: 'h_default_3',
            name: 'Drink 8 glasses',
            icon: '💧',
            color: '#22d3ee',
            completions: {
              [dateStr(0)]: true, [dateStr(1)]: true, [dateStr(2)]: true
            },
            createdAt: new Date().toISOString()
          }
        ]
        localStorage.setItem(`tf_${guestEmail}_habits`, JSON.stringify(guestHabits))
        
        // 3. Scoped Goals
        const guestGoals = [
          { id: 'g_default_1', title: 'Complete 50 tasks', icon: '🎯', color: '#7c6af7', target: 50, current: 45, unit: 'tasks', dueDate: '', createdAt: new Date().toISOString() },
          { id: 'g_default_2', title: 'Build 30-day streak', icon: '🔥', color: '#f59e0b', target: 30, current: 12, unit: 'days', dueDate: '', createdAt: new Date().toISOString() },
          { id: 'g_default_3', title: 'Focus sessions this month', icon: '⏱️', color: '#10b981', target: 20, current: 18, unit: 'sessions', dueDate: '', createdAt: new Date().toISOString() },
        ]
        localStorage.setItem(`tf_${guestEmail}_goals`, JSON.stringify(guestGoals))
        
        // 4. Scoped Focus Sessions
        localStorage.setItem(`tf_${guestEmail}_pomo_sessions`, '18')
      }
    } catch (e) {
      console.error('Failed to pre-seed guest registry', e)
    }
  }

  // Trigger preseed on mount
  useEffect(() => {
    preseedRegistry()
  }, [])

  // Handle forms submissions (Login / Signup Registry check)
  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    
    if (!email || !password) {
      setError('Please fill in all required fields.')
      return
    }
    
    if (mode === 'signup' && !name) {
      setError('Please enter your full name.')
      return
    }
    
    setIsLoading(true)
    
    setTimeout(() => {
      try {
        const registry = JSON.parse(localStorage.getItem('tf_users_registry') || '[]')
        
        if (mode === 'login') {
          // Check Login Credentials
          const userRecord = registry.find(u => u.email.toLowerCase() === email.toLowerCase())
          
          if (!userRecord) {
            setError('No account found with this email. Please sign up!')
            setIsLoading(false)
            return
          }
          
          if (userRecord.password !== password) {
            setError('Incorrect password. Please try again.')
            setIsLoading(false)
            return
          }
          
          setIsLoading(false)
          onLoginSuccess(userRecord)
        } else {
          // Handle Signup Registry creation
          const userExists = registry.some(u => u.email.toLowerCase() === email.toLowerCase())
          
          if (userExists) {
            setError('An account with this email already exists.')
            setIsLoading(false)
            return
          }
          
          const newUser = {
            name: name,
            email: email,
            password: password,
            bio: 'SaaS Builder on TaskFlow.',
            joinDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            avatar: name.substring(0, 2).toUpperCase(),
            notifications: { push: true, email: true, weeklyReports: true, soundToggle: true },
            premium: false
          }
          
          registry.push(newUser)
          localStorage.setItem('tf_users_registry', JSON.stringify(registry))
          
          // Seed new clean starter tasks for fresh user experience
          const newTodos = [
            { id: `todo_n1_${Date.now()}`, text: '🚀 Welcome to TaskFlow! Complete your first task', completed: false, priority: 'high', category: 'other', dueDate: null, notes: 'Click checkmark to complete!', createdAt: new Date().toISOString(), completedAt: null },
            { id: `todo_n2_${Date.now()}`, text: '⏱️ Complete a focus session in the Focus Timer tab', completed: false, priority: 'medium', category: 'learning', dueDate: null, notes: 'Work for 25 minutes, then rest.', createdAt: new Date().toISOString(), completedAt: null },
          ]
          localStorage.setItem(`tf_${email}_todos`, JSON.stringify(newTodos))
          
          setIsLoading(false)
          onLoginSuccess(newUser)
        }
      } catch {
        setError('Storage connection failed. Please try again.')
        setIsLoading(false)
      }
    }, 850)
  }

  // Quick bypass for review / guest entry
  const handleGuestAccess = () => {
    setIsLoading(true)
    setError('')
    setTimeout(() => {
      try {
        const registry = JSON.parse(localStorage.getItem('tf_users_registry') || '[]')
        const guestUser = registry.find(u => u.email === 'guest@taskflow.io')
        setIsLoading(false)
        if (guestUser) {
          onLoginSuccess(guestUser)
        } else {
          onLoginSuccess({
            name: 'Joe Godwin',
            email: 'guest@taskflow.io',
            password: 'password',
            bio: 'Productivity enthusiast and SaaS engineer. Building the future of automated workspaces.',
            joinDate: 'March 14, 2026',
            avatar: 'JG',
            notifications: { push: true, email: true, weeklyReports: true, soundToggle: true },
            premium: true
          })
        }
      } catch {
        setIsLoading(false)
        onLoginSuccess({
          name: 'Joe Godwin',
          email: 'guest@taskflow.io',
          avatar: 'JG',
          premium: true
        })
      }
    }, 700)
  }

  const handleSocialLogin = (platform) => {
    setIsLoading(true)
    setError('')
    setTimeout(() => {
      try {
        const email = `auth.${platform.toLowerCase()}@taskflow.io`
        const registry = JSON.parse(localStorage.getItem('tf_users_registry') || '[]')
        let userRecord = registry.find(u => u.email === email)
        
        if (!userRecord) {
          userRecord = {
            name: `${platform} User`,
            email: email,
            password: 'social-auth-bypass',
            bio: `Seeded via ${platform} SSO.`,
            joinDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            avatar: platform.substring(0, 2).toUpperCase(),
            notifications: { push: true, email: true, weeklyReports: true, soundToggle: true },
            premium: false
          }
          registry.push(userRecord)
          localStorage.setItem('tf_users_registry', JSON.stringify(registry))
        }
        
        setIsLoading(false)
        onLoginSuccess(userRecord)
      } catch {
        setIsLoading(false)
        onLoginSuccess({
          name: `${platform} User`,
          email: `auth.${platform.toLowerCase()}@taskflow.io`,
          avatar: platform.substring(0, 2).toUpperCase()
        })
      }
    }, 800)
  }

  const formVariants = {
    initial: { opacity: 0, x: mode === 'login' ? -15 : 15, y: 0 },
    animate: { opacity: 1, x: 0, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
    exit: { opacity: 0, x: mode === 'login' ? 15 : -15, transition: { duration: 0.2 } }
  }

  return (
    <div className={styles.wrap} data-theme={theme}>
      
      {/* ── MARKETING SHOWCASE PANEL (LEFT) ── */}
      <div className={styles.marketingSide}>
        <div className={styles.marketingHeader}>
          <div className={styles.marketingLogo}>
            <LogoIcon />
          </div>
          <span className={styles.marketingBrand}>TaskFlow</span>
        </div>
        
        <div className={styles.marketingBody}>
          <div className={styles.marketingTag}>
            <span>✨ SYSTEM RELEASE V5.0</span>
          </div>
          
          <h1 className={styles.marketingTitle}>
            Organize work.<br />
            Focus on what <span>matters.</span>
          </h1>
          
          <p className={styles.marketingDesc}>
            The premium workspace designed for developers, builders, and high-performance teams. Combine tasks, goals, habits, and deep focus sessions in one gorgeous cockpit.
          </p>
          
          {/* Decorative premium floating element */}
          <div className={styles.mockupWrap}>
            <div className={styles.mockupHeader}>
              <div className={styles.mockupDots}>
                <span className={styles.mockupDot} />
                <span className={styles.mockupDot} />
                <span className={styles.mockupDot} />
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-300)' }}>TaskFlow cockpit.exe</span>
            </div>
            <div className={styles.mockupItem}>
              <div className={styles.mockupCheck}>✓</div>
              <div className={styles.mockupLine} />
            </div>
            <div className={styles.mockupItem}>
              <div className={styles.mockupCheck} style={{ borderColor: 'rgba(255,255,255,0.1)' }}></div>
              <div className={styles.mockupLine} />
            </div>
            <div className={styles.mockupItem} style={{ marginBottom: 0 }}>
              <div className={styles.mockupCheck} style={{ borderColor: 'rgba(255,255,255,0.1)' }}></div>
              <div className={styles.mockupLine} style={{ width: '60%', flexGrow: 0 }} />
            </div>
          </div>
        </div>
        
        <div className={styles.marketingFooter}>
          <span>© 2026 TaskFlow Technologies Inc.</span>
          <div className={styles.footerStats}>
            <div className={styles.statItem}>
              <span className={styles.statVal}>99.9%</span>
              <span className={styles.statLbl}>Uptime</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statVal}>120k+</span>
              <span className={styles.statLbl}>Active Builders</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* ── AUTH FORMS PANEL (RIGHT) ── */}
      <div className={styles.formSide}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.logoIcon}>
              <LogoIcon />
            </div>
            <h2 className={styles.title}>
              {mode === 'login' ? 'Welcome back' : 'Create your workspace'}
            </h2>
            <p className={styles.subtitle}>
              {mode === 'login' ? 'Enter your details to access your dashboard' : 'Join high-performers tracking work today'}
            </p>
          </div>
          
          {/* Animated Tab Switcher */}
          <div className={styles.tabRow}>
            <button 
              type="button" 
              className={`${styles.tabBtn} ${mode === 'login' ? styles.tabBtnActive : ''}`} 
              onClick={() => { setMode('login'); setError(''); }}
            >
              Log In
            </button>
            <button 
              type="button" 
              className={`${styles.tabBtn} ${mode === 'signup' ? styles.tabBtnActive : ''}`} 
              onClick={() => { setMode('signup'); setError(''); }}
            >
              Sign Up
            </button>
            <motion.div 
              className={styles.tabIndicator} 
              animate={{ x: mode === 'login' ? '0%' : '100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          </div>
          
          {/* Animated Form container */}
          <AnimatePresence mode="wait">
            <motion.form 
              key={mode} 
              className={styles.form} 
              onSubmit={handleSubmit}
              variants={formVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {mode === 'signup' && (
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="name">Full Name</label>
                  <input 
                    type="text" 
                    id="name"
                    className={styles.input} 
                    placeholder="Joe Godwin" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              )}
              
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="email">Work Email</label>
                <input 
                  type="email" 
                  id="email"
                  className={styles.input} 
                  placeholder="name@company.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className={styles.fieldGroup}>
                <div className={styles.labelRow}>
                  <label className={styles.label} htmlFor="password">Password</label>
                  {mode === 'login' && (
                    <a href="#forgot" className={styles.forgotLink} onClick={(e) => { e.preventDefault(); alert("Use standard credentials like guest@taskflow.io / password to test immediately!"); }}>
                      Forgot?
                    </a>
                  )}
                </div>
                <div className={styles.inputWrap}>
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    id="password"
                    className={`${styles.input} ${styles.inputWithIcon}`} 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button 
                    type="button" 
                    className={styles.eyeButton}
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>
              
              {mode === 'login' && (
                <div className={styles.metaRow}>
                  <label className={styles.checkboxLabel}>
                    <input 
                      type="checkbox" 
                      className={styles.checkbox} 
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                    />
                    <span>Remember this device</span>
                  </label>
                </div>
              )}
              
              {error && (
                <div className={styles.errorMsg}>
                  <span>⚠️</span> {error}
                </div>
              )}
              
              <button 
                type="submit" 
                className={styles.ctaBtn} 
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className={styles.loadingSpinner} />
                ) : (
                  <span>{mode === 'login' ? 'Continue with Email' : 'Create Account'}</span>
                )}
              </button>
              
              {/* Premium explore guest button for testing and direct entry */}
              <button 
                type="button" 
                className={`${styles.ctaBtn} ${styles.guestBtn}`} 
                onClick={handleGuestAccess}
                disabled={isLoading}
              >
                <span>⚡ Explore as Guest</span>
              </button>
            </motion.form>
          </AnimatePresence>
          
          <div className={styles.divider}>OR CONTINUE WITH</div>
          
          <div className={styles.socialRow}>
            <button type="button" className={styles.socialBtn} onClick={() => handleSocialLogin('Google')} disabled={isLoading}>
              <span className={styles.socialIcon}><GoogleIcon /></span>
              <span>Google</span>
            </button>
            <button type="button" className={styles.socialBtn} onClick={() => handleSocialLogin('GitHub')} disabled={isLoading}>
              <span className={styles.socialIcon}><GithubIcon /></span>
              <span>GitHub</span>
            </button>
          </div>
          
        </div>
      </div>
      
    </div>
  )
}

/* ── MOCK SVGS AND SUB-COMPONENTS ── */

function LogoIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" style={{ width: 22, height: 22 }}>
      <path d="M9 16.5L13.5 21L23 11" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" width="16" height="16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 10s3-6 9-6 9 6 9 6-3 6-9 6-9-6-9-6z" />
      <circle cx="10" cy="10" r="3" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" width="16" height="16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0110 20c-6 0-9-6-9-6a17.93 17.93 0 013.06-4.06M9.9 4.24A9.12 9.12 0 0110 4c6 0 9 6 9 6a18 18 0 01-1.92 2.56M12.83 12.83A3 3 0 018 8l4.83 4.83z" />
      <path d="M1 1l18 18" />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18">
      <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.6-6.887 4.6-4.33 0-7.86-3.59-7.86-8s3.53-8 7.86-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.1A12.9 12.9 0 0012.24 0c-7.185 0-13 5.815-13 13s5.815 13 13 13c7.5 0 12.485-5.285 12.485-12.685 0-.855-.09-1.5-.2-2.03H12.24z"/>
    </svg>
  )
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
    </svg>
  )
}
