import { db } from '@/lib/db'
import CourseCatalogClient from '@/components/CourseCatalogClient'

export const dynamic = 'force-dynamic'

import { Course } from '@/lib/types'

export default async function CoursesPage() {
  let courses: Course[] = []
  try {
    courses = db
      .prepare(
        `SELECT id, title, slug, description, cover_image, price_cents, expert_name, status, tags_json, created_at
         FROM courses
         WHERE status = 'published'
         ORDER BY datetime(created_at) DESC`
      )
      .all() as Course[]
  } catch (e) {
    console.error(e)
    // Render an error state
    return (
      <section className="mx-auto max-w-6xl py-10">
        <h1 className="text-3xl font-semibold">Каталог курсов</h1>
        <div className="mt-6 rounded-2xl border border-red-300 bg-red-50 p-6 text-red-700 shadow-sm ring-1 ring-black/5">
          Не удалось загрузить курсы. Попробуйте обновить страницу.
        </div>
      </section>
    )
  }

  if (courses.length === 0) {
    return (
      <section className="mx-auto max-w-6xl py-10">
        <h1 className="text-3xl font-semibold">Каталог курсов</h1>
        <div className="mt-6 rounded-2xl border bg-white p-6 text-gray-700 shadow-sm ring-1 ring-black/5">
          Сейчас нет доступных курсов. Загляните попозже!
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-6xl py-10">
      <div className="flex items-end justify-between">
        <h1 className="text-3xl font-semibold">Каталог курсов</h1>
        <div className="text-sm text-gray-600">{courses.length} курсов</div>
      </div>
      <CourseCatalogClient initial={courses} />
    </section>
  )
}


