interface ThemeToggleProps {
  theme: 'light' | 'dark'
  toggle: () => void
}

export function ThemeToggle({ theme, toggle }: ThemeToggleProps) {
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggle}
      className="cursor-pointer font-mono text-xs tracking-wider text-muted transition-colors hover:text-text dark:text-muted-dark dark:hover:text-accent-dark"
      aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
    >
      {isDark ? '[light]' : '[dark]'}
    </button>
  )
}
