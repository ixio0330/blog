interface ThemeToggleProps {
  theme: 'light' | 'dark'
  toggle: () => void
}

export function ThemeToggle({ theme, toggle }: ThemeToggleProps) {
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggle}
      className="relative flex h-7 w-14 cursor-pointer items-center rounded-full border border-border bg-border/50 p-0.5 transition-colors dark:border-accent-dark/30 dark:bg-accent-dark/10"
      aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
    >
      {/* Track icons */}
      <span className="absolute left-1.5 text-[11px] leading-none opacity-50">
        ☀️
      </span>
      <span className="absolute right-1.5 text-[11px] leading-none opacity-50">
        🌙
      </span>

      {/* Thumb */}
      <span
        className={`relative z-10 h-5 w-5 rounded-full shadow-sm transition-all duration-300 ${
          isDark
            ? 'translate-x-7 bg-accent-dark shadow-[0_0_8px_rgba(34,197,94,0.4)]'
            : 'translate-x-0 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.15)]'
        }`}
      />
    </button>
  )
}
