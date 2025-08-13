import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { notFound, redirect } from 'next/navigation'

export default async function VersionsPage({ params }: { params: Promise<{ id: string; lessonId: string }> }) {
  const p = await params
  const user = await getCurrentUser()
  if (!user || user.role !== 'admin') return redirect('/login?message=Admin only')
  const lesson = db.prepare('SELECT id, title FROM lessons WHERE id = ? AND course_id = ?').get(p.lessonId, p.id) as any
  if (!lesson) return notFound()
  const versions = db.prepare('SELECT id, created_at FROM lesson_versions WHERE lesson_id = ? ORDER BY created_at DESC').all(lesson.id) as any[]

  return (
    <section className="mx-auto max-w-3xl py-10">
      <h1 className="text-2xl font-semibold">Версии: {lesson.title}</h1>
      <ul className="mt-6 space-y-2">
        {versions.map((v) => (
          <li key={v.id} className="flex items-center justify-between rounded-md border bg-white p-3">
            <span className="text-sm text-gray-700">{new Date(v.created_at).toLocaleString()}</span>
            <a href={`/admin/courses/${p.id}/lessons/${lesson.id}/versions/${v.id}`} className="text-sm text-indigo-600">Просмотр</a>
          </li>
        ))}
        {versions.length === 0 && <li className="text-sm text-gray-600">Пока нет версий</li>}
      </ul>
    </section>
  )
}
