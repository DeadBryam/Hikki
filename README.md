# Hikki - AI Note Manager

AI-powered note management application with seamless sync across devices.

## Tech Stack

- **Monorepo**: Turborepo + Bun
- **Frontend**: Next.js 16 + React 19 + TypeScript 5.7
- **UI**: Shadcn/ui + Tailwind CSS 4
- **State**: Zustand + TanStack Query v5
- **Notifications**: Sileo

## Getting Started

```bash
# Install dependencies
bun install

# Start development server
bun dev

# Build for production
bun run build
```

## Project Structure

- `/apps/web/` - Next.js frontend application
- `/apps/api/` - API backend (separate project)
- `/packages/config/` - Shared configurations

## Development

```bash
# Run linter
bun lint

# Run type checker
bun typecheck
```