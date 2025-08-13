import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import BlocksEditor from '@/components/admin/BlocksEditor'

export default async function NewLessonPage({ params }: { params: Promise<{ id: string }> }) {
  const p = await params
  const user = await getCurrentUser()
  if (!user || user.role !== 'admin') return redirect('/login?message=Admin only')

  async function createLesson(formData: FormData) {
    'use server'
    const title = (formData.get('title') as string)?.trim()
    const position = Number(formData.get('position') || 1)
    const duration_min = Number(formData.get('duration_min') || 30)
    const content_md = (formData.get('content_md') as string) || null
    const content_json = (formData.get('content_json') as string) || null
    const id = Math.random().toString(36).slice(2, 12)
    db.prepare('INSERT INTO lessons (id, course_id, title, video_url, position) VALUES (?, ?, ?, ?, ?)').run(id, p.id, title, null, position)
    db.prepare('UPDATE lessons SET duration_min = ?, content_md = ?, content_json = ? WHERE id = ?').run(duration_min, content_md, content_json, id)
    redirect(`/admin/courses/${p.id}`)
  }

  return (
    <section className="mx-auto max-w-3xl py-10">
      <h1 className="text-2xl font-semibold">Новый урок</h1>
      <form action={createLesson} className="mt-6 space-y-4">
        <input name="title" placeholder="Название урока" required className="w-full rounded-md border p-2" />
        <input name="position" type="number" placeholder="Порядковый номер" className="w-full rounded-md border p-2" />
        <input name="duration_min" type="number" placeholder="Длительность (мин)" className="w-full rounded-md border p-2" />
        <textarea name="content_md" placeholder="Теория (Markdown, ≥ 15 абзацев)" className="h-40 w-full rounded-md border p-2" />
        <div>
          <div className="mb-2 text-sm font-medium text-gray-700">Интерактивные блоки</div>
          <BlocksEditor name="content_json" />
        </div>
        <button className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white">Создать</button>
      </form>
      <p className="mt-4 text-sm text-gray-600">Подсказка: можно миксовать content_md (теория) и content_json (интерактив). Если указаны оба — показываем интерактив.</p>
    </section>
  )
}
