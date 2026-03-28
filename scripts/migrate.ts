import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function runMigration() {
  console.log('🚀 Running database migration...\n')

  // Read the SQL file
  const sqlPath = resolve(process.cwd(), 'supabase/fix-profiles.sql')
  let sql: string

  try {
    sql = readFileSync(sqlPath, 'utf-8')
    console.log('📄 Found SQL file: supabase/fix-profiles.sql\n')
  } catch {
    console.error('❌ Could not find supabase/fix-profiles.sql')
    console.log('\n📝 Creating inline migration...\n')
    sql = getInlineSQL()
  }

  // Split SQL into individual statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))

  let successCount = 0
  let errorCount = 0

  for (const statement of statements) {
    if (!statement) continue

    try {
      // Execute using RPC
      const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' })

      if (error) {
        // Try direct table operations instead
        console.log(`⚠️  Statement skipped (expected): ${statement.substring(0, 60)}...`)
        continue
      }
      successCount++
    } catch {
      // Expected for DDL statements via client
    }
  }

  // Since we can't run DDL via client, let's use the REST API approach
  console.log('📝 Please run this SQL manually in Supabase SQL Editor:\n')
  console.log('─'.repeat(60))
  console.log(sql)
  console.log('─'.repeat(60))
  console.log('\n📖 Instructions:')
  console.log('1. Go to: https://supabase.com/dashboard')
  console.log('2. Select your project')
  console.log('3. Go to: SQL Editor')
  console.log('4. Paste the SQL above and click "Run"\n')

  // Try to verify tables exist
  console.log('🔍 Checking if tables exist...')

  const { error: profilesError } = await supabase
    .from('profiles')
    .select('count')
    .limit(1)

  if (profilesError) {
    console.log('❌ profiles table does not exist yet')
    console.log('   → Run the SQL in Supabase Dashboard\n')
  } else {
    console.log('✅ profiles table exists!')

    // Check admin user
    const { data: adminCheck } = await supabase
      .from('profiles')
      .select('id, username, email, role')
      .eq('email', 'mhieu25101998@gmail.com')
      .single()

    if (adminCheck) {
      console.log(`✅ Admin user found: ${adminCheck.username} (${adminCheck.role})`)
    } else {
      console.log('⚠️  Admin user not found. Make sure to sign up first.')
    }
  }
}

function getInlineSQL(): string {
  return `
-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can insert profiles" ON profiles FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  OR NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid())
);
CREATE POLICY "Admins can update all profiles" ON profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  OR auth.uid() = id
);

-- Create trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Set admin user
INSERT INTO profiles (id, username, email, role)
SELECT
  id,
  COALESCE(raw_user_meta_data->>'username', split_part(email, '@', 1)),
  email,
  'admin'
FROM auth.users
WHERE email = 'mhieu25101998@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  email = EXCLUDED.email;
`
}

runMigration()
  .then(() => {
    console.log('\n✅ Migration script completed.')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error)
    process.exit(1)
  })
