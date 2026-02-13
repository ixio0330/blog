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
      className={`cursor-pointer rounded-md px-2 py-0.5 font-mono text-sm transition-colors ${
        active
          ? 'bg-accent text-white dark:bg-accent-dark'
          : 'bg-border text-muted hover:bg-accent/10 hover:text-accent dark:bg-border-dark dark:text-muted-dark dark:hover:bg-accent-dark/10 dark:hover:text-accent-dark'
      }`}
    >
      {plain ? tag : `#${tag}`}
    </button>
  )
}
