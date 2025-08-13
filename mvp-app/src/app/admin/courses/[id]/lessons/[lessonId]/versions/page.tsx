import { db } from '@/lib/db'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'

export default async function LessonVersionsPage({ params }: { params: { id: string; lessonId: string } }) {
  const lesson = db.prepare('SELECT id, title FROM lessons WHERE id = ? AND course_id = ?').get(params.lessonId, params.id) as any
  if (!lesson) return notFound()

  const versions = db.prepare('SELECT * FROM lesson_versions WHERE lesson_id = ? ORDER BY created_at DESC').all(params.lessonId) as any[]

  async function restoreVersion(formData: FormData) {
    'use server'
    const versionId = formData.get('versionId') as string
    const version = db.prepare('SELECT * FROM lesson_versions WHERE id = ?').get(versionId) as any
    if (!version) return // Or show an error

    db.prepare(
      `UPDATE lessons
       SET title = ?, position = ?, duration_min = ?, content_md = ?, content_json = ?
       WHERE id = ?`
    ).run(version.title, version.position, version.duration_min, version.content_md, version.content_json, params.lessonId)

    redirect(`/admin/courses/${params.id}/lessons/${params.lessonId}`)
  }

  return (
    <section className="mx-auto max-w-5xl py-10">
      <h1 className="text-2xl font-semibold">Версии урока: {lesson.title}</h1>
      <Link href={`/admin/courses/${params.id}/lessons/${params.lessonId}`} className="text-sm text-indigo-600 underline">
        &larr; Назад к редактированию
      </Link>

      <div className="mt-6 space-y-6">
        {versions.map((v) => (
          <div key={v.id} className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
                <h3 className="font-medium">Версия от {new Date(v.created_at).toLocaleString()}</h3>
                <form action={restoreVersion}>
                    <input type="hidden" name="versionId" value={v.id} />
                    <button className="rounded-md bg-gray-200 px-3 py-1 text-sm font-medium text-gray-800">Восстановить</button>
                </form>
            </div>
            <div className="mt-4 space-y-2 text-sm text-gray-700">
                <p><strong>Название:</strong> {v.title}</p>
                <p><strong>Позиция:</strong> {v.position}</p>
                <p><strong>Длительность:</strong> {v.duration_min} мин</p>
                <details>
                    <summary className="cursor-pointer font-medium">Показать контент</summary>
                    <pre className="mt-2 max-h-60 overflow-auto rounded-md bg-gray-50 p-2 text-xs">{v.content_md}</pre>
                    <pre className="mt-2 max-h-60 overflow-auto rounded-md bg-gray-50 p-2 text-xs">{v.content_json ? JSON.stringify(JSON.parse(v.content_json), null, 2) : ''}</pre>
                </details>
            </div>
          </div>
        ))}
        {versions.length === 0 && (
            <p className="text-gray-600">Нет сохраненных версий для этого урока.</p>
        )}
      </div>
    </section>
  )
}
