import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import CourseProgress from '@/components/CourseProgress'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) return redirect('/login?message=Login required')
  const courses = db
    .prepare(
      `SELECT c.id, c.title, c.expert_name,
              (SELECT COUNT(1) FROM lessons l WHERE l.course_id = c.id) as total_lessons
       FROM courses c
       JOIN enrollments e ON e.course_id = c.id
       WHERE e.user_id = ?
       ORDER BY e.created_at DESC`
    )
    .all(user.id) as any[]

  return (
    <section className="mx-auto max-w-6xl py-10">
      <h1 className="text-2xl font-semibold">Мои курсы</h1>
      {courses.length === 0 ? (
        <div className="mt-6 rounded-2xl border bg-white p-6 text-gray-700 shadow-sm ring-1 ring-black/5">
          Пока нет курсов. Перейдите в каталог и запишитесь на первый курс.
        </div>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <a key={c.id} href={`/courses/${c.id}`} className="block rounded-2xl border bg-white p-6 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="font-medium">{c.title}</div>
              <div className="mt-1 text-sm text-gray-600">Эксперт: {c.expert_name}</div>
              <div className="mt-4" suppressHydrationWarning>
                <CourseProgress courseId={c.id} total={c.total_lessons} />
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  )
}


