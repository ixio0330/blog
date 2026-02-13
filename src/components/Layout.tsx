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
      <div className="relative z-10 mx-auto max-w-180 px-6 py-8">
        <header className="mb-8 flex items-center justify-between">
          <Link
            to="/"
            className="matrix-glow font-mono text-lg font-semibold text-text no-underline transition-colors hover:text-accent dark:text-green-400 dark:hover:text-green-300"
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
    </>
  )
}
