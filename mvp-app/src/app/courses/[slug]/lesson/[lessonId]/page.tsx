import { db } from '@/lib/db'
import LessonInteractive from '@/components/interactive/LessonInteractive'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Course } from '@/lib/types'
import MarkdownRenderer from '@/components/MarkdownRenderer'

function getYoutubeEmbedUrl(url?: string | null): string | null {
  if (!url) return null
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v')
      return v ? `https://www.youtube.com/embed/${v}` : null
    }
    if (u.hostname.includes('youtu.be')) {
      const id = u.pathname.split('/').filter(Boolean).pop()
      return id ? `https://www.youtube.com/embed/${id}` : null
    }
  } catch {}
  return null
}

export default async function LessonPage({ params }: { params: { slug: string; lessonId: string } }) {
  let course: Course | null = null;
  let lesson: any = null;
  let siblings: any[] = [];

  try {
    course = db.prepare(`
      SELECT id, title, slug
      FROM courses
      WHERE slug = ? AND status = 'published'
    `).get(params.slug) as Course | null;

    if (course) {
      lesson = db
        .prepare(
          'SELECT id, title, position, video_url, duration_min, content_md, content_json FROM lessons WHERE id = ? AND course_id = ?'
        )
        .get(params.lessonId, course.id) as any

      if (lesson) {
        siblings = db
          .prepare('SELECT id, title, position FROM lessons WHERE course_id = ? ORDER BY position ASC')
          .all(course.id) as any[]
      }
    }
  } catch (e) {
    console.error(e)
    return <div>Error loading lesson.</div>
  }

  if (!course || !lesson) {
    return notFound()
  }

  const idx = siblings.findIndex((l) => l.id === lesson.id)
  const prev = idx > 0 ? siblings[idx - 1] : null
  const next = idx < siblings.length - 1 ? siblings[idx + 1] : null

  const embed = lesson.content_json ? null : getYoutubeEmbedUrl(lesson.video_url)

  return (
    <section className="mx-auto max-w-4xl py-10">
      <nav className="mb-6 text-sm text-gray-600">
        <Link href={`/courses/${course.slug}`} className="underline underline-offset-4">{course.title}</Link>
        <span className="mx-2">/</span>
        <span>Урок {lesson.position}</span>
      </nav>

      <h1 className="text-3xl font-semibold">{lesson.title}</h1>
      <div className="mt-1 text-sm text-gray-500">Длительность ~ {lesson.duration_min ?? 0} мин</div>

      {embed ? (
        <div className="mt-6 overflow-hidden rounded-xl border bg-black shadow-sm ring-1 ring-black/5">
          <iframe
            className="aspect-video w-full"
            src={embed}
            title={lesson.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      ) : null}

      {lesson.content_md ? (
        <MarkdownRenderer content={lesson.content_md} />
      ) : null}

      {lesson.content_json ? (
        <div className="mt-8">
          <LessonInteractive lessonId={lesson.id} blocks={JSON.parse(lesson.content_json)} />
        </div>
      ) : null}

      <div className="mt-10 flex items-center justify-between">
        {prev ? (
          <Link
            href={`/courses/${course.slug}/lesson/${prev.id}`}
            className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:bg-gray-50"
          >
            ← {prev.position}. {prev.title}
          </Link>
        ) : <span />}
        {next ? (
          <Link
            href={`/courses/${course.slug}/lesson/${next.id}`}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm ring-1 ring-indigo-600/20 transition hover:-translate-y-0.5 hover:bg-indigo-700"
          >
            {next.position}. {next.title} →
          </Link>
        ) : (
          <form action={async () => { 'use server' }}>
            <Link
              href={`/courses/${course.slug}`}
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm ring-1 ring-green-600/20 transition hover:-translate-y-0.5 hover:bg-green-700"
            >
              К программе курса
            </Link>
          </form>
        )}
      </div>
    </section>
  )
}
