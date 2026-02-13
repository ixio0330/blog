import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ThemeToggle } from './ThemeToggle'
import { useTheme } from '../hooks/useTheme'

export function Layout({ children }: { children: ReactNode }) {
  const { theme, toggle } = useTheme()

  return (
    <div className="mx-auto max-w-180 px-6 py-8">
      <header className="mb-8 flex items-center justify-between">
        <Link
          to="/"
          className="font-mono text-lg font-semibold text-text no-underline transition-colors hover:text-accent dark:text-text-dark dark:hover:text-accent-dark"
        >
          ~/blog
        </Link>
        <ThemeToggle theme={theme} toggle={toggle} />
      </header>

      <main className="min-h-[60vh]">{children}</main>

      <footer className="mt-16 border-t border-border pt-6 dark:border-border-dark">
        <p className="font-mono text-sm text-muted dark:text-muted-dark">
          &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  )
}
