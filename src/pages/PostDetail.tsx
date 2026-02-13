import "highlight.js/styles/github-dark.css";
import { useEffect, useState } from "react";
import Markdown from "react-markdown";
import { useNavigate, useParams } from "react-router-dom";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import _manifest from "../generated/posts-manifest.json";
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
  const { slug } = useParams<{ slug: string }>();
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

  if (loading) {
    return (
      <p className="py-8 text-center font-mono text-muted dark:text-muted-dark">
        불러오는 중...
      </p>
    );
  }

  return (
    <article>
      <button
        onClick={() => navigate(-1)}
        className="mb-6 cursor-pointer bg-transparent font-mono text-sm text-muted transition-colors hover:text-accent dark:text-muted-dark dark:hover:text-accent-dark"
      >
        &larr; 돌아가기
      </button>

      {meta && (
        <header className="mb-8">
          <h1 className="mb-2 text-2xl font-bold">{meta.title}</h1>
          <div className="flex items-center gap-3 font-mono text-sm text-muted dark:text-muted-dark">
            <time>{formatDate(meta.createdAt)}</time>
            <div className="flex gap-1.5">
              {meta.tags.map((tag) => (
                <span key={tag}>#{tag}</span>
              ))}
            </div>
          </div>
        </header>
      )}

      <div className="border-t border-border pt-8 dark:border-border-dark">
        <div className="prose max-w-none">
          <Markdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
          >
            {content}
          </Markdown>
        </div>
      </div>
    </article>
  );
}
