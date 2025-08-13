"use client"

import React, { useEffect, useRef, useState } from 'react'

export default function CodeRunner({
  lessonId,
  runnerId,
  title,
  initialHtml = '<div id="app"></div>',
  initialCss = 'body { font-family: system-ui, sans-serif; padding: 1rem; }',
  initialJs = '',
  testScript = 'window.__OK = !!document.querySelector("#app"); window.__MSG = window.__OK ? "OK" : "#app not found";',
}: {
  lessonId: string
  runnerId: string
  title: string
  initialHtml?: string
  initialCss?: string
  initialJs?: string
  testScript?: string
}) {
  const [html, setHtml] = useState(initialHtml)
  const [css, setCss] = useState(initialCss)
  const [js, setJs] = useState(initialJs)
  const [result, setResult] = useState<null | { ok: boolean; msg?: string }>(null)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)

  function run() {
    setResult(null)
    const srcDoc = `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>${css}</style></head><body>${html}<script>try{${js}}catch(e){console.error(e)}</script><script>try{${testScript}}catch(e){window.__OK=false;window.__MSG=String(e)}</script></body></html>`
    if (iframeRef.current) {
      iframeRef.current.srcdoc = srcDoc
      // wait a tick and read result
      setTimeout(() => {
        try {
          const ok = (iframeRef.current!.contentWindow as any).__OK
          const msg = (iframeRef.current!.contentWindow as any).__MSG
          const r = { ok: !!ok, msg }
          setResult(r)
          try { localStorage.setItem(`coderunner:${runnerId}:result`, JSON.stringify(r)) } catch {}
        } catch (e) {
          setResult({ ok: false, msg: 'Sandbox error' })
        }
      }, 50)
    }
  }

  useEffect(() => {
    // autosave
    try {
      const key = `coderunner:${runnerId}:code`
      localStorage.setItem(key, JSON.stringify({ html, css, js }))
    } catch {}
  }, [lessonId, html, css, js])

  useEffect(() => {
    try {
      const key = `coderunner:${runnerId}:code`
      const raw = localStorage.getItem(key)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed.html) setHtml(parsed.html)
        if (parsed.css) setCss(parsed.css)
        if (parsed.js) setJs(parsed.js)
      }
    } catch {}
  }, [lessonId])

  return (
    <section className="rounded-xl border bg-white p-5 shadow-sm ring-1 ring-black/5">
      <div className="mb-3 text-lg font-semibold">{title}</div>
      <div className="grid gap-3 md:grid-cols-3">
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-600">HTML</label>
          <textarea className="h-40 w-full rounded-md border p-2 font-mono text-xs" value={html} onChange={(e) => setHtml(e.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-600">CSS</label>
          <textarea className="h-40 w-full rounded-md border p-2 font-mono text-xs" value={css} onChange={(e) => setCss(e.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-600">JS</label>
          <textarea className="h-40 w-full rounded-md border p-2 font-mono text-xs" value={js} onChange={(e) => setJs(e.target.value)} />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button onClick={run} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm ring-1 ring-indigo-600/20">Запустить</button>
        {result && (
          <span className={result.ok ? 'text-sm font-medium text-green-700' : 'text-sm font-medium text-red-700'}>
            {result.ok ? 'Тест пройден' : `Провалено${result.msg ? `: ${result.msg}` : ''}`}
          </span>
        )}
      </div>
      <div className="mt-3 overflow-hidden rounded-lg border">
        <iframe ref={iframeRef} className="h-64 w-full bg-white" sandbox="allow-scripts allow-same-origin" />
      </div>
    </section>
  )
}
