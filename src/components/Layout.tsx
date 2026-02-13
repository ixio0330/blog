import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ThemeToggle } from './ThemeToggle'
import { CrtOverlay } from './MatrixRain'
import { useTheme } from '../hooks/useTheme'

export function Layout({ children }: { children: ReactNode }) {
  const { theme, toggle } = useTheme()

  return (
    <>
      <CrtOverlay />
      <div className="relative z-10 mx-auto max-w-180 min-h-dvh flex flex-col px-6 py-10">
        <header className="mb-10 flex items-center justify-between">
          <Link
            to="/"
            className="matrix-glow font-mono text-xl font-bold tracking-tight text-text no-underline transition-colors hover:text-accent dark:text-accent-dark"
          >
            ~/blog
            <span className="animate-pulse">_</span>
          </Link>
          <ThemeToggle theme={theme} toggle={toggle} />
        </header>

        <main className="flex-1">{children}</main>

        <footer className="mt-20 pt-6">
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent dark:via-accent-dark/10" />
          <p className="mt-4 font-mono text-[11px] tracking-wider text-muted dark:text-muted-dark">
            &copy; {new Date().getFullYear()}
          </p>
        </footer>
      </div>
    </>
  )
}
