import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import crypto from 'node:crypto'

export default async function NewCoursePage() {
  async function createCourse(formData: FormData) {
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

    const id = crypto.randomUUID()
    db.prepare(
      'INSERT INTO courses (id, title, slug, description, price_cents, expert_name, cover_image, status, tags_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(id, title, slug, description, price_cents, expert_name, cover_image, status, tags_json)

    redirect(`/admin`)
  }

  return (
    <section className="mx-auto max-w-3xl py-10">
      <h1 className="text-2xl font-semibold">Новый курс</h1>
      <form action={createCourse} className="mt-6 space-y-4">
        <input name="title" placeholder="Название" required className="w-full rounded-md border p-2" />
        <input name="slug" placeholder="Slug (e.g. 'react-basics')" className="w-full rounded-md border p-2" />
        <input name="expert" placeholder="Эксперт" className="w-full rounded-md border p-2" />
        <input name="cover_image" placeholder="URL обложки" className="w-full rounded-md border p-2" />
        <input name="tags_json" placeholder="Теги (JSON массив)" className="w-full rounded-md border p-2" />
        <input name="price_cents" placeholder="Цена в центах" type="number" className="w-full rounded-md border p-2" />
        <select name="status" defaultValue="draft" className="w-full rounded-md border p-2">
          <option value="draft">Черновик</option>
          <option value="published">Опубликован</option>
          <option value="archived">В архиве</option>
        </select>
        <textarea name="description" placeholder="Описание" className="w-full rounded-md border p-2 h-40" />
        <button className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white">Создать</button>
      </form>
    </section>
  )
}
