import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { notFound, redirect } from 'next/navigation'

export default async function VersionViewPage({ params }: { params: Promise<{ id: string; lessonId: string; verId: string }> }) {
  const p = await params
  const user = await getCurrentUser()
  if (!user || user.role !== 'admin') return redirect('/login?message=Admin only')
  const ver = db.prepare('SELECT * FROM lesson_versions WHERE id = ?').get(p.verId) as any
  if (!ver) return notFound()

  async function restore() {
    'use server'
    db.prepare('UPDATE lessons SET title=?, position=?, duration_min=?, content_md=?, content_json=? WHERE id=?')
      .run(ver.title, ver.position, ver.duration_min, ver.content_md, ver.content_json, ver.lesson_id)
    redirect(`/admin/courses/${p.id}/lessons/${p.lessonId}`)
  }

  return (
    <section className="mx-auto max-w-3xl py-10">
      <h1 className="text-2xl font-semibold">Версия от {new Date(ver.created_at).toLocaleString()}</h1>
      <div className="mt-4 space-y-4">
        <div className="rounded-md border bg-white p-3">
          <div className="text-sm font-medium text-gray-700">Заголовок</div>
          <div>{ver.title}</div>
        </div>
        <div className="rounded-md border bg-white p-3">
          <div className="text-sm font-medium text-gray-700">Позиция / Длительность</div>
          <div>{ver.position} / {ver.duration_min} мин</div>
        </div>
        <div className="rounded-md border bg-white p-3">
          <div className="text-sm font-medium text-gray-700">Теория (Markdown)</div>
          <pre className="whitespace-pre-wrap break-words text-sm">{ver.content_md || '—'}</pre>
        </div>
        <div className="rounded-md border bg-white p-3">
          <div className="text-sm font-medium text-gray-700">Интерактивные блоки (JSON)</div>
          <pre className="max-h-60 overflow-auto rounded bg-gray-50 p-3 text-xs">{ver.content_json || '[]'}</pre>
        </div>
        <form action={restore}>
          <button className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white">Восстановить эту версию</button>
        </form>
      </div>
    </section>
  )
}
