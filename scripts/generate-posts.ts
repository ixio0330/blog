import matter from "gray-matter";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const POSTS_DIR = path.join(ROOT, "posts");
const OUTPUT_DIR = path.join(ROOT, "src", "generated");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "posts-manifest.json");
const PUBLIC_POSTS = path.join(ROOT, "public", "posts");

interface PostMeta {
  slug: string;
  title: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

function getGitDate(file: string, flags: string): string {
  try {
    const result = execSync(`git log ${flags} --format=%aI -- "${file}"`, {
      encoding: "utf-8",
      cwd: ROOT,
    }).trim();
    return result || new Date().toISOString();
  } catch {
    return new Date().toISOString();
  }
}

function getFilesRecursive(dir: string): string[] {
  const files: string[] = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    if (item.isDirectory()) {
      files.push(...getFilesRecursive(path.join(dir, item.name)));
    } else if (item.isFile() && item.name.endsWith(".md")) {
      files.push(path.join(dir, item.name));
    }
  }
  return files;
}

function main() {
  if (!fs.existsSync(POSTS_DIR)) {
    fs.mkdirSync(POSTS_DIR, { recursive: true });
  }

  // Get all .md files with full paths
  const allFiles = getFilesRecursive(POSTS_DIR);

  const posts: PostMeta[] = allFiles.map((absolutePath) => {
    const raw = fs.readFileSync(absolutePath, "utf-8");
    const { data } = matter(raw);

    // Get relative path from POSTS_DIR (e.g., "category/post.md")
    const relativePath = path.relative(POSTS_DIR, absolutePath);

    // Create slug from relative path (remove extension)
    // On Windows, path separators might need normalization, but assuming *nix/Mac given environment
    const slug = relativePath.replace(/\.md$/, "");

    // For git log, we need path relative to repo root
    // absolutePath is /Users/.../blog/posts/category/post.md
    // relative to ROOT is posts/category/post.md
    const gitPath = path.relative(ROOT, absolutePath);

    const createdAt = getGitDate(gitPath, "--follow --diff-filter=A");
    const updatedAt = getGitDate(gitPath, "-1");

    return {
      slug,
      title: (data.title as string) || slug,
      tags: (data.tags as string[]) || [],
      createdAt,
      updatedAt,
    };
  });

  posts.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(posts, null, 2));

  // Copy markdown files to public/posts/ so they're fetchable at runtime
  // We need to preserve directory structure
  if (fs.existsSync(PUBLIC_POSTS)) {
    fs.rmSync(PUBLIC_POSTS, { recursive: true, force: true });
  }
  fs.mkdirSync(PUBLIC_POSTS, { recursive: true });

  for (const absolutePath of allFiles) {
    const relativePath = path.relative(POSTS_DIR, absolutePath);
    const destPath = path.join(PUBLIC_POSTS, relativePath);

    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    fs.copyFileSync(absolutePath, destPath);
  }

  console.log(`Generated ${posts.length} posts → ${OUTPUT_FILE}`);
}

main();
