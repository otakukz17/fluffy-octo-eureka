import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'

export default async function NewCoursePage() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'admin') return redirect('/login?message=Admin only')

  async function createCourse(formData: FormData) {
    'use server'
    const title = (formData.get('title') as string)?.trim()
    const description = (formData.get('description') as string)?.trim()
    const expert_name = (formData.get('expert') as string)?.trim()
    const price_cents = Number(formData.get('price_cents') || 0)
    const id = Math.random().toString(36).slice(2, 12)
    db.prepare('INSERT INTO courses (id, title, description, price_cents, expert_name) VALUES (?, ?, ?, ?, ?)')
      .run(id, title, description, price_cents, expert_name)
    redirect(`/admin`)
  }

  return (
    <section className="mx-auto max-w-3xl py-10">
      <h1 className="text-2xl font-semibold">Новый курс</h1>
      <form action={createCourse} className="mt-6 space-y-4">
        <input name="title" placeholder="Название" required className="w-full rounded-md border p-2" />
        <input name="expert" placeholder="Эксперт" className="w-full rounded-md border p-2" />
        <input name="price_cents" placeholder="Цена в центах" type="number" className="w-full rounded-md border p-2" />
        <textarea name="description" placeholder="Описание" className="w-full rounded-md border p-2 h-40" />
        <button className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white">Создать</button>
      </form>
    </section>
  )
}
