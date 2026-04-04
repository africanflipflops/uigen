# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is this project?

UIGen is an AI-powered React component generator with live preview. Users describe components in a chat interface, and Claude generates React code that renders in a sandboxed iframe preview. Components live in a virtual file system (nothing written to disk). Supports anonymous and authenticated (JWT) users with SQLite persistence via Prisma.

## Commands

- `npm run setup` — install deps, generate Prisma client, run migrations (first-time setup)
- `npm run dev` — start dev server (Next.js + Turbopack) at localhost:3000
- `npm run build` — production build
- `npm run lint` — ESLint
- `npm test` — run all tests (vitest)
- `npx vitest run src/path/to/test.ts` — run a single test file
- `npm run db:reset` — reset the SQLite database

## Architecture

### Data flow

1. User sends a chat message → `ChatProvider` (chat-context.tsx) calls `/api/chat` via Vercel AI SDK's `useChat`
2. The API route (`src/app/api/chat/route.ts`) streams responses using `streamText` with two AI tools: `str_replace_editor` and `file_manager`
3. Tool calls arrive on the client and are handled by `FileSystemProvider` (file-system-context.tsx), which mutates the in-memory `VirtualFileSystem`
4. `PreviewFrame` reacts to file system changes, transpiles JSX via `@babel/standalone` in the browser, builds an import map with blob URLs, and renders in a sandboxed iframe

### Key abstractions

- **VirtualFileSystem** (`src/lib/file-system.ts`) — in-memory tree of `FileNode`s used on both server (tool execution) and client (state). Serializes to/from JSON for persistence and network transfer.
- **JSX Transformer** (`src/lib/transform/jsx-transformer.ts`) — client-side Babel transform that builds browser import maps. Resolves `@/` aliases, handles CSS imports, creates placeholder modules for missing imports, and proxies third-party packages through esm.sh.
- **Mock Provider** (`src/lib/provider.ts`) — when `ANTHROPIC_API_KEY` is absent, a `MockLanguageModel` returns canned tool calls so the app runs without an API key. The real provider uses `claude-haiku-4-5`.

### Layout

The app uses a two-panel resizable layout (`MainContent`): chat on the left, preview/code on the right. Two React contexts wrap everything:
- `FileSystemProvider` — owns VirtualFileSystem state, handles tool call side effects
- `ChatProvider` — wraps Vercel AI SDK's `useChat`, bridges chat messages ↔ file system

### Auth

JWT-based sessions via `jose`. Middleware protects `/api/projects` and `/api/filesystem`. Anonymous users can use the app but projects aren't persisted. The `[projectId]` dynamic route loads saved project data for authenticated users.

### Database

SQLite via Prisma. Two models: `User` and `Project`. Project stores messages and file system state as JSON strings. Prisma client is generated to `src/generated/prisma`.

## Environment

- `.env` requires `ANTHROPIC_API_KEY` for real AI generation (optional — mock mode works without it)
- `JWT_SECRET` defaults to a dev key
- Dev server requires `NODE_OPTIONS='--require ./node-compat.cjs'` (handled by npm scripts)
