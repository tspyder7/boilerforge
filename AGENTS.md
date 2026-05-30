# boilerforge — Agent Guide

## Quick start

```bash
pnpm install
pnpm run dev -- create <template>            # dev mode (ts-node, no build)
pnpm run build                                # prebuild runs clean→lint→format→build
```

## Commands

| Command | When |
|---|---|
| `pnpm run lint` | ESLint (`.js,.ts`) |
| `pnpm run format` | Prettier (4-space, single quotes, trailing commas) |
| `pnpm run dev -- <args>` | Run without building |
| `pnpm run build` | esbuild bundle → `dist/cli.js` |

Pre-push hook enforces `lint && format`. Prebuild hook enforces `clean && lint && format`.

## Architecture

Single package (not a monorepo). CLI entrypoint: `bin/cli.ts` → `Boilerforge.parse(process.argv)`. Uses `commander` with auto-registered subcommands in `src/modules/cli/commands/sub-commands/`.

Three subcommands: `create`, `list-templates`, `show-config`.

## Templates

Live under `templates/<name>/`. Each has:
- `forge.config.json` — metadata + conditional file rules (Jexl expressions, e.g. `"src/index.ts": "isTypescript == true"`)
- `forge.prompt.json` — interactive prompts (text/select/toggle with validation)
- `schema/` — JSON schemas for validation
- `app/` — Handlebars (`.hbs`) template files

## Build quirks

- `CLI_VERSION` is injected at esbuild build time via `define`; falls back to `'0.0.0-dev'` in dev mode.
- `esbuild.config.ts` is run via `ts-node` (not compiled first). The copy plugin bundles templates into `dist/`.
- Prebuild runs `clean` (rimraf dist) before lint/format.
- The `dist/` dir is gitignored.

## Constraints

- **No test suite** — `pnpm run test` exits 1. Skip test-related work.
- **No `type: "module"`** in package.json, but tsconfig uses `NodeNext` module resolution — ts-node handles this at dev time.
- **Node >= 24** required.
- **Conventional commits** enforced by commitlint + husky (`commit-msg` hook).
- **pnpm 10.9.0** (pinned in package.json `packageManager` field).
- **Release**: manual GH Actions workflow_dispatch or push to `main`. Uses external reusable workflow (`tspyder7/github-actions-lib`).
