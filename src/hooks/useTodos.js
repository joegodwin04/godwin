// useTodos.js — Custom hook for all todo state management
import { useState, useCallback, useMemo } from 'react'

const getStorageKey = () => {
  try {
    const user = JSON.parse(localStorage.getItem('tf_user') || '{}')
    return user.email ? `tf_${user.email}_todos` : 'taskflow_todos'
  } catch {
    return 'taskflow_todos'
  }
}

const generateId = () => `todo_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`

const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem(getStorageKey())
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const saveToStorage = (todos) => {
  try {
    localStorage.setItem(getStorageKey(), JSON.stringify(todos))
  } catch (e) {
    console.warn('Failed to save todos', e)
  }
}

export const PRIORITIES = {
  high:   { label: 'High',   color: '#f43f5e', bg: 'rgba(244,63,94,0.1)',   icon: '🔴' },
  medium: { label: 'Medium', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  icon: '🟡' },
  low:    { label: 'Low',    color: '#22d3a5', bg: 'rgba(34,211,165,0.1)',   icon: '🟢' },
}

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 }

export const CATEGORIES = [
  { id: 'work',     label: 'Work',     icon: '💼', color: '#7c6af7' },
  { id: 'personal', label: 'Personal', icon: '🏠', color: '#22d3a5' },
  { id: 'health',   label: 'Health',   icon: '💪', color: '#f43f5e' },
  { id: 'learning', label: 'Learning', icon: '📚', color: '#f59e0b' },
  { id: 'other',    label: 'Other',    icon: '✨', color: '#38bdf8' },
]

export function useTodos() {
  const [todos, setTodos] = useState(loadFromStorage)
  const [filter, setFilter] = useState('all')       // all | active | completed
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('createdAt') // createdAt | dueDate | priority | alpha

  const persist = useCallback((newTodos) => {
    setTodos(newTodos)
    saveToStorage(newTodos)
  }, [])

  const addTodo = useCallback((data) => {
    const newTodo = {
      id: generateId(),
      text: data.text.trim(),
      completed: false,
      priority: data.priority || 'medium',
      category: data.category || 'other',
      dueDate: data.dueDate || null,
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
      completedAt: null,
    }
    persist(prev => {
      const next = [newTodo, ...prev]
      saveToStorage(next)
      return next
    })
  }, [persist])

  const toggleTodo = useCallback((id) => {
    setTodos(prev => {
      const next = prev.map(t =>
        t.id === id
          ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date().toISOString() : null }
          : t
      )
      saveToStorage(next)
      return next
    })
  }, [])

  const deleteTodo = useCallback((id) => {
    setTodos(prev => {
      const next = prev.filter(t => t.id !== id)
      saveToStorage(next)
      return next
    })
  }, [])

  const updateTodo = useCallback((id, updates) => {
    setTodos(prev => {
      const next = prev.map(t => t.id === id ? { ...t, ...updates } : t)
      saveToStorage(next)
      return next
    })
  }, [])

  const clearCompleted = useCallback(() => {
    setTodos(prev => {
      const next = prev.filter(t => !t.completed)
      saveToStorage(next)
      return next
    })
  }, [])

  const reorderTodo = useCallback((fromIndex, toIndex) => {
    setTodos(prev => {
      const next = [...prev]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      saveToStorage(next)
      return next
    })
  }, [])

  const filteredTodos = useMemo(() => {
    let result = [...todos]

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(t =>
        t.text.toLowerCase().includes(q) ||
        t.notes.toLowerCase().includes(q)
      )
    }

    // Status filter
    if (filter === 'active') result = result.filter(t => !t.completed)
    if (filter === 'completed') result = result.filter(t => t.completed)

    // Category filter
    if (categoryFilter !== 'all') result = result.filter(t => t.category === categoryFilter)

    // Priority filter
    if (priorityFilter !== 'all') result = result.filter(t => t.priority === priorityFilter)

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'priority') return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
      if (sortBy === 'dueDate') {
        if (!a.dueDate && !b.dueDate) return 0
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return new Date(a.dueDate) - new Date(b.dueDate)
      }
      if (sortBy === 'alpha') return a.text.localeCompare(b.text)
      // createdAt (default)
      return new Date(b.createdAt) - new Date(a.createdAt)
    })

    return result
  }, [todos, filter, categoryFilter, priorityFilter, searchQuery, sortBy])

  const stats = useMemo(() => {
    const total = todos.length
    const completed = todos.filter(t => t.completed).length
    const active = total - completed
    const overdue = todos.filter(t =>
      !t.completed && t.dueDate && new Date(t.dueDate) < new Date()
    ).length
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0
    return { total, completed, active, overdue, completionRate }
  }, [todos])

  return {
    todos,
    filteredTodos,
    stats,
    filter, setFilter,
    categoryFilter, setCategoryFilter,
    priorityFilter, setPriorityFilter,
    searchQuery, setSearchQuery,
    sortBy, setSortBy,
    addTodo,
    toggleTodo,
    deleteTodo,
    updateTodo,
    clearCompleted,
    reorderTodo,
  }
}
