# chenyuqing.github.io

Modern static site reset.

## What this repo does

- Serves a clean starter site (home/about/archives/tags placeholders).
- Keeps legacy content offline as Markdown backups.
- Deploys to GitHub Pages with GitHub Actions.

## Backup source

- `backup/source-json/content.json`
- `backup/markdown-posts`
- `backup/markdown-posts-organized`

## Design source

- `DESIGN.md`

## Development

```sh
npm install
npm run dev
npm run build
```

## Deployment

Pushes to `main` trigger the GitHub Actions Pages workflow.
