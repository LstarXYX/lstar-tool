# Repository Guidelines

## Project Structure & Module Organization

This is a client-only React, TypeScript, and Vite application. `src/main.tsx` mounts the app; `src/App.tsx` owns top-level views and navigation. Keep reusable tool metadata in `src/data/tools.ts`. Implement each tool in `src/features/<tool-name>/`, colocating its component, browser-only conversion logic, and tests—for example, `src/features/image-base64/`. Global visual tokens and responsive rules live in `src/styles/globals.css`. Production output is generated in `dist/`; it is intentionally ignored by Git and uploaded by GitHub Actions.

## Build, Test, and Development Commands

- `npm install`: install dependencies for local development.
- `npm run dev`: start the Vite development server.
- `npm run test`: run the Vitest suite once.
- `npm run lint`: run ESLint across TypeScript and TSX files.
- `npm run build`: type-check and create the production `dist/` bundle.

Run lint, tests, and a production build before opening a pull request. The GitHub Actions workflow repeats these checks and retains `dist` as an artifact before deploying `main` to GitHub Pages.

## Coding Style & Naming Conventions

Use TypeScript with functional React components and two-space indentation. Components use PascalCase filenames and exports (`ImageBase64Tool.tsx`); helpers use camelCase (`base64ToDataUrl`). Keep feature-specific browser APIs and validation close to the feature rather than adding them to `App.tsx`. Use the existing blue-and-white visual language, concise Chinese UI copy, Lucide icons, and CSS transitions that respect `prefers-reduced-motion`. Add new tools to `tools.ts` with an `id`, category, description, icon, and availability state.

## Testing Guidelines

Use Vitest for deterministic utility and parsing tests. Name files `*.test.ts` beside the unit under test and describe observable behavior, such as unprefixed Base64 defaulting to JPEG. Cover valid input, invalid input, and normalization paths when changing conversion logic. No numeric coverage threshold is configured; add focused tests for every new non-trivial helper.

## Commit & Pull Request Guidelines

Follow the existing Conventional Commit style: `feat: add searchable toolbox` or `ci: deploy main builds`. Keep commits focused. Pull requests should explain user-visible behavior, list verification commands, link related issues when applicable, and include screenshots or a short recording for visual changes. Do not commit `dist`, local configuration, credentials, or user-provided files.
