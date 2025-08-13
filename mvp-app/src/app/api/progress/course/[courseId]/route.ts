import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { courseId } = params

    const totalLessons = (db
      .prepare('SELECT COUNT(id) as count FROM lessons WHERE course_id = ?')
      .get(courseId) as any).count

    const completedLessons = (db
      .prepare(
        'SELECT COUNT(lesson_id) as count FROM lesson_completions WHERE user_id = ? AND lesson_id IN (SELECT id FROM lessons WHERE course_id = ?)'
      )
      .get(user.id, courseId) as any).count

    return NextResponse.json({
      total: totalLessons,
      completed: completedLessons,
    })
  } catch (error) {
    console.error('[COURSE_PROGRESS_API]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
