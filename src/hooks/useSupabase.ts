'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface SessionUser {
  id: string
  username: string
  role: 'user' | 'admin'
}

// Client-side hook for fetching data via API
export function useSupabase() {
  return {
    from: (table: string) => ({
      select: () => fetchAPI(table, 'GET'),
      insert: (data: unknown) => fetchAPI(table, 'POST', data),
      update: (data: unknown) => ({
        eq: (column: string, value: string) => fetchAPI(`${table}?${column}=${value}`, 'PUT', data),
      }),
      delete: () => ({
        eq: (column: string, value: string) => fetchAPI(`${table}?${column}=${value}`, 'DELETE'),
      }),
    }),
    auth: {
      getUser: async () => {
        const response = await fetch('/api/auth/me')
        const data = await response.json()
        return { data: { user: data.user || null } }
      },
    },
  }
}

async function fetchAPI(endpoint: string, method: string, data?: unknown) {
  const response = await fetch(`/api/${endpoint}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: data ? JSON.stringify(data) : undefined,
  })
  return response.json()
}

export function useSession() {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchSession = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchSession()
  }, [fetchSession])

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    router.push('/login')
  }

  return { user, loading, logout, refresh: fetchSession }
}
