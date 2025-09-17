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
- **Next.js 15.5.3** with App Router
- **React 19.1.0** with TypeScript
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
- **TanStack Query** for server state management
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
- `npm run next-typesafe-url` - Generate type-safe routes
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

## Project Documentation Conventions (Important)

**Documentation Files:** All new documentation or task files must be saved under the `docs/` folder in this repository.For example:

- **Tasks & TODOs**: Save in `docs/{YYYY_MM_DD}/tasks/` (e.g., `docs/t2025_08_08/asks/ReleaseTodo.md` for a release checklist).
- **Requirements/Specs**: Save in `docs/{YYYY_MM_DD}/specs/` (e.g., `docs/2025_08_08/specs/AuthModuleRequirements.md`).
- **Design Docs**: Save in `docs/{YYYY_MM_DD}/design/` (e.g., `docs/2025_08_08/design/ArchitectureOverview.md`).
- **Code Files:** Follow the project structure (place new code in the appropriate src/module folder as discussed).
- **Tests:** Put new test files under the `tests/` directory, mirroring the code structure.

> **Important:** When creating a new file, ensure the directory exists or create it. Never default to the root directory for these files.