import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { notFound, redirect } from 'next/navigation'
import BlocksEditor from '@/components/admin/BlocksEditor'

export default async function AdminLessonPage({ params }: { params: Promise<{ id: string; lessonId: string }> }) {
  const p = await params
  const user = await getCurrentUser()
  if (!user || user.role !== 'admin') return redirect('/login?message=Admin only')
  const lesson = db.prepare('SELECT id, title, position, duration_min, content_md, content_json FROM lessons WHERE id = ? AND course_id = ?').get(p.lessonId, p.id) as any
  if (!lesson) return notFound()

  async function save(formData: FormData) {
    'use server'
    const title = (formData.get('title') as string)?.trim()
    const position = Number(formData.get('position') || lesson.position)
    const duration_min = Number(formData.get('duration_min') || lesson.duration_min)
    const content_md = (formData.get('content_md') as string) || null
    const content_json = (formData.get('content_json') as string) || null
    // version snapshot
    const verId = Math.random().toString(36).slice(2, 12)
    db.prepare('INSERT INTO lesson_versions (id, lesson_id, title, position, duration_min, content_md, content_json) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(verId, lesson.id, lesson.title, lesson.position, lesson.duration_min, lesson.content_md, lesson.content_json)
    db.prepare('UPDATE lessons SET title=?, position=?, duration_min=?, content_md=?, content_json=? WHERE id=?')
      .run(title, position, duration_min, content_md, content_json, lesson.id)
    redirect(`/admin/courses/${p.id}`)
  }

  return (
    <section className="mx-auto max-w-3xl py-10">
      <h1 className="text-2xl font-semibold">Редактирование урока</h1>
      <form action={save} className="mt-6 space-y-4">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-gray-700">Название урока</span>
          <input name="title" defaultValue={lesson.title} className="w-full rounded-md border p-2" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-gray-700">Порядковый номер</span>
          <input name="position" type="number" defaultValue={lesson.position} className="w-full rounded-md border p-2" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-gray-700">Длительность (мин)</span>
          <input name="duration_min" type="number" defaultValue={lesson.duration_min} className="w-full rounded-md border p-2" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-gray-700">Теория (Markdown, ≥ 15 абзацев)</span>
          <textarea name="content_md" defaultValue={lesson.content_md ?? ''} className="h-40 w-full rounded-md border p-2" />
        </label>
        <div>
          <div className="mb-2 text-sm font-medium text-gray-700">Интерактивные блоки</div>
          <BlocksEditor name="content_json" initial={lesson.content_json ? JSON.parse(lesson.content_json) : []} />
        </div>
        <div className="flex items-center gap-3">
          <button className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white">Сохранить</button>
          <a href={`/courses/${p.id}/lesson/${lesson.id}`} className="text-sm text-gray-700 underline">Открыть как студент</a>
          <a href={`/admin/courses/${p.id}/lessons/${lesson.id}/versions`} className="text-sm text-gray-700 underline">Версии</a>
        </div>
      </form>
    </section>
  )
}
