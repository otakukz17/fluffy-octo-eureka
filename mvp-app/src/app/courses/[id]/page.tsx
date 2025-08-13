import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { notFound, redirect } from 'next/navigation'
import CourseProgress from '@/components/CourseProgress'
import LessonChecklist from '@/components/LessonChecklist'

export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const p = await params
  const course = db.prepare('SELECT id, title, description, price_cents, expert_name FROM courses WHERE id = ?').get(p.id) as any
  if (!course) return notFound()

  const lessons = db
    .prepare('SELECT id, title, position, duration_min FROM lessons WHERE course_id = ? ORDER BY position ASC')
    .all(p.id) as any[]

  const user = await getCurrentUser()
  const enrolled = user
    ? (db
        .prepare('SELECT 1 FROM enrollments WHERE user_id = ? AND course_id = ?')
        .get(user.id, course.id) as any)
    : null

  async function enrollAction() {
    'use server'
    const current = await getCurrentUser()
    if (!current) return redirect('/login?message=Login required')
    db.prepare('INSERT OR IGNORE INTO enrollments (user_id, course_id) VALUES (?, ?)').run(current.id, course.id)
    redirect(`/courses/${course.id}`)
  }

  return (
    <section className="mx-auto max-w-6xl py-10">
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <h1 className="text-3xl font-semibold">{course.title}</h1>
          <p className="mt-3 text-gray-700">{course.description}</p>
          <p className="mt-1 text-sm text-gray-500">Эксперт: {course.expert_name}</p>

          <div className="mt-8 space-y-4">
            <h2 className="text-xl font-semibold">Программа</h2>
            <CourseProgress courseId={course.id} total={lessons.length} />
            <LessonChecklist courseId={course.id} lessons={lessons} />
            <div className="text-sm text-gray-600">Общая длительность: {lessons.reduce((a, l) => a + (l.duration_min || 0), 0)} мин</div>
            <div className="pt-2 text-sm">
              Перейти к урокам:
              <ol className="mt-2 space-y-2">
                {lessons.map((l) => (
                  <li key={l.id}>
                    <a href={`/courses/${course.id}/lesson/${l.id}`} className="text-indigo-600 underline underline-offset-4">
                      {l.position}. {l.title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
        <div>
          <div className="sticky top-24 rounded-2xl border bg-white p-6 shadow-sm ring-1 ring-black/5">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">Цена</div>
              <div className="text-lg font-semibold">{(course.price_cents / 100).toFixed(2)} $</div>
            </div>
            {!enrolled ? (
              <form action={enrollAction} className="mt-6">
                <button className="w-full rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm ring-1 ring-indigo-600/20 transition hover:-translate-y-0.5 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  Записаться
                </button>
              </form>
            ) : (
              <div className="mt-6 rounded-md bg-green-50 px-4 py-3 text-sm text-green-800 ring-1 ring-green-200">
                Вы уже записаны на курс
              </div>
            )}
            <div className="mt-6 text-sm text-gray-600">После записи откройте программу и переходите в уроки.</div>
          </div>
        </div>
      </div>
    </section>
  )
}


