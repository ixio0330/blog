import { useMemo, useState } from 'react'
import { PostCard } from '../components/PostCard'
import { TagBadge } from '../components/TagBadge'
import manifest from '../generated/posts-manifest.json'

export function PostList() {
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    manifest.forEach((post) => post.tags.forEach((t) => tagSet.add(t)))
    return Array.from(tagSet).sort()
  }, [])

  const filtered = activeTag
    ? manifest.filter((post) => post.tags.includes(activeTag))
    : manifest

  return (
    <div>
      <div className="mb-6 border-b border-border pb-6 dark:border-border-dark">
        <div className="flex flex-wrap gap-2">
          <TagBadge
            tag="all"
            active={activeTag === null}
            onClick={() => setActiveTag(null)}
          />
          {allTags.map((tag) => (
            <TagBadge
              key={tag}
              tag={tag}
              active={activeTag === tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        {filtered.length === 0 ? (
          <p className="py-8 text-center font-mono text-muted dark:text-muted-dark">
            No posts yet.
          </p>
        ) : (
          filtered.map((post) => (
            <PostCard
              key={post.slug}
              slug={post.slug}
              title={post.title}
              tags={post.tags}
              createdAt={post.createdAt}
            />
          ))
        )}
      </div>
    </div>
  )
}
