// usePomodoro.js — Focus timer with work/break modes and session tracking
import { useState, useEffect, useCallback } from 'react'

const WORK_SECS  = 25 * 60
const SHORT_SECS =  5 * 60
const LONG_SECS  = 15 * 60
const MODE_TIMES = { work: WORK_SECS, short: SHORT_SECS, long: LONG_SECS }

export function usePomodoro(user) {
  const getStorageKey = useCallback(() => {
    const userId = user?.id || 'guest'
    return `taskflow_${userId}_analytics`
  }, [user?.id])

  const [mode, setMode]       = useState('work')   // 'work' | 'short' | 'long'
  const [timeLeft, setTimeLeft] = useState(WORK_SECS)
  const [running, setRunning]   = useState(false)
  const [sessions, setSessions] = useState(
    () => parseInt(localStorage.getItem(getStorageKey()) || '0', 10)
  )

  // Reload sessions reactively when user session changes
  useEffect(() => {
    setSessions(parseInt(localStorage.getItem(getStorageKey()) || '0', 10))
  }, [user?.id, getStorageKey])

  // Countdown
  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setTimeLeft(t => (t > 0 ? t - 1 : 0)), 1000)
    return () => clearInterval(id)
  }, [running])

  // Handle completion
  useEffect(() => {
    if (running && timeLeft === 0) {
      setTimeout(() => {
        setRunning(false)
        if (mode === 'work') {
          setSessions(s => {
            const next = s + 1
            localStorage.setItem(getStorageKey(), next)
            return next
          })
          // Auto-switch to short break
          setMode('short')
          setTimeLeft(SHORT_SECS)
        } else {
          setMode('work')
          setTimeLeft(WORK_SECS)
        }
      }, 0)
    }
  }, [timeLeft, running, mode, getStorageKey])

  const toggle    = useCallback(() => setRunning(r => !r), [])
  const reset     = useCallback(() => { setRunning(false); setTimeLeft(MODE_TIMES[mode]) }, [mode])
  const switchMode = useCallback((m) => { setRunning(false); setMode(m); setTimeLeft(MODE_TIMES[m]) }, [])

  const totalSecs = MODE_TIMES[mode]
  const progress  = 1 - timeLeft / totalSecs   // 0 → 1
  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const ss = String(timeLeft % 60).padStart(2, '0')

  return { mode, timeLeft, running, sessions, progress, mm, ss, toggle, reset, switchMode, WORK_SECS, SHORT_SECS, LONG_SECS }
}

