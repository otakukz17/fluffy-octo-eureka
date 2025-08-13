import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'

const lessonProgressSchema = z.object({
  lessonId: z.string(),
  data: z.record(z.any()).optional(),
  completed: z.boolean().optional(),
  score: z.number().optional(),
  attempts: z.number().optional(),
  timeSpentSec: z.number().optional(),
})

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const json = await req.json()
    const body = lessonProgressSchema.parse(json)

    const { lessonId, data, completed, score, attempts, timeSpentSec } = body

    // UPSERT into lesson_progress
    db.prepare(
      `INSERT INTO lesson_progress (user_id, lesson_id, data_json, completed, score, attempts, time_spent_sec, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(user_id, lesson_id) DO UPDATE SET
         data_json = excluded.data_json,
         completed = excluded.completed,
         score = excluded.score,
         attempts = excluded.attempts,
         time_spent_sec = excluded.time_spent_sec,
         updated_at = CURRENT_TIMESTAMP`
    ).run(
      user.id,
      lessonId,
      data ? JSON.stringify(data) : null,
      completed ? 1 : 0,
      score,
      attempts,
      timeSpentSec
    )

    if (completed) {
      db.prepare(
        'INSERT OR IGNORE INTO lesson_completions (user_id, lesson_id, completed_at) VALUES (?, ?, CURRENT_TIMESTAMP)'
      ).run(user.id, lessonId)
    } else {
      // If the lesson is marked as not completed, we should remove it from the completions table
      db.prepare(
        'DELETE FROM lesson_completions WHERE user_id = ? AND lesson_id = ?'
      ).run(user.id, lessonId)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 400 })
    }
    console.error('[LESSON_PROGRESS_API]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function GET(req: Request) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const lessonId = searchParams.get('lessonId')

        if (!lessonId) {
            return new NextResponse('Lesson ID is required', { status: 400 })
        }

        const progress = db.prepare(
            'SELECT data_json, completed FROM lesson_progress WHERE user_id = ? AND lesson_id = ?'
        ).get(user.id, lessonId) as any

        if (!progress) {
            return NextResponse.json({ data: null, completed: false })
        }

        return NextResponse.json({
            data: progress.data_json ? JSON.parse(progress.data_json) : null,
            completed: progress.completed === 1,
        })
    } catch (error) {
        console.error('[LESSON_PROGRESS_API]', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
