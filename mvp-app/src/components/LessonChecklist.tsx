"use client"

import React, { useEffect, useMemo, useState } from 'react'

export default function LessonChecklist({
  courseId,
  lessons,
}: {
  courseId: string
  lessons: { id: string; title: string; position: number }[]
}) {
  const storageKey = `progress:${courseId}`
  const [doneSet, setDoneSet] = useState<Set<string>>(new Set())

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey)
      if (raw) {
        const parsed: string[] = JSON.parse(raw)
        setDoneSet(new Set(parsed))
      }
    } catch {}
  }, [storageKey])

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(Array.from(doneSet)))
    } catch {}
  }, [doneSet, storageKey])

  const completedCount = doneSet.size
  const sorted = useMemo(() => [...lessons].sort((a, b) => a.position - b.position), [lessons])

  function toggle(lessonId: string) {
    setDoneSet((prev) => {
      const next = new Set(prev)
      if (next.has(lessonId)) next.delete(lessonId)
      else next.add(lessonId)
      return next
    })
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
