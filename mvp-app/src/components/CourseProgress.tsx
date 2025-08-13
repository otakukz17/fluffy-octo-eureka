"use client"

import React, { useEffect, useMemo, useState } from 'react'
import ProgressBar from './ProgressBar'

export default function CourseProgress({ courseId, total }: { courseId: string; total: number }) {
  const [completed, setCompleted] = useState(0)
  const storageKey = `progress:${courseId}`

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey)
      if (raw) {
        const parsed: string[] = JSON.parse(raw)
        setCompleted(parsed.length)
      } else {
        setCompleted(0)
      }
    } catch {
      setCompleted(0)
    }
  }, [storageKey])

  // Update on storage changes (multi-tab support)
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === storageKey) {
        try {
          const parsed: string[] = e.newValue ? JSON.parse(e.newValue) : []
          setCompleted(parsed.length)
        } catch {
          setCompleted(0)
        }
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [storageKey])

  return <ProgressBar completed={completed} total={total} />
}
