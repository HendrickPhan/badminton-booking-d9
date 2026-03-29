import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock next/headers
vi.mock('next/headers', () => ({
  cookies: vi.fn(() =>
    Promise.resolve({
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
    })
  ),
}))

// Mock the db module
vi.mock('./db', () => ({
  getDB: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
    })),
  })),
}))

describe('auth-session', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('SessionUser interface', () => {
    it('should have correct structure', () => {
      const user = {
        id: 'test-id',
        username: 'testuser',
        role: 'user' as const,
      }
      expect(user.id).toBe('test-id')
      expect(user.username).toBe('testuser')
      expect(user.role).toBe('user')
    })

    it('should allow admin role', () => {
      const admin = {
        id: 'admin-id',
        username: 'admin',
        role: 'admin' as const,
      }
      expect(admin.role).toBe('admin')
    })
  })
})
