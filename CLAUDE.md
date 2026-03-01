# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`azdo-npm-auth` is a CLI tool and library that sets up local authentication to Azure DevOps npm feeds. It creates/updates the user's `~/.npmrc` with Azure DevOps PAT (Personal Access Token) credentials. It uses Azure CLI authentication (`@azure/identity`) to generate tokens via the Azure DevOps REST API.

## Common Commands

- **Build:** `pnpm build` (uses tsup, outputs to `lib/`)
- **Build watch:** `pnpm build --watch`
- **Test:** `pnpm test` (vitest)
- **Run single test:** `pnpm test src/projectNpmrcParse.test.ts`
- **Test with coverage:** `pnpm test -- --coverage`
- **Lint:** `pnpm lint` (eslint, zero warnings enforced with `--max-warnings 0`)
- **Format check:** `pnpm format --check`
- **Format fix:** `pnpm format --write`
- **Type check:** `pnpm tsc`
- **Check unused code/deps:** `pnpm knip`
- **Run locally:** `pnpm start` (builds then executes)
- **Local test with custom config:** `pnpm start -- --config path/to/.npmrc`

## Architecture

Single-package TypeScript library (not a monorepo). ESM-only (`"type": "module"`).

### Three Operation Modes

The CLI (`src/bin/index.ts`) infers its mode from the provided arguments:

1. **parse** (default) — Selected when **no** `--registry` is passed and **both** `--organization` and `--feed` are missing. Reads an existing project `.npmrc` to extract Azure DevOps registry URLs, then generates auth entries.
2. **registry** — Selected when `--registry` is provided. Takes the explicit `--registry` URL to generate auth entries.
3. **make** — Selected when `--registry` is **not** provided but at least one of `--organization` or `--feed` is passed (optionally with `--project`). Constructs the registry URL from `--organization`, `--project`, and `--feed` components.

### Core Flow

1. **Parse/determine registry** → `projectNpmrcParse.ts`, `projectNpmrcRegistry.ts`, `projectNpmrcMake.ts`
2. **Create PAT** → `createPat.ts` (Azure CLI → Azure DevOps REST API)
3. **Generate .npmrc content** → `createUserNpmrc.ts` (base64-encodes PAT)
4. **Write to disk** → `writeNpmrc.ts` (writes to `~/.npmrc`)

CI environments are auto-detected via `ci-info` and skip file writing.

### Key Source Layout

- `src/bin/` — CLI entry point, argument parsing, help text
- `src/shared/cli/` — Logger, spinners, outro messaging
- `src/shared/options/` — CLI option definitions and Zod schemas
- `src/schemas.ts` — Zod validation schemas for API responses (PAT token result)
- `src/types.ts` — TypeScript interfaces

### Validation

Input validation uses Zod schemas (`src/schemas.ts`) with `zod-validation-error` for user-friendly messages.

## Testing

- Framework: **Vitest** with `console-fail-test` (tests fail if they produce console output)
- Test files are co-located with source: `src/*.test.ts`
- Mocks are cleared between tests automatically
- CI uploads coverage to Codecov

## Code Style

- TypeScript strict mode, ES2022 target, NodeNext module resolution
- ESLint 10 flat config with type-checked rules (`eslint.config.js`)
- Prettier with tabs (plugins: curly, sh, packagejson)
- Pre-commit hook runs lint-staged (prettier) via Husky
- Conventional commits required for PRs

## Release Process

Uses **Changesets** for versioning and releases. Add a changeset with `pnpm changeset` when making user-facing changes. Releases are automated via GitHub Actions on push to `main`.

## Node/Tooling Versions

- Node.js: >=18.3.0 (runtime), v22 in CI, v20.12.2 in `.nvmrc`
- Package manager: pnpm v10
