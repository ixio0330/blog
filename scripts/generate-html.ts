import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PostMeta } from "../src/types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const MANIFEST_URL = path.join(ROOT, "src", "generated", "posts-manifest.json");
// Make sure DIST exists before doing anything
if (!fs.existsSync(DIST)) {
  console.error("Dist folder does not exist. Run vite build first.");
  process.exit(1);
}

const INDEX_HTML = fs.readFileSync(path.join(DIST, "index.html"), "utf-8");

async function main() {
  const manifestData = fs.readFileSync(MANIFEST_URL, "utf-8");
  const posts: PostMeta[] = JSON.parse(manifestData);

  // 1. Setup GitHub Pages SPA Fallback
  // GitHub pages doesn't support BrowserRouter out of the box.
  // It returns 404 for deep paths like /posts/slug unless an explicit html file exists.
  // We copy the base index.html to 404.html. This way the Github Pages server will
  // load the React JS app, which will read the URL and route properly on the client side.
  fs.copyFileSync(path.join(DIST, "index.html"), path.join(DIST, "404.html"));

  const postsDir = path.join(DIST, "posts");
  if (!fs.existsSync(postsDir)) {
    fs.mkdirSync(postsDir, { recursive: true });
  }

  // 2. Generate Static HTML files per post for link crawlers
  for (const post of posts) {
    const postDir = path.join(postsDir, post.slug);
    if (!fs.existsSync(postDir)) {
      fs.mkdirSync(postDir, { recursive: true });
    }

    const title = `${post.title} - ~/blog`;
    const description = post.excerpt || "~/blog";
    // We assume the vite build process puts the base URL via build config, but we can also hardcode /blog/ based on the repo name.
    // Replace the default meta tags in the HTML string.
    let postHtml = INDEX_HTML.replace(
      /<title>.*<\/title>/,
      `<title>${title}</title>`,
    )
      .replace(
        /<meta name="description" content=".*" \/>/,
        `<meta name="description" content="${description}" />`,
      )
      .replace(
        /<meta property="og:title" content=".*" \/>/,
        `<meta property="og:title" content="${title}" />`,
      )
      .replace(
        /<meta property="og:description" content=".*" \/>/,
        `<meta property="og:description" content="${description}" />`,
      );

    // Inject og:image
    // Usually the base url for the repo is used.
    // We can infer it or we can hardcode for github pages to make sure the crawler gets absolute URLs.
    const baseUrl = "https://hb-s-o.github.io/blog/";
    const ogImageUrl = `${baseUrl}og-images/${post.slug}.png`;

    const ogImageTags = `
    <meta property="og:image" content="${ogImageUrl}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:image" content="${ogImageUrl}" />
    `;

    postHtml = postHtml.replace("</head>", `${ogImageTags}</head>`);

    const destPath = path.join(postDir, "index.html");
    fs.writeFileSync(destPath, postHtml);
  }

  console.log(
    `Generated HTML files for ${posts.length} posts for SSG og-tags.`,
  );
}

main().catch(console.error);
