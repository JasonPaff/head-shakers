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
- **Zod** for schema validation and type safety

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
- `npm run test` - Run test suite
- `npm run lint:fix` - Run ESLint
- `npm run typecheck` - TypeScript type checking
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with test data