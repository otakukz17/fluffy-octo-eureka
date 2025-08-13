import { db } from '@/lib/db'
import { Course } from '@/lib/types'

export default async function AdminIndex() {
  const courses = db.prepare('SELECT id, title, status FROM courses ORDER BY created_at DESC').all() as Course[]

  const statusColors = {
    draft: 'bg-yellow-100 text-yellow-800',
    published: 'bg-green-100 text-green-800',
    archived: 'bg-gray-100 text-gray-800',
  }

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
            <div>
                <a href={`/admin/courses/${c.id}`} className="font-medium">{c.title}</a>
                <span className={`ml-3 rounded-full px-2 py-0.5 text-xs ${statusColors[c.status]}`}>{c.status}</span>
            </div>
            <a href={`/admin/courses/${c.id}/lessons/new`} className="text-sm text-indigo-600">+ Урок</a>
          </li>
        ))}
      </ul>
    </section>
  )
}
