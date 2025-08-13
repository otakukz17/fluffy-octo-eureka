"use client"

import React, { useEffect, useRef, useState } from 'react'
import Editor from '@monaco-editor/react'

export default function MonacoRunner({
  lessonId,
  title,
  language = 'javascript',
  starter = '',
  hiddenTests = [],
}: {
  lessonId: string
  title: string
  language?: 'javascript' | 'typescript'
  starter?: string
  hiddenTests?: { name: string; code: string }[]
}) {
  const [value, setValue] = useState(starter)
  const [running, setRunning] = useState(false)
  const [results, setResults] = useState<{ name: string; ok: boolean; message?: string }[] | null>(null)

  useEffect(() => {
    try { localStorage.setItem(`monaco:${lessonId}`, value) } catch {}
  }, [lessonId, value])
  useEffect(() => {
    try { const raw = localStorage.getItem(`monaco:${lessonId}`); if (raw) setValue(raw) } catch {}
  }, [lessonId])

  async function run() {
    setRunning(true)
    try {
      const res: { name: string; ok: boolean; message?: string }[] = []
      for (const t of hiddenTests) {
        try {
          // eslint-disable-next-line no-new-func
          const fn = new Function('code', `${t.code}`)
          const ok = !!fn(value)
          res.push({ name: t.name, ok, message: ok ? 'OK' : 'Failed' })
        } catch (e: any) {
          res.push({ name: t.name, ok: false, message: e?.message || 'Error' })
        }
      }
      setResults(res)
    } finally {
      setRunning(false)
    }
  }

  const score = results ? results.filter(r => r.ok).length : 0

  return (
    <section className="rounded-xl border bg-white p-5 shadow-sm ring-1 ring-black/5">
      <div className="mb-3 text-lg font-semibold">{title}</div>
      <div className="h-64 overflow-hidden rounded-md border">
        <Editor height="100%" defaultLanguage={language} value={value} onChange={(v) => setValue(v ?? '')} theme="vs-dark" options={{ minimap: { enabled: false }, fontSize: 13 }} />
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button onClick={run} disabled={running} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm ring-1 ring-indigo-600/20">Запустить тесты</button>
        {results && (
          <span className="text-sm">Пройдено: <span className="font-medium">{score}</span> / {results.length}</span>
        )}
      </div>
      {results && (
        <ul className="mt-2 space-y-1 text-sm">
          {results.map((r, i) => (
            <li key={i} className={r.ok ? 'text-green-700' : 'text-red-700'}>
              {r.ok ? '✓' : '✗'} {r.name} {r.message ? `— ${r.message}` : ''}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
