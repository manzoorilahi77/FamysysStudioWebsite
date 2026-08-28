# Famysys Studio

Marketing homepage for Famysys Studio, built on Next.js 15 (App Router) with a DDD-layered
`src/` tree (`domain/` → `application/` → `infrastructure/` → `presentation/`/`app/`). See
`docs/superpowers/specs/2026-08-28-famysys-studio-homepage-design.md` for the design tokens and
`docs/content-todo.md` for every placeholder that needs client confirmation before launch.

## Setup

```bash
pnpm install
pnpm dev
```

Requires Node 20+ and pnpm.

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Local dev server |
| `pnpm build` | Production build |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint, including the layer-boundary rules in `eslint.config.mjs` |
| `pnpm test` | Vitest unit tests |
| `pnpm generate:media` | Regenerates every file in `public/media/` — see below |

## Placeholder media

`scripts/generate-media.mjs` regenerates every placeholder image and video referenced by
`src/infrastructure/content/static/*.content.ts`, entirely locally — nothing is downloaded.
Images are hand-built SVGs; videos are synthesized with ffmpeg's `gradients` source filter (no
source footage).

**Requires `ffmpeg` on `PATH`.** Install it via your platform's package manager (e.g.
`winget install Gyan.FFmpeg`, `brew install ffmpeg`, `apt install ffmpeg`) and confirm with
`ffmpeg -version` before running the script.

```bash
pnpm generate:media
```

The script is deterministic — no randomness, no timestamps in its own logic — so re-running
against a non-empty `public/media/` overwrites every file with the same content. Regenerate it
any time the content files' media filenames change.
