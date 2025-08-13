import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    return redirect('/login?message=Требуется авторизация')
  }

  if (user.role !== 'admin') {
    // Or a proper "unauthorized" page
    return redirect('/?message=Недостаточно прав')
  }

  return <>{children}</>
}
