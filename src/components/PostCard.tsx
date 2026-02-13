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
      className="group block rounded-lg px-5 py-5 no-underline transition-all duration-200 hover:bg-surface dark:hover:bg-surface-dark"
    >
      <h2 className="mb-2 text-base font-semibold text-text transition-colors group-hover:text-accent dark:text-text-dark dark:group-hover:text-accent-dark">
        {title}
      </h2>
      <div className="flex items-center gap-3 font-mono text-xs tracking-wide text-muted dark:text-muted-dark">
        <time>{formatDate(createdAt)}</time>
        <span className="text-border dark:text-border-dark">/</span>
        <div className="flex gap-2">
          {tags.map((tag) => (
            <span key={tag} className="dark:text-accent-dark/40">{tag}</span>
          ))}
        </div>
      </div>
    </Link>
  )
}
