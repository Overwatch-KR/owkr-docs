# AGENTS.md - OWKR Docs

## Project Overview

OWKR Docs is the public documentation site for OWKR community scrim rules, FAQs,
participation guidance, and policy changes. The UI and all public content are in Korean.

## Tech Stack

- **Framework:** Astro 7, TypeScript 5.9
- **Content:** Astro Content Collections and Markdown
- **Hosting:** GitHub Pages
- **Package manager:** pnpm 11.9.0

## Commands

```bash
pnpm dev        # Start the local development server
pnpm typecheck  # Run Astro diagnostics
pnpm build      # Build the static site
pnpm check      # Typecheck and build
pnpm preview    # Preview the production build
```

When starting the development server for agent work, use background mode:

```bash
pnpm astro dev --background
```

Manage it with `pnpm astro dev stop`, `pnpm astro dev status`, and
`pnpm astro dev logs`.

## Patterns & Conventions

- **Files and directories:** kebab-case
- **Astro component symbols:** PascalCase
- **Functions and variables:** camelCase
- **Constants:** UPPER_SNAKE_CASE when globally fixed
- **Indentation:** 4 spaces in TypeScript, Astro, and CSS; 2 spaces in JSON and YAML
- **TypeScript:** strict mode, explicit interfaces for component props and data models
- **Content:** public copy is Korean; keep rule language concise and unambiguous
- **CSS:** keep style files free of comments
- **JSDoc:** flow-focused and concise; every JSDoc block must include an `@description` tag

## Content Management

- `src/content/docs`: authoritative rules and participation guides
- `src/content/faq`: one FAQ entry per Markdown file
- `src/content.config.ts`: shared metadata schemas
- `CHANGELOG.md`: site and rule change history

When a rule changes, update its `version` and `updatedAt` fields and record the change in
the root `CHANGELOG.md`. FAQ pages explain the rules but do not override them.

## Documentation

Consult the official Astro guides before changing related functionality:

- [Routing](https://docs.astro.build/en/guides/routing/)
- [Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Content collections](https://docs.astro.build/en/guides/content-collections/)
- [Styles and CSS](https://docs.astro.build/en/guides/styling/)
- [Internationalization](https://docs.astro.build/en/guides/internationalization/)
