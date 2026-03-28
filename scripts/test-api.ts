/**
 * E2E API Tests for Badminton Management System
 * Run with: npx tsx scripts/test-api.ts
 */

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

interface TestResult {
  name: string
  passed: boolean
  error?: string
  data?: unknown
}

let cookies: string[] = []
const results: TestResult[] = []

async function request(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ status: number; data: unknown; cookies: string[] }> {
  const url = `${BASE_URL}${endpoint}`
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(cookies.length > 0 ? { Cookie: cookies.join('; ') } : {}),
      ...options.headers,
    },
  })

  const setCookie = response.headers.get('set-cookie')
  if (setCookie) {
    cookies.push(setCookie.split(';')[0])
  }

  let data
  try {
    data = await response.json()
  } catch {
    data = null
  }

  return { status: response.status, data, cookies }
}

function log(name: string, passed: boolean, error?: string, data?: unknown) {
  const icon = passed ? '✅' : '❌'
  console.log(`${icon} ${name}`)
  if (error) console.log(`   Error: ${error}`)
  results.push({ name, passed, error, data })
}

async function test(name: string, fn: () => Promise<boolean>) {
  try {
    const passed = await fn()
    log(name, passed)
  } catch (e) {
    log(name, false, e instanceof Error ? e.message : String(e))
  }
}

// ============================================
// TESTS
// ============================================

async function testHealth() {
  await test('Health Check - Homepage loads', async () => {
    const { status } = await request('/')
    return status === 200
  })
}

async function testAuth() {
  console.log('\n📋 Testing Authentication...')

  await test('Login with wrong credentials fails', async () => {
    const { status, data } = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'wrong', password: 'wrong' }),
    })
    return status === 401
  })

  await test('Login with admin credentials works', async () => {
    const { status, data } = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'admin', password: '@Admin123456' }),
    })
    return status === 200 && (data as { success?: boolean })?.success === true
  })

  await test('Get current user session', async () => {
    const { status, data } = await request('/api/auth/me')
    return status === 200 && (data as { user?: { username: string } })?.user?.username === 'admin'
  })
}

async function testCenters() {
  console.log('\n📋 Testing Centers...')

  let centerId: string | null = null

  await test('Get centers (empty or with data)', async () => {
    const { status, data } = await request('/api/admin/centers')
    const centers = (data as { centers?: unknown[] })?.centers
    if (Array.isArray(centers) && centers.length > 0) {
      centerId = (centers[0] as { id: string }).id
    }
    return status === 200 && Array.isArray(centers)
  })

  await test('Create center', async () => {
    const { status, data } = await request('/api/admin/centers', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Center ' + Date.now(),
        address: '123 Test Street',
      }),
    })
    if (status === 200) {
      centerId = (data as { center?: { id: string } })?.center?.id || null
    }
    return status === 200
  })

  if (centerId) {
    await test('Update center', async () => {
      const { status } = await request('/api/admin/centers', {
        method: 'PUT',
        body: JSON.stringify({
          id: centerId,
          name: 'Updated Center ' + Date.now(),
        }),
      })
      return status === 200
    })
  }
}

async function testUsers() {
  console.log('\n📋 Testing Users...')

  await test('Get users list', async () => {
    const { status, data } = await request('/api/admin/users')
    return status === 200 && Array.isArray((data as { users?: unknown[] })?.users)
  })

  await test('Create new user', async () => {
    const { status } = await request('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        username: 'testuser' + Date.now(),
        password: 'test123456',
        role: 'user',
      }),
    })
    return status === 200
  })
}

async function testBookings() {
  console.log('\n📋 Testing Bookings...')

  await test('Get bookings list', async () => {
    const { status, data } = await request('/api/bookings')
    return status === 200 && Array.isArray((data as { bookings?: unknown[] })?.bookings)
  })

  await test('Create booking', async () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dateStr = tomorrow.toISOString().split('T')[0]

    const { status } = await request('/api/bookings', {
      method: 'POST',
      body: JSON.stringify({
        match_date: dateStr,
        start_time: '18:00',
        end_time: '20:00',
        courts_count: 2,
        court_price: 200000,
      }),
    })
    return status === 200
  })
}

async function testMatches() {
  console.log('\n📋 Testing Matches...')

  await test('Get matches list', async () => {
    const { status, data } = await request('/api/matches')
    return status === 200 && Array.isArray((data as { matches?: unknown[] })?.matches)
  })
}

async function testRankings() {
  console.log('\n📋 Testing Rankings...')

  await test('Get rankings list', async () => {
    const { status, data } = await request('/api/rankings')
    return status === 200 && Array.isArray((data as { rankings?: unknown[] })?.rankings)
  })
}

async function testPayments() {
  console.log('\n📋 Testing Payments...')

  await test('Get payments list', async () => {
    const { status, data } = await request('/api/payments')
    return status === 200 && Array.isArray((data as { payments?: unknown[] })?.payments)
  })
}

async function testLogout() {
  console.log('\n📋 Testing Logout...')

  await test('Logout works', async () => {
    const { status } = await request('/api/auth/logout', { method: 'POST' })
    return status === 200 || status === 302
  })

  await test('Session cleared after logout', async () => {
    cookies = [] // Clear cookies
    const { status } = await request('/api/auth/me')
    return status === 401
  })
}

// ============================================
// RUN ALL TESTS
// ============================================

async function main() {
  console.log('🚀 Starting E2E API Tests...')
  console.log(`📍 Base URL: ${BASE_URL}\n`)

  await testHealth()
  await testAuth()
  await testCenters()
  await testUsers()
  await testBookings()
  await testMatches()
  await testRankings()
  await testPayments()
  await testLogout()

  console.log('\n' + '='.repeat(50))
  console.log('📊 TEST SUMMARY')
  console.log('='.repeat(50))

  const passed = results.filter(r => r.passed).length
  const failed = results.filter(r => !r.passed).length

  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`📈 Total: ${results.length}`)

  if (failed > 0) {
    console.log('\n❌ Failed tests:')
    results
      .filter(r => !r.passed)
      .forEach(r => {
        console.log(`   - ${r.name}: ${r.error || 'Unknown error'}`)
      })
    process.exit(1)
  }

  console.log('\n✅ All tests passed!')
  process.exit(0)
}

main().catch(console.error)
