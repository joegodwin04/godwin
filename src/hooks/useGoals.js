// useGoals.js — Goal tracking with progress and localStorage
import { useState, useEffect, useCallback } from 'react'

const DEFAULT_GOALS = [
  { id: 'g_default_1', title: 'Complete 50 tasks', icon: '🎯', color: '#7c6af7', target: 50, current: 0, unit: 'tasks', dueDate: '', createdAt: new Date().toISOString() },
  { id: 'g_default_2', title: 'Build 30-day streak', icon: '🔥', color: '#f59e0b', target: 30, current: 0, unit: 'days', dueDate: '', createdAt: new Date().toISOString() },
  { id: 'g_default_3', title: 'Focus sessions this month', icon: '⏱️', color: '#10b981', target: 20, current: 0, unit: 'sessions', dueDate: '', createdAt: new Date().toISOString() },
]

export function useGoals(user) {
  const getStorageKey = useCallback(() => {
    const userId = user?.id || 'guest'
    return `taskflow_${userId}_goals`
  }, [user?.id])

  const load = useCallback(() => {
    try {
      const raw = localStorage.getItem(getStorageKey())
      return raw ? JSON.parse(raw) : DEFAULT_GOALS
    } catch { return DEFAULT_GOALS }
  }, [getStorageKey])

  const save = useCallback((goalsList) => {
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(goalsList))
    } catch (e) {
      console.warn('Failed to save goals', e)
    }
  }, [getStorageKey])

  const [goals, setGoals] = useState(() => load())

  // Reload goals reactively when user session changes
  useEffect(() => {
    setGoals(load())
  }, [user?.id, load])

  const persist = useCallback((next) => {
    setGoals(next)
    save(next)
  }, [save])

  const addGoal = useCallback((data) => {
    setGoals(prev => {
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
      save(next)
      return next
    })
  }, [save])

  const increment = useCallback((id, by = 1) => {
    setGoals(prev => {
      const next = prev.map(g =>
        g.id === id ? { ...g, current: Math.min(g.current + by, g.target) } : g
      )
      save(next)
      return next
    })
  }, [save])

  const decrement = useCallback((id) => {
    setGoals(prev => {
      const next = prev.map(g =>
        g.id === id ? { ...g, current: Math.max(g.current - 1, 0) } : g
      )
      save(next)
      return next
    })
  }, [save])

  const deleteGoal = useCallback((id) => {
    setGoals(prev => {
      const next = prev.filter(g => g.id !== id)
      save(next)
      return next
    })
  }, [save])

  const getProgress = (goal) => goal.target > 0 ? Math.round((goal.current / goal.target) * 100) : 0

  return { goals, addGoal, increment, decrement, deleteGoal, getProgress }
}

