import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const lessonId = url.searchParams.get('lessonId')
  if (!lessonId) return NextResponse.json({ error: 'lessonId required' }, { status: 400 })
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const row = db.prepare('SELECT data_json, completed FROM lesson_progress WHERE user_id = ? AND lesson_id = ?').get(user.id, lessonId) as any
  return NextResponse.json({ data: row?.data_json ? JSON.parse(row.data_json) : null, completed: !!row?.completed })
}

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => ({}))
  const { lessonId, data, completed } = body as { lessonId?: string; data?: any; completed?: boolean }
  if (!lessonId) return NextResponse.json({ error: 'lessonId required' }, { status: 400 })
  const dataJson = data ? JSON.stringify(data) : null
  db.prepare(
    'INSERT INTO lesson_progress (user_id, lesson_id, data_json, completed, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP) ON CONFLICT(user_id, lesson_id) DO UPDATE SET data_json=excluded.data_json, completed=excluded.completed, updated_at=CURRENT_TIMESTAMP'
  ).run(user.id, lessonId, dataJson, completed ? 1 : 0)
  return NextResponse.json({ ok: true })
}
