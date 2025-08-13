"use client"

import React, { useEffect, useMemo, useState } from 'react'

type BlockType =
  | 'theory'
  | 'quiz_mcq'
  | 'code_task'
  | 'code_runner'
  | 'monaco'
  | 'sql'
  | 'reflection'

type AnyBlock = any

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-gray-700">{label}</span>
      {children}
    </label>
  )
}

function JsonPreview({ value }: { value: unknown }) {
  const text = useMemo(() => JSON.stringify(value, null, 2), [value])
  return (
    <pre className="max-h-60 overflow-auto rounded-md border bg-gray-50 p-3 text-xs">
      {text}
    </pre>
  )
}

export default function BlocksEditor({ name = 'content_json', initial }: { name?: string; initial?: AnyBlock[] }) {
  const [blocks, setBlocks] = useState<AnyBlock[]>(() => initial ?? [])
  const [showRaw, setShowRaw] = useState(false)

  useEffect(() => {
    // no‑op for now
  }, [])

  function addBlock(type: BlockType) {
    const base: Record<string, any> = { type }
    switch (type) {
      case 'theory':
        Object.assign(base, { title: 'Теория', text: '' })
        break
      case 'quiz_mcq':
        Object.assign(base, { title: 'Квиз', question: '', options: ['', '', ''], correctIndex: 0 })
        break
      case 'code_task':
        Object.assign(base, { title: 'Задание', prompt: '', starter: '', checkRegex: '', tips: [] as string[] })
        break
      case 'code_runner':
        Object.assign(base, { title: 'HTML/CSS/JS', initialHtml: '', initialCss: '', initialJs: '', testScript: '' })
        break
      case 'monaco':
        Object.assign(base, { title: 'Код', language: 'javascript', starter: '', hiddenTests: [] as { name: string; code: string }[] })
        break
      case 'sql':
        Object.assign(base, { title: 'SQL', schema: '', task: '', starter: '', tests: [] as string[] })
        break
      case 'reflection':
        Object.assign(base, { title: 'Рефлексия', prompt: '' })
        break
    }
    setBlocks((b) => [...b, base])
  }

  function update(idx: number, patch: Record<string, any>) {
    setBlocks((b) => b.map((x, i) => (i === idx ? { ...x, ...patch } : x)))
  }

  function remove(idx: number) {
    setBlocks((b) => b.filter((_, i) => i !== idx))
  }

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-gray-700">Интерактивные блоки</div>
        <div className="flex items-center gap-2">
          <select
            onChange={(e) => {
              const t = e.target.value as BlockType
              if (!t) return
              addBlock(t)
              e.currentTarget.selectedIndex = 0
            }}
            className="rounded-md border px-2 py-1 text-sm"
            defaultValue=""
          >
            <option value="" disabled>
              + Добавить блок
            </option>
            <option value="theory">Теория</option>
            <option value="quiz_mcq">Квиз</option>
            <option value="code_task">Текстовое задание</option>
            <option value="code_runner">HTML/CSS/JS</option>
            <option value="monaco">Код (Monaco)</option>
            <option value="sql">SQL</option>
            <option value="reflection">Рефлексия</option>
          </select>
          <button type="button" onClick={() => setShowRaw((v) => !v)} className="text-sm text-indigo-600">
            {showRaw ? 'Скрыть JSON' : 'Показать JSON'}
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {blocks.map((b, i) => (
          <div key={i} className="rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">#{i + 1} — {b.type}</div>
              <button type="button" onClick={() => remove(i)} className="text-sm text-red-600">Удалить</button>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {b.type === 'theory' && (
                <>
                  <Field label="Заголовок">
                    <input className="w-full rounded-md border p-2" value={b.title} onChange={(e) => update(i, { title: e.target.value })} />
                  </Field>
                  <Field label="Текст (много абзацев)">
                    <textarea className="h-40 w-full rounded-md border p-2" value={b.text} onChange={(e) => update(i, { text: e.target.value })} />
                  </Field>
                </>
              )}
              {b.type === 'quiz_mcq' && (
                <>
                  <Field label="Заголовок">
                    <input className="w-full rounded-md border p-2" value={b.title} onChange={(e) => update(i, { title: e.target.value })} />
                  </Field>
                  <Field label="Вопрос">
                    <input className="w-full rounded-md border p-2" value={b.question} onChange={(e) => update(i, { question: e.target.value })} />
                  </Field>
                  <Field label="Варианты (по одному в строке)">
                    <textarea
                      className="h-28 w-full rounded-md border p-2"
                      value={(b.options || []).join('\n')}
                      onChange={(e) => update(i, { options: e.target.value.split('\n') })}
                    />
                  </Field>
                  <Field label="Индекс правильного ответа (0..N)">
                    <input type="number" className="w-full rounded-md border p-2" value={b.correctIndex ?? 0} onChange={(e) => update(i, { correctIndex: Number(e.target.value) })} />
                  </Field>
                </>
              )}
              {b.type === 'code_task' && (
                <>
                  <Field label="Заголовок">
                    <input className="w-full rounded-md border p-2" value={b.title} onChange={(e) => update(i, { title: e.target.value })} />
                  </Field>
                  <Field label="Задание">
                    <textarea className="h-28 w-full rounded-md border p-2" value={b.prompt} onChange={(e) => update(i, { prompt: e.target.value })} />
                  </Field>
                  <Field label="Стартовый текст (опционально)">
                    <textarea className="h-28 w-full rounded-md border p-2 font-mono text-xs" value={b.starter || ''} onChange={(e) => update(i, { starter: e.target.value })} />
                  </Field>
                  <Field label="Regex для проверки (опционально)">
                    <input className="w-full rounded-md border p-2" value={b.checkRegex || ''} onChange={(e) => update(i, { checkRegex: e.target.value })} />
                  </Field>
                </>
              )}
              {b.type === 'code_runner' && (
                <>
                  <Field label="Заголовок">
                    <input className="w-full rounded-md border p-2" value={b.title} onChange={(e) => update(i, { title: e.target.value })} />
                  </Field>
                  <Field label="HTML">
                    <textarea className="h-28 w-full rounded-md border p-2 font-mono text-xs" value={b.initialHtml || ''} onChange={(e) => update(i, { initialHtml: e.target.value })} />
                  </Field>
                  <Field label="CSS">
                    <textarea className="h-28 w-full rounded-md border p-2 font-mono text-xs" value={b.initialCss || ''} onChange={(e) => update(i, { initialCss: e.target.value })} />
                  </Field>
                  <Field label="JS">
                    <textarea className="h-28 w-full rounded-md border p-2 font-mono text-xs" value={b.initialJs || ''} onChange={(e) => update(i, { initialJs: e.target.value })} />
                  </Field>
                  <Field label="Тест (скрипт JS)">
                    <textarea className="h-28 w-full rounded-md border p-2 font-mono text-xs" value={b.testScript || ''} onChange={(e) => update(i, { testScript: e.target.value })} />
                  </Field>
                </>
              )}
              {b.type === 'monaco' && (
                <>
                  <Field label="Заголовок">
                    <input className="w-full rounded-md border p-2" value={b.title} onChange={(e) => update(i, { title: e.target.value })} />
                  </Field>
                  <Field label="Язык">
                    <select className="w-full rounded-md border p-2" value={b.language || 'javascript'} onChange={(e) => update(i, { language: e.target.value })}>
                      <option value="javascript">JavaScript</option>
                      <option value="typescript">TypeScript</option>
                    </select>
                  </Field>
                  <Field label="Стартовый код">
                    <textarea className="h-28 w-full rounded-md border p-2 font-mono text-xs" value={b.starter || ''} onChange={(e) => update(i, { starter: e.target.value })} />
                  </Field>
                  <Field label="Скрытые тесты (по одному в формате: имя — код функции, возвращающей true/false)">
                    <textarea
                      className="h-28 w-full rounded-md border p-2 font-mono text-xs"
                      value={(b.hiddenTests || []).map((t: any) => `${t.name}|${t.code}`).join('\n')}
                      onChange={(e) => update(i, { hiddenTests: e.target.value.split('\n').filter(Boolean).map(line => { const [name, ...rest] = line.split('|'); return { name, code: rest.join('|') } }) })}
                    />
                  </Field>
                </>
              )}
              {b.type === 'sql' && (
                <>
                  <Field label="Заголовок">
                    <input className="w-full rounded-md border p-2" value={b.title} onChange={(e) => update(i, { title: e.target.value })} />
                  </Field>
                  <Field label="Схема (DDL + начальные INSERT)">
                    <textarea className="h-28 w-full rounded-md border p-2 font-mono text-xs" value={b.schema || ''} onChange={(e) => update(i, { schema: e.target.value })} />
                  </Field>
                  <Field label="Задание">
                    <input className="w-full rounded-md border p-2" value={b.task || ''} onChange={(e) => update(i, { task: e.target.value })} />
                  </Field>
                  <Field label="Стартовый SQL">
                    <textarea className="h-28 w-full rounded-md border p-2 font-mono text-xs" value={b.starter || ''} onChange={(e) => update(i, { starter: e.target.value })} />
                  </Field>
                  <Field label="Тесты (регексы, по одному в строке)">
                    <textarea className="h-28 w-full rounded-md border p-2 font-mono text-xs" value={(b.tests || []).join('\n')} onChange={(e) => update(i, { tests: e.target.value.split('\n').filter(Boolean) })} />
                  </Field>
                </>
              )}
              {b.type === 'reflection' && (
                <>
                  <Field label="Заголовок">
                    <input className="w-full rounded-md border p-2" value={b.title} onChange={(e) => update(i, { title: e.target.value })} />
                  </Field>
                  <Field label="Вопрос">
                    <textarea className="h-28 w-full rounded-md border p-2" value={b.prompt} onChange={(e) => update(i, { prompt: e.target.value })} />
                  </Field>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <input type="hidden" name={name} value={JSON.stringify(blocks)} />

      {showRaw && (
        <div className="mt-4">
          <div className="mb-1 text-sm font-medium text-gray-700">JSON предпросмотр</div>
          <JsonPreview value={blocks} />
        </div>
      )}
    </div>
  )
}
