"use client"

import { useEffect, useState } from 'react'

function getSystemPrefersDark(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
}

function getInitialTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'light'
  const stored = window.localStorage.getItem('theme')
  if (stored === 'dark' || stored === 'light') return stored
  return getSystemPrefersDark() ? 'dark' : 'light'
}

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => 'light')

  // Init once on mount
  useEffect(() => {
    const initial = getInitialTheme()
    setTheme(initial)
    const root = document.documentElement
    if (initial === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
    setMounted(true)
  }, [])

  // Reflect theme changes in DOM and storage
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    try {
      window.localStorage.setItem('theme', theme)
    } catch {}
  }, [theme])

  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      const stored = window.localStorage.getItem('theme')
      if (!stored) setTheme(mql.matches ? 'dark' : 'light')
    }
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      aria-label={'Сменить тему'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-white/70 text-gray-700 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:bg-white/90 dark:bg-white/10 dark:text-gray-200 dark:hover:bg-white/15"
    >
      {!mounted ? (
        <span className="h-5 w-5 rounded-full bg-gray-300/60 dark:bg-white/30" />
      ) : isDark ? (
        // Sun icon
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z" />
          <path d="M12 2.25a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0V3A.75.75 0 0 1 12 2.25Zm0 15a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5a.75.75 0 0 1 .75-.75Zm9-6a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 21 11.25Zm-15 0a.75.75 0 0 1-.75.75H3.75a.75.75 0 0 1 0-1.5H5.25a.75.75 0 0 1 .75.75Zm11.4 6.15a.75.75 0 0 1-1.06 1.06l-1.06-1.06a.75.75 0 1 1 1.06-1.06l1.06 1.06Zm-9.88-9.88a.75.75 0 1 1-1.06-1.06L6.62 5.4a.75.75 0 1 1 1.06 1.06L6.52 7.37Zm9.88-1.97a.75.75 0 0 1 1.06 1.06l-1.06 1.06a.75.75 0 1 1-1.06-1.06l1.06-1.06Zm-9.88 9.88 1.06 1.06a.75.75 0 0 1-1.06 1.06L5.4 16.62a.75.75 0 0 1 1.06-1.06Z" />
        </svg>
      ) : (
        // Moon icon
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
        </svg>
      )}
    </button>
  )
}


