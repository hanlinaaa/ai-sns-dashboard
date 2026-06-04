# AI SNS Dashboard

SNS content planning dashboard built with Next.js, React, TypeScript, Tailwind CSS, and shadcn/ui.

## Directory Contract

The project keeps a fixed 5-layer structure:

- `app/`: Next.js App Router pages, layouts, route-level loading/error UI, and global CSS.
- `features/`: business-facing UI and workflows. Add new product functionality under `features/<feature-name>/`.
- `components/ui/`: shared, generic UI primitives and UI-only helpers such as `cn`, `use-toast`, and `use-mobile`.
- `domain/`: shared domain types, constants, enums, labels, and mock domain data.
- `services/`: side-effectful code such as local storage access, API clients, persistence, and integrations.

Do not add new source folders at the root without first updating this contract and the lint rules.

## Import Rules

- Use the `@/` alias for cross-layer imports.
- `app/` may compose `features/`, `components/ui/`, `domain/`, and `services/`.
- `features/` may use `components/ui/`, `domain/`, and `services/`.
- `components/ui/` must stay generic and must not import business features.
- `domain/` should stay side-effect free.
- `services/` may use `domain/`, but should not import React components.
- Legacy imports from `@/lib/*`, `@/hooks/*`, or non-UI `@/components/*` are blocked by ESLint.

## Data Access

UI code must call repositories or services only. It must not read or write browser storage, Supabase, or other persistence APIs directly.

Repository contracts live in `services/repositories/contracts.ts`:

- `historyRepository`
- `calendarRepository`
- `settingsRepository`
- `generatedContentRepository`
- `publishJobRepository`
- `platformAccountRepository`

The default backend is `localStorage`. Switch backends with:

```bash
NEXT_PUBLIC_DATA_BACKEND=localStorage
```

For Supabase:

```bash
NEXT_PUBLIC_DATA_BACKEND=supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-or-anon-key
```

Create the Supabase tables with `services/repositories/supabase-schema.sql`. The current schema stores each record as versioned JSON so the app can migrate the domain model without rewriting page code.

## AI Content Generation

The home page is a real AI generation workflow. Client components call `app/api/content-generation/route.ts`; the route calls an OpenAI-compatible chat completions API through `services/content-generation.ts`.

Configure server-side AI credentials in `.env.local`:

```bash
OPENAI_API_KEY=your-api-key
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini
```

`OPENAI_BASE_URL` can point at any OpenAI-compatible backend for local testing. Do not commit shared or third-party public keys.

Generation behavior is centralized in `services/content-generation.ts`:

- `buildContentGenerationPrompt`: platform rules, brand settings, tone, target audience, keywords, NG words, must-have words, and length preference.
- `generateContentWithOpenAi`: OpenAI-compatible API client.
- `validateGeneratedContent`: runs `validateContent` for X, Instagram, and LINE.
- `createGeneratedContentRecords`: creates traceable `GeneratedContent` and `HistoryRecord` objects.

Every generated response is validated against `domain/platform-rules.ts` and brand rules from `BrandSettings`, then persisted through the repositories.

## Naming Rules

- Business components: PascalCase component names, kebab-case filenames, for example `HistoryTable` in `history-table.tsx`.
- UI primitives: PascalCase exports in `components/ui`, matching shadcn-style filenames where practical.
- Service functions: verb-first camelCase, for example `loadHistoryRecords`, `saveBrandSettings`, `addCalendarEvent`.
- Types and interfaces: PascalCase nouns, for example `HistoryRecord`, `BrandSettings`, `CalendarEvent`.
- Status unions/enums: domain-specific names ending in `Status`, for example `ContentStatus`.
- Label maps and constants: camelCase for exported maps such as `platformLabels`; SCREAMING_SNAKE_CASE only for true constants like storage keys.

## Development Commands

```bash
pnpm dev
pnpm typecheck
pnpm lint
pnpm format:check
pnpm build
pnpm check
```

Use `pnpm check` before handing off larger changes. It runs type checking, linting, formatting checks, and the production build.
