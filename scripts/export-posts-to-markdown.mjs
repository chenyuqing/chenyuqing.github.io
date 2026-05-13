import fs from "node:fs/promises";
import path from "node:path";

const INPUT_FILE = path.resolve(process.cwd(), "backup/source-json/content.json");
const OUTPUT_DIR = path.resolve(process.cwd(), "backup/markdown-posts");
const ORGANIZED_OUTPUT_DIR = path.resolve(
  process.cwd(),
  "backup/markdown-posts-organized",
);

function decodeHtmlEntities(text = "") {
  return text
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#x27;", "'")
    .replaceAll("&#39;", "'")
    .replaceAll("&#x2F;", "/")
    .replaceAll("&#x3D;", "=");
}

function toIsoDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString();
}

function normalizeArray(input) {
  if (!Array.isArray(input)) return [];
  return input.map((item) => item?.name ?? String(item)).filter(Boolean);
}

function escapeYaml(text = "") {
  return String(text).replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}

function frontMatter(post) {
  const categories = normalizeArray(post.categories);
  const tags = normalizeArray(post.tags);
  const permalink = post.path ? `/${post.path}` : "";

  const lines = [
    "---",
    `title: "${escapeYaml(post.title ?? "")}"`,
    `date: "${toIsoDate(post.date)}"`,
    `updated: "${toIsoDate(post.updated)}"`,
    `slug: "${escapeYaml(post.slug ?? "")}"`,
    `permalink: "${escapeYaml(permalink)}"`,
    `categories: [${categories.map((c) => `"${escapeYaml(c)}"`).join(", ")}]`,
    `tags: [${tags.map((t) => `"${escapeYaml(t)}"`).join(", ")}]`,
    "---",
    "",
  ];

  return lines.join("\n");
}

function safeRelPath(post) {
  const raw = (post.path || post.slug || post.title || "untitled")
    .replace(/index\.html$/i, "")
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");
  return raw || "untitled";
}

function safeSegment(text = "") {
  const cleaned = String(text)
    .trim()
    .replace(/[<>:"\\|?*\u0000-\u001F]/g, "-")
    .replace(/\//g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
  return cleaned || "untitled";
}

function postYear(post) {
  const pathMatch = String(post.path || "").match(/^(\d{4})\/\d{2}\/\d{2}\//);
  if (pathMatch) return pathMatch[1];
  const d = new Date(post.date);
  if (Number.isNaN(d.getTime())) return "unknown-year";
  return String(d.getUTCFullYear());
}

function postDatePrefix(post) {
  const pathMatch = String(post.path || "").match(
    /^(\d{4})\/(\d{2})\/(\d{2})\//,
  );
  if (pathMatch) return `${pathMatch[1]}-${pathMatch[2]}-${pathMatch[3]}`;
  const d = new Date(post.date);
  if (Number.isNaN(d.getTime())) return "unknown-date";
  return d.toISOString().slice(0, 10);
}

function baseFileName(post) {
  const slugTail = (post.slug || "").split("/").filter(Boolean).pop();
  return safeSegment(slugTail || post.title || "untitled");
}

async function main() {
  const raw = await fs.readFile(INPUT_FILE, "utf8");
  const data = JSON.parse(raw);
  const posts = Array.isArray(data.posts) ? data.posts : [];

  await fs.rm(OUTPUT_DIR, { recursive: true, force: true });
  await fs.rm(ORGANIZED_OUTPUT_DIR, { recursive: true, force: true });
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.mkdir(ORGANIZED_OUTPUT_DIR, { recursive: true });

  const collisionMap = new Map();
  const mappings = [];

  for (const post of posts) {
    const relDir = safeRelPath(post);
    const legacyFilePath = path.join(OUTPUT_DIR, relDir, "index.md");
    await fs.mkdir(path.dirname(legacyFilePath), { recursive: true });

    const body = decodeHtmlEntities(post.text || "").trim();
    const doc = `${frontMatter(post)}${body}\n`;
    await fs.writeFile(legacyFilePath, doc, "utf8");

    const year = postYear(post);
    const categories = normalizeArray(post.categories);
    const primaryCategory = safeSegment(categories[0] || "uncategorized");
    const datePrefix = postDatePrefix(post);
    const namePrefix = `${datePrefix}__${baseFileName(post)}`;

    const key = `${year}/${primaryCategory}/${namePrefix}`;
    const nextIndex = (collisionMap.get(key) || 0) + 1;
    collisionMap.set(key, nextIndex);
    const uniqueName = nextIndex > 1 ? `${namePrefix}-${nextIndex}` : namePrefix;

    const organizedFilePath = path.join(
      ORGANIZED_OUTPUT_DIR,
      year,
      primaryCategory,
      `${uniqueName}.md`,
    );
    await fs.mkdir(path.dirname(organizedFilePath), { recursive: true });
    await fs.writeFile(organizedFilePath, doc, "utf8");

    mappings.push({
      title: post.title ?? "",
      slug: post.slug ?? "",
      originalPath: post.path ?? "",
      legacyFile: path.relative(process.cwd(), legacyFilePath),
      organizedFile: path.relative(process.cwd(), organizedFilePath),
    });
  }

  const manifest = {
    exportedAt: new Date().toISOString(),
    source: "backup/source-json/content.json",
    totalPosts: posts.length,
    outputDir: path.relative(process.cwd(), OUTPUT_DIR),
    organizedOutputDir: path.relative(process.cwd(), ORGANIZED_OUTPUT_DIR),
  };
  await fs.writeFile(
    path.join(OUTPUT_DIR, "_manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8",
  );
  await fs.writeFile(
    path.join(ORGANIZED_OUTPUT_DIR, "_manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8",
  );
  await fs.writeFile(
    path.join(ORGANIZED_OUTPUT_DIR, "_mappings.json"),
    `${JSON.stringify(mappings, null, 2)}\n`,
    "utf8",
  );

  console.log(`Exported ${posts.length} posts to ${OUTPUT_DIR}`);
  console.log(`Organized ${posts.length} posts to ${ORGANIZED_OUTPUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
