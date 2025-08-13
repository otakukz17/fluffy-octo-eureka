import Link from 'next/link'
import { logout } from '@/app/login/actions'
import { getCurrentUser } from '@/lib/auth'
import ThemeToggle from '@/components/ThemeToggle'

export default async function Header() {
  const user = await getCurrentUser()

  return (
    <header className="sticky top-0 z-40 border-b border-white/50 bg-white/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
      <nav className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="group inline-flex items-center gap-2 text-xl font-semibold">
          <span className="inline-block rounded bg-indigo-600/10 p-1.5 text-indigo-600 ring-1 ring-indigo-600/20 transition group-hover:scale-105">CF</span>
          <span className="tracking-tight">
            <span className="text-gray-900">Career</span>
            <span className="text-indigo-600">First</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/courses" className="text-sm text-gray-700 transition hover:text-gray-900">Курсы</Link>
          <ThemeToggle />
          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-gray-700 sm:inline">{user.email}</span>
              {user.role === 'admin' && (
                <Link href="/admin" className="text-sm text-indigo-600">Админка</Link>
              )}
              <form action={logout}>
                <button className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  Выйти
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm ring-1 ring-indigo-600/20 transition hover:-translate-y-0.5 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Войти
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}
