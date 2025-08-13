"use client"

import React, { useEffect, useMemo, useState } from 'react'
import CodeRunner from './CodeRunner'
import MonacoRunner from './MonacoRunner'
import SqlPlayground from './SqlPlayground'

export type Block =
  | { type: 'theory'; title: string; text: string }
  | { type: 'quiz_mcq'; title: string; question: string; options: string[]; correctIndex: number }
  | { type: 'code_task'; title: string; prompt: string; starter?: string; checkRegex?: string; tips?: string[] }
  | { type: 'code_runner'; title: string; initialHtml?: string; initialCss?: string; initialJs?: string; testScript?: string }
  | { type: 'monaco'; title: string; language?: 'javascript' | 'typescript'; starter?: string; hiddenTests?: { name: string; code: string }[] }
  | { type: 'sql'; title: string; schema?: string; task?: string; starter?: string; tests?: string[] }
  | { type: 'reflection'; title: string; prompt: string }

function classNames(...xs: (string | false | null | undefined)[]) {
  return xs.filter(Boolean).join(' ')
}

export default function LessonInteractive({ lessonId, blocks }: { lessonId: string; blocks: Block[] }) {
  const storageKey = `lesson:${lessonId}:state`
  const [state, setState] = useState<Record<string, any>>({})
  const [syncing, setSyncing] = useState(false)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) setState(JSON.parse(raw))
    } catch {}
    // fetch server state
    ;(async () => {
      try {
        const res = await fetch(`/api/lesson-progress?lessonId=${lessonId}`)
        if (res.ok) {
          const j = await res.json()
          if (j?.data) setState(j.data)
          if (j?.completed) setCompleted(true)
        }
      } catch {}
    })()
  }, [storageKey])

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state))
    } catch {}
  }, [state, storageKey])

  function setField(key: string, value: any) {
    setState((s) => ({ ...s, [key]: value }))
  }

  async function syncToServer(done?: boolean) {
    setSyncing(true)
    try {
      await fetch('/api/lesson-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId, data: state, completed: done ?? completed }),
      })
      if (done) setCompleted(true)
    } catch {
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-lg border bg-white p-3 text-sm text-gray-700">
        <div>
          Статус урока: {completed ? <span className="text-green-700 font-medium">завершён</span> : <span className="text-gray-700">в процессе</span>}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => syncToServer(false)} disabled={syncing} className="rounded-md bg-white px-3 py-1.5 shadow-sm ring-1 ring-black/5">Сохранить</button>
          <button onClick={() => syncToServer(true)} disabled={syncing} className="rounded-md bg-indigo-600 px-3 py-1.5 text-white shadow-sm ring-1 ring-indigo-600/20">Отметить завершённым</button>
        </div>
      </div>
      {blocks.map((b, i) => {
        const key = `${i}:${b.type}`
        if (b.type === 'theory') {
          return (
            <section key={key} className="rounded-xl border bg-white p-5 shadow-sm ring-1 ring-black/5">
              <h3 className="text-lg font-semibold">{b.title}</h3>
              <p className="mt-2 text-gray-700 whitespace-pre-line">{b.text}</p>
            </section>
          )
        }
        if (b.type === 'quiz_mcq') {
          const selected: number | null = state[key]?.selected ?? null
          const submitted: boolean = state[key]?.submitted ?? false
          const correct = submitted && selected === b.correctIndex
          return (
            <section key={key} className="rounded-xl border bg-white p-5 shadow-sm ring-1 ring-black/5">
              <h3 className="text-lg font-semibold">{b.title}</h3>
              <p className="mt-2 text-gray-700">{b.question}</p>
              <div className="mt-3 space-y-2">
                {b.options.map((opt, idx) => (
                  <label key={idx} className={classNames('flex items-center gap-3 rounded-md border p-3', submitted ? (idx === b.correctIndex ? 'border-green-300 bg-green-50' : idx === selected ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white') : 'border-gray-200 bg-white')}>
                    <input
                      type="radio"
                      name={key}
                      checked={selected === idx}
                      onChange={() => setField(key, { ...state[key], selected: idx })}
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-3">
                <button
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm ring-1 ring-indigo-600/20"
                  onClick={() => setField(key, { ...state[key], submitted: true })}
                  disabled={selected == null}
                >
                  Проверить
                </button>
                {submitted && (
                  <span className={classNames('text-sm font-medium', correct ? 'text-green-700' : 'text-red-700')}>
                    {correct ? 'Верно!' : 'Неверно, попробуйте ещё раз'}
                  </span>
                )}
              </div>
            </section>
          )
        }
        if (b.type === 'code_task') {
          const value: string = state[key]?.value ?? (b.starter ?? '')
          const submitted: boolean = state[key]?.submitted ?? false
          const ok = b.checkRegex ? new RegExp(b.checkRegex, 'i').test(value.trim()) : value.trim().length > 0
          return (
            <section key={key} className="rounded-xl border bg-white p-5 shadow-sm ring-1 ring-black/5">
              <h3 className="text-lg font-semibold">{b.title}</h3>
              <p className="mt-2 text-gray-700">{b.prompt}</p>
              <textarea
                className="mt-3 h-32 w-full rounded-md border border-gray-300 p-3 font-mono text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={value}
                onChange={(e) => setField(key, { ...state[key], value: e.target.value })}
              />
              <div className="mt-2 flex items-center gap-3">
                <button
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm ring-1 ring-indigo-600/20"
                  onClick={() => setField(key, { ...state[key], submitted: true })}
                >
                  Проверить
                </button>
                {submitted && (
                  <span className={classNames('text-sm font-medium', ok ? 'text-green-700' : 'text-red-700')}>
                    {ok ? 'Задание выполнено' : 'Не похоже на верный ответ, подсказки ниже'}
                  </span>
                )}
              </div>
              {!ok && b.tips?.length ? (
                <ul className="mt-2 list-disc pl-5 text-sm text-gray-600">
                  {b.tips.map((t, i2) => (
                    <li key={i2}>{t}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          )
        }
        if (b.type === 'code_runner') {
          return (
            <CodeRunner
              key={key}
              lessonId={lessonId}
              runnerId={`${lessonId}:${i}`}
              title={b.title}
              initialHtml={b.initialHtml}
              initialCss={b.initialCss}
              initialJs={b.initialJs}
              testScript={b.testScript}
            />
          )
        }
        if (b.type === 'monaco') {
          return (
            <MonacoRunner
              key={key}
              lessonId={lessonId}
              title={b.title}
              language={b.language}
              starter={b.starter}
              hiddenTests={b.hiddenTests}
            />
          )
        }
        if (b.type === 'sql') {
          return (
            <SqlPlayground
              key={key}
              lessonId={lessonId}
              title={b.title}
              schema={b.schema}
              task={b.task}
              starter={b.starter}
              tests={b.tests}
            />
          )
        }
        if (b.type === 'reflection') {
          const value: string = state[key]?.value ?? ''
          return (
            <section key={key} className="rounded-xl border bg-white p-5 shadow-sm ring-1 ring-black/5">
              <h3 className="text-lg font-semibold">{b.title}</h3>
              <p className="mt-2 text-gray-700">{b.prompt}</p>
              <textarea
                className="mt-3 h-24 w-full rounded-md border border-gray-300 p-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={value}
                onChange={(e) => setField(key, { value: e.target.value })}
                placeholder="Ваши мысли... (сохраняется автоматически)"
              />
            </section>
          )
        }
        return null
      })}
    </div>
  )
}
