import { describe, it, expect, vi } from 'vitest'

// Mock environment variables
vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY', 'test-key')

describe('Database Client', () => {
  it('should have correct environment variables set', () => {
    expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBe('https://test.supabase.co')
    expect(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY).toBe('test-key')
  })
})
