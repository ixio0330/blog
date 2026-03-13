import { Resvg } from "@resvg/resvg-js";
import matter from "gray-matter";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import satori from "satori";

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
  excerpt: string;
}

function extractExcerpt(content: string, length = 150): string {
  const plainText = content
    .replace(/<[^>]+>/g, "") // Remove HTML tags
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Remove link syntax but keep text
    .replace(/[#*`>_~-]/g, "") // Remove basic markdown characters
    .replace(/\s+/g, " ") // Collapse whitespaces
    .trim();

  if (plainText.length <= length) return plainText;
  return plainText.slice(0, length) + "...";
}

async function generateOgImage(
  title: string,
  date: string,
  outputPath: string,
  excerpt?: string,
) {
  const fontDataPath = path.resolve(
    ROOT,
    "node_modules",
    "@fontsource",
    "noto-sans-kr",
    "files",
    "noto-sans-kr-korean-700-normal.woff",
  );

  const fontDataKR = fs.readFileSync(fontDataPath);

  const fontDataInter = fs.readFileSync(
    path.join(ROOT, "scripts", "fonts", "Inter-Bold.ttf"),
  );

  const svg = await satori(
    {
      type: "div",
      props: {
        style: {
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          backgroundColor: "#0a0a0a", // var(--color-bg-dark)
          padding: "80px",
          border: "4px solid #1a1a1a", // var(--color-border-dark)
          fontFamily: '"Noto Sans KR"',
        },
        children: [
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                flexDirection: "column",
                gap: "32px",
              },
              children: [
                {
                  type: "div",
                  props: {
                    style: {
                      fontSize: "36px",
                      color: "#22c55e", // var(--color-accent-dark)
                      textShadow: "0 0 10px rgba(34, 197, 94, 0.6)", // .matrix-glow
                      fontFamily: '"Inter"',
                    },
                    children: "~/blog",
                  },
                },
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                      width: "100%", // Force full width for description wrapping
                    },
                    children: [
                      {
                        type: "div",
                        props: {
                          style: {
                            fontSize: "52px", // Slightly smaller
                            fontWeight: 700,
                            color: "#d0d0d0", // var(--color-text-dark)
                            lineHeight: "1.3",
                            letterSpacing: "-0.02em",
                          },
                          children: title,
                        },
                      },
                      ...(excerpt
                        ? [
                            {
                              type: "div",
                              props: {
                                style: {
                                  fontSize: "28px",
                                  color: "#a1a1aa", // lighter muted color
                                  lineHeight: "1.5",
                                  width: "100%", // Force text spanning
                                  display: "-webkit-box",
                                  WebkitLineClamp: 3,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                },
                                children: excerpt,
                              },
                            },
                          ]
                        : []),
                    ],
                  },
                },
              ],
            },
          },
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                fontSize: "28px",
                color: "#606060", // var(--color-muted-dark)
              },
              children: date,
            },
          },
        ],
      },
    } as any,
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Noto Sans KR",
          data: fontDataKR,
          weight: 700,
          style: "normal",
        },
        {
          name: "Inter",
          data: fontDataInter,
          weight: 700,
          style: "normal",
        },
      ],
    },
  );

  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: 1200 },
  });

  const pngData = resvg.render().asPng();

  const destDir = path.dirname(outputPath);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, pngData);
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

async function main() {
  if (!fs.existsSync(POSTS_DIR)) {
    fs.mkdirSync(POSTS_DIR, { recursive: true });
  }

  // Get all .md files with full paths
  const allFiles = getFilesRecursive(POSTS_DIR);

  // Parse files first
  const parsedPosts = allFiles.map((absolutePath) => {
    const raw = fs.readFileSync(absolutePath, "utf-8");
    const { data, content } = matter(raw);
    const excerpt = extractExcerpt(content, 150);

    const relativePath = path.relative(POSTS_DIR, absolutePath);
    const slug = path.basename(absolutePath).replace(/\.md$/, "");
    const gitPath = path.relative(ROOT, absolutePath);

    // Format YYYY.MM.DD
    const isoDate = new Date().toISOString(); // Default to now if not available
    const d = new Date(isoDate);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const formattedDate = `${y}.${m}.${day}`;

    return {
      absolutePath,
      relativePath,
      slug,
      title: (data.title as string) || slug,
      tags: (data.tags as string[]) || [],
      createdAt: isoDate,
      updatedAt: isoDate,
      excerpt,
      formattedDate,
    };
  });

  // Try to populate git dates (synchronous but slow, so we do it all at once)
  parsedPosts.forEach((post) => {
    const gitPath = path.relative(ROOT, post.absolutePath);
    try {
      const createdStr = execSync(
        `git log --follow --diff-filter=A --format=%aI -- "${gitPath}"`,
        { encoding: "utf-8", cwd: ROOT },
      ).trim();
      const updatedStr = execSync(`git log -1 --format=%aI -- "${gitPath}"`, {
        encoding: "utf-8",
        cwd: ROOT,
      }).trim();

      if (createdStr) {
        post.createdAt = createdStr;
        const d = new Date(createdStr);
        post.formattedDate = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
      }
      if (updatedStr) post.updatedAt = updatedStr;
    } catch {}
  });

  const posts: PostMeta[] = parsedPosts.map((p) => ({
    slug: p.slug,
    title: p.title,
    tags: p.tags,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    excerpt: p.excerpt,
  }));

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

  for (const post of parsedPosts) {
    const destPath = path.join(PUBLIC_POSTS, `${post.slug}.md`);

    fs.copyFileSync(post.absolutePath, destPath);

    // Generate OG image
    const ogImagePath = path.join(
      ROOT,
      "public",
      "og-images",
      `${post.slug}.png`,
    );
    await generateOgImage(
      post.title,
      post.formattedDate,
      ogImagePath,
      post.excerpt,
    );
  }

  console.log(
    `Generated ${posts.length} posts and their OG images → ${OUTPUT_FILE}`,
  );
}

main();
