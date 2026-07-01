# chenyuqing.github.io

Personal site — blog, news, and product catalog. Built with Astro 6, deployed to GitHub Pages.

## Site structure

- **Blog** (`/blog/`) — long-form articles on AI, coding agents, and workflow
- **News** (`/news/`) — short-form AI industry updates, 5 categories
- **Products** (`/products/`) — GitHub projects translated into product landing pages
- **AI Agent** — in-page chat panel with OpenAI/Claude/Compatible providers

## Content collections

| Collection | Path | Key fields |
|------------|------|-----------|
| `blog` | `src/content/blog/*.md` | title, tags, verdict (adopt/trial/assess/hold), series |
| `news` | `src/content/news/*.md` | title, category (5 types), tags, link |
| `products` | `src/content/products/*.md` | title, tagline, status, type, illo, highlights |

## Tech stack

- Astro 6 (static SSG)
- Vanilla CSS (`src/styles/global.css`)
- Content Collections (`src/content.config.ts`)
- Client-side AI Agent (localStorage-stored user config)

## Development

```sh
npm install
npm run dev       # dev server
npm run build     # production build → dist/
npm run preview   # preview build
```

## Deployment

Push to `main` triggers GitHub Actions Pages workflow.

## Key files

- `AGENTS.md` — agent instructions and project conventions
- `DEVLOG.md` — live development log (current state, decisions, TODO)
- `proddev.md` — product page design spec
- `DESIGN.md` — visual system definition
