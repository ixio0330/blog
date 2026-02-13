interface TagBadgeProps {
  tag: string
  active?: boolean
  plain?: boolean
  onClick?: () => void
}

export function TagBadge({ tag, active, plain, onClick }: TagBadgeProps) {
  return (
    <button
      onClick={onClick}
      className={`cursor-pointer rounded-full px-3 py-1 font-mono text-xs tracking-wide transition-all duration-200 ${
        active
          ? 'bg-accent/10 text-accent dark:bg-accent-dark/15 dark:text-accent-dark'
          : 'text-muted hover:text-text dark:text-muted-dark dark:hover:text-accent-dark/70'
      }`}
    >
      {plain ? tag : tag}
    </button>
  )
}
