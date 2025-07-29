# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a tennis tournament management dashboard built as a Turborepo monorepo with:
- **API Backend** (`apps/api`): Express.js with MongoDB/Mongoose for managing tournaments, players, matches, and stages
- **Web Frontend** (`apps/web`): Next.js with React Query, Tailwind CSS, and Radix UI components
- **Shared Packages**: Common types, validation, UI components, and configuration

## Development Commands

### Project-wide Commands (run from root)
```bash
# Development (starts both API and web)
pnpm dev

# Build all apps
pnpm build

# Lint all apps  
pnpm lint

# Type checking
pnpm check-types

# Format code
pnpm format
```

### API-specific Commands (apps/api)
```bash
# Development with hot reload
pnpm dev

# Build TypeScript
pnpm build

# Production start
pnpm start

# Lint
pnpm lint
```

### Web-specific Commands (apps/web)
```bash
# Development with Turbopack on port 3500
pnpm dev

# Build Next.js app
pnpm build

# Production start
pnpm start

# Lint with zero warnings
pnpm lint

# Type checking only
pnpm check-types
```

### Filtering Commands
Use Turbo filters to run commands on specific apps:
```bash
# Run dev only for web app
turbo dev --filter=web

# Build only API
turbo build --filter=@repo/api
```

## Architecture

### Backend Architecture (apps/api)
- **Models**: Mongoose schemas for Tournament, Player, Match, Stage, User in `src/models/`
- **Controllers**: Business logic in `src/controllers/` with consistent response handling
- **Routes**: Express routes in `src/routes/` 
- **Middleware**: Error handling and async wrapper utilities in `src/middleware/`
- **Database**: MongoDB connection via `src/lib/db.ts`
- **Types**: Shared types imported from `@repo/lib`

Key entities and relationships:
- Tournaments contain Players and Stages
- Stages contain Matches between Players
- Tournaments have configurable settings (sets to win, points system, etc.)
- All models include proper validation and indexing

### Frontend Architecture (apps/web)
- **Pages**: Next.js App Router with dashboard layouts in `app/dashboard/`
- **Components**: Reusable UI components in `components/` using Radix UI primitives
- **API Layer**: React Query hooks in `lib/queries/` with centralized API calls in `lib/api/`
- **Types**: Shared with backend via `@repo/lib`
- **Styling**: Tailwind CSS with custom design system

Key pages:
- `/dashboard`: Main dashboard overview
- `/dashboard/tournaments`: Tournament management
- `/dashboard/players`: Player management  
- `/dashboard/stages`: Stage management

### Shared Packages
- **@repo/lib**: Shared types, constants, and validation schemas
- **@repo/ui**: Reusable UI components
- **@repo/eslint-config**: ESLint configurations
- **@repo/typescript-config**: TypeScript configurations

## Database

MongoDB is used with Mongoose ODM. Connection string: `MONGODB_URI` (defaults to `mongodb://localhost:27017/tennis-dashboard`)

Main collections:
- `tournaments`: Tournament management with players, stages, and settings
- `players`: Player profiles and statistics
- `matches`: Individual match results and scoring
- `stages`: Tournament stages (groups, knockout, etc.)
- `users`: User authentication and authorization

## Key Development Patterns

### Error Handling
- Backend uses consistent error middleware in `src/middleware/errorHandler.ts`
- Frontend uses React Query for error states and loading management
- Async operations wrapped with `asyncHandler` utility

### Form Handling
- React Hook Form with Zod validation
- Consistent modal patterns for CRUD operations
- Form schemas shared between frontend and backend via `@repo/lib`

### State Management
- React Query for server state
- React Context for global UI state
- Local component state for form handling

### API Communication
- RESTful API design with consistent response formats
- React Query hooks for all API interactions
- Centralized API configuration in `lib/api/request.ts`

## Testing

Check for existing test scripts in package.json files before running tests. The project uses standard testing patterns but verify the exact commands available.

## Environment Setup

API requires:
- `MONGODB_URI`: MongoDB connection string
- Node.js 18+
- Dependencies managed via pnpm workspaces