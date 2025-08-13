import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'

export default async function AdminIndex() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'admin') return redirect('/login?message=Admin only')
  const courses = db.prepare('SELECT id, title FROM courses ORDER BY created_at DESC').all() as any[]
  return (
    <section className="mx-auto max-w-6xl py-10">
      <h1 className="text-2xl font-semibold">Админка</h1>
      <div className="mt-6 flex items-center justify-between">
        <div className="text-gray-600">Курсы: {courses.length}</div>
        <a href="/admin/courses/new" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white">+ Новый курс</a>
      </div>
      <ul className="mt-6 divide-y rounded-xl border bg-white shadow-sm">
        {courses.map(c => (
          <li key={c.id} className="flex items-center justify-between px-4 py-3">
            <a href={`/admin/courses/${c.id}`} className="font-medium">{c.title}</a>
            <a href={`/admin/courses/${c.id}/lessons/new`} className="text-sm text-indigo-600">+ Урок</a>
          </li>
        ))}
      </ul>
    </section>
  )
}
