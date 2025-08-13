import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { notFound, redirect } from 'next/navigation'

export default async function AdminCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const p = await params
  const user = await getCurrentUser()
  if (!user || user.role !== 'admin') return redirect('/login?message=Admin only')
  const course = db.prepare('SELECT id, title, description FROM courses WHERE id = ?').get(p.id) as any
  if (!course) return notFound()
  const lessons = db.prepare('SELECT id, title, position FROM lessons WHERE course_id = ? ORDER BY position ASC').all(p.id) as any[]
  return (
    <section className="mx-auto max-w-5xl py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{course.title}</h1>
        <a href={`/admin/courses/${course.id}/lessons/new`} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white">+ Новый урок</a>
      </div>
      <p className="mt-2 text-gray-700">{course.description}</p>
      <ol className="mt-6 space-y-2">
        {lessons.map(l => (
          <li key={l.id} className="flex items-center justify-between rounded-md border bg-white p-3">
            <a className="font-medium" href={`/admin/courses/${course.id}/lessons/${l.id}`}>{l.position}. {l.title}</a>
          </li>
        ))}
      </ol>
    </section>
  )
}
