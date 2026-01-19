# Head Shakers - Bobblehead Collection Platform

## Project Overview

Head Shakers is a digital platform for bobblehead collectors to catalog, share, and discover bobblehead collections. Users can build their digital collections, connect with other collectors, and explore rare finds from around the world.

## Purpose

- **Collection Management**: Users can catalog their bobbleheads with detailed information including photos, specifications, acquisition details, and custom fields
- **Social Features**: Connect with other collectors, follow users, like collections, and discover trending content
- **Content Discovery**: Browse featured collections, search by categories, and explore trending bobbleheads
- **Administrative Tools**: Admin panel for managing featured content, user moderation, and analytics

## Tech Stack

### Core Framework

- **Next.js 16.0.3** with App Router
- **React 19.2.0** with TypeScript
- **Tailwind CSS 4** for styling

### Database & Backend

- **PostgreSQL** with Neon serverless
- **Drizzle ORM** for database operations and migrations
- **Drizzle-Zod** for schema validation based on Drizzle schemas
- **Zod** for schema validation and type safety
- **Next-Safe-Action** for server actions

### Authentication & User Management

- **Clerk** for authentication and user management with themes support

### UI Components & Styling

- **Radix UI** component library (dialogs, dropdowns, forms, etc.)
- **Lucide React** for icons
- **Class Variance Authority** for component variants
- **Tailwind CSS** with custom animations and Radix integration

### File Storage & Media

- **Cloudinary** for image storage and optimization
- **Next Cloudinary** for Next.js integration

### State Management & Data Fetching

- **TanStack React Table** for data tables
- **TanStack React Form** for form handling
- **Nuqs** for URL state management

### Real-time & Background Jobs

- **Ably** for real-time features
- **Upstash QStash** for background job processing
- **Upstash Redis** for caching

### Development & Testing

- **Vitest** for unit, integration, and E2E testing
- **Testing Library** for React component testing
- **MSW** for API mocking
- **Testcontainers** for database testing
- **ESLint** with multiple plugins for code quality
- **Prettier** for code formatting

### Monitoring & Error Tracking

- **Sentry** for error monitoring and performance tracking

## Key Features

- User authentication and profiles
- Bobblehead catalog with detailed metadata
- Collection and subcollection organization
- Photo galleries with Cloudinary integration
- Social features (likes, follows, comments)
- Search and filtering capabilities
- Featured content management
- Admin dashboard with analytics
- Real-time notifications
- Data import/export functionality

## Folder Structure

- **`src/app/`** - Next.js App Router pages and API routes
  - `(app)/` - App routes (dashboard, collections, bobbleheads, etc.)
  - `(public)/` - Public routes (about, terms, privacy)
  - `api/` - API endpoints
- **`src/components/`** - React components
  - `ui/` - Reusable UI components (forms, dialogs, icons)
  - `feature/` - Feature-specific components (bobblehead, collections)
  - `layout/` - Layout components (headers, sidebars)
- **`src/lib/`** - Core application logic
  - `db/` - Database schema, migrations, and scripts
  - `actions/` - Server actions for mutations
  - `queries/` - Database queries and data fetching
  - `facades/` - Business logic layer
  - `validations/` - Zod schemas for validation
  - `utils/` - Utility functions and helpers
- **`tests/`** - Test files mirroring src structure
- **`docs/`** - Project documentation and task files
- **`public/`** - Static assets (images, icons, etc.)

## Architecture

- **App Router** structure with route groups for organization
- **Server Actions** for form handling and mutations
- **Server Components** for data fetching and SEO
- **Middleware** for authentication, rate limiting, and security
- **Type-safe routing** with next-typesafe-url
- **Database transactions** and query optimization
- **Circuit breaker** pattern for resilience
- **Comprehensive validation** with Zod schemas

## Development Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run next-typesafe-url` - Generate type-safe routes for the $path object
- `npm run format` - Format code with Prettier
- `npm run test` - Run test suite
- `npm run lint:fix` - Run ESLint
- `npm run typecheck` - TypeScript type checking
- `npm run db:generate` - Generate database migrations
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with test data

## Project Rules (Important)

- **Code Formatting**: All code must be formatted using Prettier. Run `npm run format` before committing.
- **Linting**: Ensure code passes ESLint checks. Run `npm run lint:fix` to fix issues.
- **Type Safety**: Use TypeScript and Zod for type safety. Run `npm run typecheck` to verify.
- **No Any Type**: Avoid using `any` type in TypeScript. Use proper types, generics, or unknown with type narrowing.
- **No forwardRef()**: Do not use `forwardRef` in React 19, pass refs directly through props.
- **Never use Eslint disable comments**: Always fix the underlying issue instead of disabling lint rules. If you cannot fix it, discuss with the team.
- **Never use TS-ignore comments**: Always fix type errors instead of ignoring them.
- **No Barrel Files**: Do not use `index.ts` files for re-exports. Always import directly from the file path.
- **Real Time Notifications**: Use Ably for all real-time features. Use very sparingly and only when truly necessary for the feature.
- **URLs**: Use $path from next-typesafe-url for all internal links.

## Project Documentation Conventions (Important)

**Documentation Files:** All new documentation or task files must be saved under the `docs/` folder in this repository.For example:

- **Tasks & TODOs**: Save in `docs/{YYYY_MM_DD}/tasks/` (e.g., `docs/t2025_08_08/asks/ReleaseTodo.md` for a release checklist).
- **Requirements/Specs**: Save in `docs/{YYYY_MM_DD}/specs/` (e.g., `docs/2025_08_08/specs/AuthModuleRequirements.md`).
- **Design Docs**: Save in `docs/{YYYY_MM_DD}/design/` (e.g., `docs/2025_08_08/design/ArchitectureOverview.md`).
- **Code Files:** Follow the project structure (place new code in the appropriate src/module folder as discussed).

> **Important:** When creating a new file, ensure the directory exists or create it. Never default to the root directory for these files.
