"use client"

import React, { useEffect, useMemo, useState } from 'react'
import ProgressBar from './ProgressBar'

export default function CourseProgress({ courseId, total }: { courseId: string; total: number }) {
  const [completed, setCompleted] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProgress() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/progress/course/${courseId}`);
        if (res.ok) {
          const data = await res.json();
          setCompleted(data.completed || 0);
        }
      } catch (error) {
        console.error('Failed to fetch course progress', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProgress();
  }, [courseId]);

  if (isLoading) {
    // You can return a loader here if you want
    return <ProgressBar completed={0} total={total} />;
  }

  return <ProgressBar completed={completed} total={total} />;
}
