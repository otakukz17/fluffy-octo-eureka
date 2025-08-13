"use client"

import React, { useMemo, useState } from 'react'
import Link from 'next/link'

export type Course = {
  id: string
  title: string
  description: string
  price_cents: number
  expert_name: string
  created_at?: string
}

export default function CourseCatalogClient({ initial }: { initial: Course[] }) {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<'new' | 'price_asc' | 'price_desc'>('new')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let data = initial.filter((c) => {
      if (!q) return true
      return (
        c.title.toLowerCase().includes(q) ||
        (c.description ?? '').toLowerCase().includes(q) ||
        (c.expert_name ?? '').toLowerCase().includes(q)
      )
    })
    if (sort === 'price_asc') data = [...data].sort((a, b) => a.price_cents - b.price_cents)
    if (sort === 'price_desc') data = [...data].sort((a, b) => b.price_cents - a.price_cents)
    if (sort === 'new') data = [...data] // already by created_at desc from server
    return data
  }, [initial, query, sort])

  return (
    <div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по названию, описанию или эксперту"
          className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm ring-1 ring-black/5 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:max-w-md"
        />
        <div className="flex items-center gap-2 text-sm">
          <label htmlFor="sort" className="text-gray-600">Сортировка:</label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className="rounded-md border border-gray-300 bg-white px-2.5 py-2 shadow-sm ring-1 ring-black/5 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
          >
            <option value="new">Сначала новые</option>
            <option value="price_asc">Цена: по возрастанию</option>
            <option value="price_desc">Цена: по убыванию</option>
          </select>
        </div>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c) => (
          <Link
            key={c.id}
            href={`/courses/${c.id}`}
            className="group block rounded-2xl border bg-white p-6 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-semibold line-clamp-2">{c.title}</h3>
              <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 ring-1 ring-indigo-200">
                {(c.price_cents / 100).toFixed(2)} $
              </span>
            </div>
            <p className="mt-2 line-clamp-3 text-gray-600">{c.description}</p>
            <div className="mt-4 flex items-center justify-between text-sm text-gray-700">
              <span>Эксперт: {c.expert_name}</span>
              <span className="text-xs text-gray-500">→ Подробнее</span>
            </div>
          </Link>
        ))}
        {filtered.length === 0 && (
          <div className="rounded-2xl border bg-white p-6 text-gray-600 shadow-sm ring-1 ring-black/5">
            Ничего не найдено. Попробуйте изменить запрос.
          </div>
        )}
      </div>
    </div>
  )
}
