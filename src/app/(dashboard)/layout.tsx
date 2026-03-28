import { redirect } from 'next/navigation'
import { getSession, getUserById } from '@/lib/auth-session'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { User } from '@/types/database'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  // Get full user data
  const user = await getUserById(session.id)
  const typedUser = user as User | null
  const isAdmin = session.role === 'admin'

  return (
    <div className="flex min-h-screen">
      <Sidebar isAdmin={isAdmin} />
      <div className="flex flex-1 flex-col">
        <Header user={typedUser} />
        <main className="flex-1 bg-grid bg-gradient-to-br from-background via-background to-muted/30 p-6">
          <div className="mx-auto max-w-7xl animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
