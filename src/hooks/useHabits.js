// useHabits.js — Habit tracking with streaks and daily completions
import { useState, useEffect, useCallback } from 'react'

const DEFAULT_HABITS = [
  { id: 'h_default_1', name: 'Morning workout', icon: '💪', color: '#f43f5e', completions: {}, createdAt: new Date().toISOString() },
  { id: 'h_default_2', name: 'Read 20 minutes', icon: '📚', color: '#f59e0b', completions: {}, createdAt: new Date().toISOString() },
  { id: 'h_default_3', name: 'Drink 8 glasses', icon: '💧', color: '#22d3ee', completions: {}, createdAt: new Date().toISOString() },
]

const today = () => new Date().toISOString().split('T')[0]

const dateStr = (daysAgo = 0) => {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().split('T')[0]
}

export function useHabits(user) {
  const getStorageKey = useCallback(() => {
    const userId = user?.id || 'guest'
    return `taskflow_${userId}_habits`
  }, [user?.id])

  const load = useCallback(() => {
    try {
      const raw = localStorage.getItem(getStorageKey())
      return raw ? JSON.parse(raw) : DEFAULT_HABITS
    } catch { return DEFAULT_HABITS }
  }, [getStorageKey])

  const save = useCallback((habitsList) => {
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(habitsList))
    } catch (e) {
      console.warn('Failed to save habits', e)
    }
  }, [getStorageKey])

  const [habits, setHabits] = useState(() => load())

  // Reload habits reactively when user session changes
  useEffect(() => {
    setHabits(load())
  }, [user?.id, load])

  const persist = useCallback((next) => {
    setHabits(next)
    save(next)
  }, [save])

  const addHabit = useCallback((data) => {
    const h = {
      id: `h_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: data.name.trim(),
      icon: data.icon || '⭐',
      color: data.color || '#7c6af7',
      completions: {},
      createdAt: new Date().toISOString(),
    }
    setHabits(prev => {
      const next = [...prev, h]
      save(next)
      return next
    })
  }, [save])

  const toggleHabit = useCallback((id, date = today()) => {
    setHabits(prev => {
      const next = prev.map(h =>
        h.id === id
          ? { ...h, completions: { ...h.completions, [date]: !h.completions[date] } }
          : h
      )
      save(next)
      return next
    })
  }, [save])

  const deleteHabit = useCallback((id) => {
    setHabits(prev => {
      const next = prev.filter(h => h.id !== id)
      save(next)
      return next
    })
  }, [save])

  // Calculate current streak (consecutive days ending today or yesterday)
  const getStreak = useCallback((habit) => {
    let streak = 0
    for (let i = 0; i < 365; i++) {
      const d = dateStr(i)
      if (habit.completions[d]) streak++
      else if (i > 0) break
    }
    return streak
  }, [])

  // Get last N days as array of { date, label, done }
  const getLastNDays = useCallback((habit, n = 7) => {
    return Array.from({ length: n }, (_, i) => {
      const ago = n - 1 - i
      const d = dateStr(ago)
      const label = new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' })
      return { date: d, label, done: !!habit.completions[d] }
    })
  }, [])

  const completedToday = habits.filter(h => h.completions[today()]).length
  const totalToday = habits.length
  const longestStreak = habits.reduce((max, h) => Math.max(max, getStreak(h)), 0)

  return {
    habits,
    addHabit,
    toggleHabit,
    deleteHabit,
    getStreak,
    getLastNDays,
    completedToday,
    totalToday,
    longestStreak,
    today,
  }
}

