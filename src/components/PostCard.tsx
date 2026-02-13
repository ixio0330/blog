import { Link } from 'react-router-dom'

interface PostCardProps {
  slug: string
  title: string
  tags: string[]
  createdAt: string
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}.${m}.${day}`
}

export function PostCard({ slug, title, tags, createdAt }: PostCardProps) {
  return (
    <Link
      to={`/posts/${slug}`}
      className="block rounded-lg px-4 py-4 no-underline transition-colors hover:bg-border/50 dark:hover:bg-border-dark/50"
    >
      <h2 className="mb-1 text-lg font-semibold text-text dark:text-text-dark">
        {title}
      </h2>
      <div className="flex items-center gap-3 font-mono text-sm text-muted dark:text-muted-dark">
        <time>{formatDate(createdAt)}</time>
        <div className="flex gap-1.5">
          {tags.map((tag) => (
            <span key={tag}>#{tag}</span>
          ))}
        </div>
      </div>
    </Link>
  )
}
