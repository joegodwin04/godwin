// useGoals.js — Goal tracking with progress and localStorage
import { useState, useCallback } from 'react'

const STORAGE_KEY = 'tf_goals'

const DEFAULT_GOALS = [
  { id: 'g_default_1', title: 'Complete 50 tasks', icon: '🎯', color: '#7c6af7', target: 50, current: 0, unit: 'tasks', dueDate: '', createdAt: new Date().toISOString() },
  { id: 'g_default_2', title: 'Build 30-day streak', icon: '🔥', color: '#f59e0b', target: 30, current: 0, unit: 'days', dueDate: '', createdAt: new Date().toISOString() },
  { id: 'g_default_3', title: 'Focus sessions this month', icon: '⏱️', color: '#10b981', target: 20, current: 0, unit: 'sessions', dueDate: '', createdAt: new Date().toISOString() },
]

const load = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : DEFAULT_GOALS
  } catch { return DEFAULT_GOALS }
}

export function useGoals() {
  const [goals, setGoals] = useState(load)

  const persist = useCallback((next) => {
    setGoals(next)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
  }, [])

  const addGoal = useCallback((data) => {
    persist(prev => {
      const next = [...prev, {
        id: `g_${Date.now()}`,
        title: data.title.trim(),
        icon: data.icon || '🎯',
        color: data.color || '#7c6af7',
        target: Number(data.target) || 10,
        current: 0,
        unit: data.unit || '',
        dueDate: data.dueDate || '',
        createdAt: new Date().toISOString(),
      }]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const increment = useCallback((id, by = 1) => {
    setGoals(prev => {
      const next = prev.map(g =>
        g.id === id ? { ...g, current: Math.min(g.current + by, g.target) } : g
      )
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const decrement = useCallback((id) => {
    setGoals(prev => {
      const next = prev.map(g =>
        g.id === id ? { ...g, current: Math.max(g.current - 1, 0) } : g
      )
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const deleteGoal = useCallback((id) => {
    setGoals(prev => {
      const next = prev.filter(g => g.id !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const getProgress = (goal) => goal.target > 0 ? Math.round((goal.current / goal.target) * 100) : 0

  return { goals, addGoal, increment, decrement, deleteGoal, getProgress }
}
