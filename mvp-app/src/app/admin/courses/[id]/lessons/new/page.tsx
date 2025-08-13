import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import BlocksEditor from '@/components/admin/BlocksEditor'
import crypto from 'node:crypto'

export default async function NewLessonPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  // The layout already protects this page, but we need the user object.
  if (!user) return redirect('/login')

  async function createLesson(formData: FormData) {
    'use server'
    const title = (formData.get('title') as string)?.trim()
    const position = Number(formData.get('position') || 1)
    const duration_min = Number(formData.get('duration_min') || 30)
    const status = (formData.get('status') as string) || 'draft'
    const content_md = (formData.get('content_md') as string) || null
    const content_json = (formData.get('content_json') as string) || null
    const id = crypto.randomUUID()

    db.prepare(
      `INSERT INTO lessons (id, course_id, title, position, duration_min, content_md, content_json, status, author_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(id, params.id, title, position, duration_min, content_md, content_json, status, user.id)

    redirect(`/admin/courses/${params.id}`)
  }

  return (
    <section className="mx-auto max-w-3xl py-10">
      <h1 className="text-2xl font-semibold">Новый урок</h1>
      <form action={createLesson} className="mt-6 space-y-4">
        <input name="title" placeholder="Название урока" required className="w-full rounded-md border p-2" />
        <input name="position" type="number" placeholder="Порядковый номер" className="w-full rounded-md border p-2" />
        <input name="duration_min" type="number" placeholder="Длительность (мин)" className="w-full rounded-md border p-2" />
        <select name="status" defaultValue="draft" className="w-full rounded-md border p-2">
          <option value="draft">Черновик</option>
          <option value="published">Опубликован</option>
        </select>
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
