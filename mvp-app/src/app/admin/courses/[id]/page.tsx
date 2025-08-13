import { db } from '@/lib/db'
import { notFound, redirect } from 'next/navigation'
import { Course } from '@/lib/types'

export default async function AdminCoursePage({ params }: { params: { id: string } }) {
  const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(params.id) as Course | null
  if (!course) return notFound()

  const lessons = db.prepare('SELECT id, title, position FROM lessons WHERE course_id = ? ORDER BY position ASC').all(course.id) as any[]

  async function updateCourse(formData: FormData) {
    'use server'
    const title = (formData.get('title') as string)?.trim()
    let slug = (formData.get('slug') as string)?.trim()
    const description = (formData.get('description') as string)?.trim()
    const expert_name = (formData.get('expert') as string)?.trim()
    const cover_image = (formData.get('cover_image') as string)?.trim()
    const tags_json = (formData.get('tags_json') as string)?.trim()
    const price_cents = Number(formData.get('price_cents') || 0)
    const status = (formData.get('status') as string) || 'draft'

    const slugify = (str: string) =>
      str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '')

    if (title && !slug) {
      slug = slugify(title)
    }

    db.prepare(
      `UPDATE courses
       SET title = ?, slug = ?, description = ?, price_cents = ?, expert_name = ?, cover_image = ?, status = ?, tags_json = ?
       WHERE id = ?`
    ).run(title, slug, description, price_cents, expert_name, cover_image, status, tags_json, course.id)

    redirect(`/admin/courses/${course.id}`)
  }

  async function deleteCourse() {
      'use server'
      // TODO: Add confirmation dialog on the client
      db.prepare('DELETE FROM courses WHERE id = ?').run(course.id)
      redirect('/admin')
  }

  return (
    <section className="mx-auto max-w-5xl py-10">
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Редактировать курс</h1>
            <form action={deleteCourse}>
                <button className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white">Удалить</button>
            </form>
        </div>

      <form action={updateCourse} className="mt-6 space-y-4">
        <input name="title" defaultValue={course.title} placeholder="Название" required className="w-full rounded-md border p-2" />
        <input name="slug" defaultValue={course.slug ?? ''} placeholder="Slug" className="w-full rounded-md border p-2" />
        <input name="expert" defaultValue={course.expert_name ?? ''} placeholder="Эксперт" className="w-full rounded-md border p-2" />
        <input name="cover_image" defaultValue={course.cover_image ?? ''} placeholder="URL обложки" className="w-full rounded-md border p-2" />
        <input name="tags_json" defaultValue={course.tags_json ?? ''} placeholder="Теги (JSON массив)" className="w-full rounded-md border p-2" />
        <input name="price_cents" defaultValue={course.price_cents} placeholder="Цена в центах" type="number" className="w-full rounded-md border p-2" />
        <select name="status" defaultValue={course.status} className="w-full rounded-md border p-2">
          <option value="draft">Черновик</option>
          <option value="published">Опубликован</option>
          <option value="archived">В архиве</option>
        </select>
        <textarea name="description" defaultValue={course.description ?? ''} placeholder="Описание" className="w-full rounded-md border p-2 h-40" />
        <button className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white">Сохранить</button>
      </form>

      <div className="mt-12">
        <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Уроки</h2>
            <a href={`/admin/courses/${course.id}/lessons/new`} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white">+ Новый урок</a>
        </div>
        <ol className="mt-6 space-y-2">
            {lessons.map(l => (
            <li key={l.id} className="flex items-center justify-between rounded-md border bg-white p-3">
                <a className="font-medium" href={`/admin/courses/${course.id}/lessons/${l.id}`}>{l.position}. {l.title}</a>
            </li>
            ))}
        </ol>
      </div>
    </section>
  )
}
