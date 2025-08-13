import { db } from '@/lib/db'
import CourseCatalogClient from '@/components/CourseCatalogClient'

export const dynamic = 'force-dynamic'

export default function CoursesPage() {
  const courses = db
    .prepare('SELECT id, title, description, price_cents, expert_name, created_at FROM courses ORDER BY datetime(created_at) DESC')
    .all() as any[]
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


