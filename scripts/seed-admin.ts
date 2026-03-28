import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY are set')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function seedAdmin() {
  const adminEmail = 'mhieu25101998@gmail.com'
  const adminPassword = '@Admin123456'
  const adminUsername = 'Admin'

  console.log('Checking if admin user already exists...')

  // Try to sign in first to check if user exists
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: adminEmail,
    password: adminPassword,
  })

  if (signInData.user) {
    console.log('✅ Admin user already exists and credentials are correct!')

    // Check if profile has admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', signInData.user.id)
      .single()

    if ((profile as { role: string } | null)?.role !== 'admin') {
      console.log('Updating user role to admin...')
      await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', signInData.user.id)
      console.log('✅ Role updated to admin')
    }

    // Sign out
    await supabase.auth.signOut()

    console.log('\n--------------------------------')
    console.log('Email:', adminEmail)
    console.log('Password:', adminPassword)
    console.log('--------------------------------')
    return
  }

  console.log('Creating admin user...')

  // Create user with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: adminEmail,
    password: adminPassword,
    options: {
      data: {
        username: adminUsername,
      },
    },
  })

  if (authError) {
    if (authError.message.includes('already registered')) {
      console.log('\n⚠️  User already exists but password may be different.')
      console.log('If you forgot the password, you can:')
      console.log('1. Go to Supabase Dashboard > Authentication > Users')
      console.log('2. Find the user and click "Send password reset email"')
      console.log('3. Or delete the user and run this script again')
      process.exit(1)
    }

    console.error('❌ Failed to create admin user:', authError.message)
    process.exit(1)
  }

  if (!authData.user) {
    console.error('❌ Failed to create admin user: No user returned')
    process.exit(1)
  }

  console.log('✅ User created successfully!')

  // Update profile to admin role
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ role: 'admin', username: adminUsername, email: adminEmail })
    .eq('id', authData.user.id)

  if (profileError) {
    console.error('⚠️  Failed to update admin profile:', profileError.message)
    console.log('Please manually update the role in Supabase Dashboard')
  } else {
    console.log('✅ Admin role assigned')
  }

  // Sign out
  await supabase.auth.signOut()

  console.log('\n--------------------------------')
  console.log('✅ Admin user created successfully!')
  console.log('--------------------------------')
  console.log('Email:', adminEmail)
  console.log('Password:', adminPassword)
  console.log('--------------------------------')

  if (!authData.session) {
    console.log('\n⚠️  IMPORTANT: Email confirmation may be required.')
    console.log('Check your email or go to Supabase Dashboard > Authentication > Users')
    console.log('to manually confirm the email.')
  }
}

seedAdmin()
  .then(() => {
    console.log('\n✅ Seed completed.')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  })
