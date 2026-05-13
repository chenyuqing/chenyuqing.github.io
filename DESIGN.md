# Design source

This repository is a clean-slate Astro reset of `chenyuqing.github.io`.

## Product goals

- Reset site content to zero and start fresh.
- Keep old content only as offline Markdown backup.
- Keep the homepage minimal so the new visual language can be redesigned later.
- Keep the stack static and deployable on GitHub Pages.

## Current stack

- Astro 6
- Static output
- GitHub Pages via GitHub Actions
- Backup source: `backup/source-json/content.json` -> `backup/markdown-posts*`

## What is intentionally undecided

- Final typography family
- Final accent color
- Final spacing scale
- Final card treatment
- Final background texture or illustration system

## Current implementation constraints

- No legacy posts should be rendered on the website.
- The homepage should stay start-page oriented.
- The site should stay readable on small screens without relying on a complex layout system.
- No custom domain is configured. The canonical domain is `https://chenyuqing.github.io`.

## Safe change zones

- `src/styles/global.css`
- `src/pages/index.astro`
- `src/pages/archives/index.astro`
- `src/pages/about.astro`
- `src/pages/tags/index.astro`
- `src/layouts/BaseLayout.astro`

## Do not break

- GitHub Pages workflow deployment
- Markdown backup folders under `backup/`
