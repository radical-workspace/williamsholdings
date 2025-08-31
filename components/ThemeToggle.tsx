'use client'
import { useEffect, useState } from 'react'

export default function ThemeToggle(){
  // Render a stable default on the server to avoid hydration mismatch.
  // We will read localStorage and prefers-color-scheme on the client after mount.
  const [theme, setTheme] = useState<'light'|'dark'>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('theme') as 'light'|'dark' | null
      if (stored) {
        setTheme(stored)
      } else {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        setTheme(prefersDark ? 'dark' : 'light')
      }
    } catch (e) {
      // ignore and keep default
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('theme-dark', theme === 'dark')
    try { localStorage.setItem('theme', theme) } catch {}
  }, [theme])

  const label = theme === 'dark' ? 'Light' : 'Dark'

  return (
    <button
      onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
      className="btn btn-ghost"
      aria-label="Toggle theme"
    >
      {mounted ? label : null}
    </button>
  )
}
