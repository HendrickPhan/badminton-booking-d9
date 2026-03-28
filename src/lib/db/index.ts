import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

// Single backend database connection
let dbClient: ReturnType<typeof createClient<Database>> | null = null

export function getDB() {
  if (dbClient) return dbClient

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }

  dbClient = createClient<Database>(supabaseUrl, supabaseKey)

  return dbClient
}
