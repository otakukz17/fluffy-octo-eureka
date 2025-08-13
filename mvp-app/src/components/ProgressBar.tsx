"use client"

import React from 'react'

export default function ProgressBar({ completed, total, label }: { completed: number; total: number; label?: string }) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
  return (
    <div className="w-full">
      <div className="mb-1 flex items-center justify-between text-xs text-gray-600">
        <span>{label ?? 'Прогресс'}</span>
        <span>{completed}/{total} • {percentage}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-200">
        <div
          className="h-2 rounded-full bg-indigo-600 transition-[width] duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
