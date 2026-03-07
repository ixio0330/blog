import "highlight.js/styles/github-dark.css";
import { useEffect, useState } from "react";
import Markdown from "react-markdown";
import { useNavigate, useParams } from "react-router-dom";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import _manifest from "../generated/posts-manifest.json";
import { useMeta } from "../hooks/useMeta";
import type { PostMeta } from "../types";

const manifest = _manifest as PostMeta[];

function formatDate(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

export function PostDetail() {
  const params = useParams();
  let slug = params["*"] || "";

  if (slug.endsWith("/index.html")) {
    slug = slug.replace(/\/index\.html$/, "");
  } else if (slug.endsWith("/")) {
    slug = slug.slice(0, -1);
  }

  const navigate = useNavigate();
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const meta = manifest.find((p) => p.slug === slug);

  useEffect(() => {
    if (!slug) return;
    fetch(`${import.meta.env.BASE_URL}posts/${slug}.md`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.text();
      })
      .then((text) => {
        const match = text.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
        setContent(match ? match[1] : text);
      })
      .catch(() => setContent("# 글을 찾을 수 없습니다"))
      .finally(() => setLoading(false));
  }, [slug]);

  useMeta({
    title: meta ? `${meta.title} - ~/blog` : undefined,
    description: meta?.excerpt,
    image: meta
      ? `${window.location.origin}${import.meta.env.BASE_URL}og-images/${meta.slug}.png`
      : undefined,
  });

  if (loading) {
    return (
      <p className="py-8 text-center font-mono text-sm text-muted dark:text-muted-dark">
        불러오는 중...
      </p>
    );
  }

  return (
    <article>
      <button
        onClick={() => navigate(-1)}
        className="mb-8 cursor-pointer bg-transparent font-mono text-sm tracking-wide text-muted transition-colors hover:text-accent dark:text-muted-dark dark:hover:text-accent-dark"
      >
        &larr; 돌아가기
      </button>

      {meta && (
        <header className="mb-10">
          <h1 className="mb-3 text-2xl font-bold leading-tight">
            {meta.title}
          </h1>
          <div className="flex items-center gap-3 font-mono text-xs tracking-wide text-muted dark:text-muted-dark">
            <time>{formatDate(meta.createdAt)}</time>
            <span className="text-border dark:text-border-dark">/</span>
            <div className="flex gap-2">
              {meta.tags.map((tag) => (
                <span key={tag} className="dark:text-accent-dark/40">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </header>
      )}

      <div className="prose max-w-none">
        <Markdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight, rehypeRaw]}
        >
          {content}
        </Markdown>
      </div>
    </article>
  );
}
