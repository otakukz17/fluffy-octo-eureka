"use client"

import React, { useEffect, useMemo, useState } from 'react'

export default function LessonChecklist({
  lessons,
  initialCompleted = new Set(),
}: {
  lessons: { id: string; title: string; position: number }[]
  initialCompleted?: Set<string>
}) {
  const [doneSet, setDoneSet] = useState<Set<string>>(initialCompleted)
  const [isPending, setIsPending] = useState(false)

  const completedCount = doneSet.size
  const sorted = useMemo(() => [...lessons].sort((a, b) => a.position - b.position), [lessons])

  async function toggle(lessonId: string) {
    setIsPending(true)
    const wasDone = doneSet.has(lessonId)

    // Optimistic update
    const next = new Set(doneSet)
    if (wasDone) next.delete(lessonId)
    else next.add(lessonId)
    setDoneSet(next)

    try {
      await fetch('/api/lesson-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId, completed: !wasDone }),
      })
    } catch (e) {
      // Revert on error
      setDoneSet(doneSet)
      console.error('Failed to update progress', e)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="text-sm text-gray-600">Завершено: {completedCount} из {lessons.length}</div>
      <ol className="space-y-2">
        {sorted.map((l) => {
          const done = doneSet.has(l.id)
          return (
            <li key={l.id} className="flex items-center gap-3 rounded-lg border bg-white px-4 py-3 shadow-sm">
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={done}
                  onChange={() => toggle(l.id)}
                  disabled={isPending}
                  className="peer sr-only"
                />
                <div className="h-5 w-5 rounded-md border border-gray-300 bg-white ring-1 ring-black/5 peer-checked:border-indigo-600 peer-checked:bg-indigo-600 peer-focus:outline-none" />
              </label>
              <span className={done ? 'text-gray-500 line-through' : ''}>
                {l.position}. {l.title}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
