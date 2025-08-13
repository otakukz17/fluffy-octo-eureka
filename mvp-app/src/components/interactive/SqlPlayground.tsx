"use client"

import React, { useEffect, useMemo, useState } from 'react'
import initSqlJs, { Database } from 'sql.js'

export default function SqlPlayground({
  lessonId,
  title,
  schema = 'CREATE TABLE users(id INTEGER, name TEXT); INSERT INTO users VALUES (1, "Ann"), (2, "Bob");',
  task = 'Выберите всех пользователей',
  starter = 'SELECT * FROM users;',
  tests = ['SELECT name FROM users;'],
}: {
  lessonId: string
  title: string
  schema?: string
  task?: string
  starter?: string
  tests?: string[]
}) {
  const [db, setDb] = useState<Database | null>(null)
  const [sql, setSql] = useState(starter)
  const [rows, setRows] = useState<any[] | null>(null)
  const [ok, setOk] = useState<boolean | null>(null)

  useEffect(() => {
    (async () => {
      const SQL = await initSqlJs({ locateFile: (f) => `https://sql.js.org/dist/${f}` })
      const instance = new SQL.Database()
      schema.split(';').map((s) => s.trim()).filter(Boolean).forEach((stmt) => instance.run(stmt))
      setDb(instance)
    })()
  }, [schema])

  function runQuery() {
    if (!db) return
    try {
      const res = db.exec(sql)
      const r = res[0]
      if (r) {
        const map = r.values.map((v) => Object.fromEntries(r.columns.map((c, i) => [c, v[i]])))
        setRows(map)
      } else {
        setRows([])
      }
    } catch (e) {
      setRows([{ error: String(e) } as any])
    }
  }

  function runTests() {
    const pass = tests.every((t) => new RegExp(t, 'i').test(sql))
    setOk(pass)
  }

  return (
    <section className="rounded-xl border bg-white p-5 shadow-sm ring-1 ring-black/5">
      <div className="mb-2 text-lg font-semibold">{title}</div>
      <div className="text-sm text-gray-700">{task}</div>
      <textarea className="mt-3 h-28 w-full rounded-md border p-2 font-mono text-xs" value={sql} onChange={(e) => setSql(e.target.value)} />
      <div className="mt-2 flex items-center gap-2">
        <button onClick={runQuery} className="rounded-md bg-white px-3 py-1.5 text-sm shadow-sm ring-1 ring-black/5">Выполнить</button>
        <button onClick={runTests} className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm ring-1 ring-indigo-600/20">Проверить</button>
        {ok != null && (
          <span className={ok ? 'text-green-700 text-sm' : 'text-red-700 text-sm'}>{ok ? 'Тест пройден' : 'Неверный запрос'}</span>
        )}
      </div>
      {rows && (
        <div className="mt-3 overflow-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr>
                {Object.keys(rows[0] || {}).map((c) => (
                  <th key={c} className="border-b px-2 py-1 font-medium">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="odd:bg-gray-50">
                  {Object.keys(rows[0] || {}).map((c) => (
                    <td key={c} className="border-b px-2 py-1">{String((r as any)[c])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
