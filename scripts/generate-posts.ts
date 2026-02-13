import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'
import matter from 'gray-matter'

const ROOT = path.resolve(import.meta.dirname, '..')
const POSTS_DIR = path.join(ROOT, 'posts')
const OUTPUT_DIR = path.join(ROOT, 'src', 'generated')
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'posts-manifest.json')
const PUBLIC_POSTS = path.join(ROOT, 'public', 'posts')

interface PostMeta {
  slug: string
  title: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

function getGitDate(file: string, flags: string): string {
  try {
    const result = execSync(`git log ${flags} --format=%aI -- "${file}"`, {
      encoding: 'utf-8',
      cwd: ROOT,
    }).trim()
    return result || new Date().toISOString()
  } catch {
    return new Date().toISOString()
  }
}

function main() {
  if (!fs.existsSync(POSTS_DIR)) {
    fs.mkdirSync(POSTS_DIR, { recursive: true })
  }

  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md'))

  const posts: PostMeta[] = files.map((file) => {
    const filePath = path.join(POSTS_DIR, file)
    const raw = fs.readFileSync(filePath, 'utf-8')
    const { data } = matter(raw)
    const slug = file.replace(/\.md$/, '')
    const relPath = path.join('posts', file)

    const createdAt = getGitDate(relPath, '--follow --diff-filter=A')
    const updatedAt = getGitDate(relPath, '-1')

    return {
      slug,
      title: (data.title as string) || slug,
      tags: (data.tags as string[]) || [],
      createdAt,
      updatedAt,
    }
  })

  posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(posts, null, 2))

  // Copy markdown files to public/posts/ so they're fetchable at runtime
  fs.mkdirSync(PUBLIC_POSTS, { recursive: true })
  for (const file of files) {
    fs.copyFileSync(path.join(POSTS_DIR, file), path.join(PUBLIC_POSTS, file))
  }

  console.log(`Generated ${posts.length} posts → ${OUTPUT_FILE}`)
}

main()
