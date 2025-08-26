# Head Shakers - Bobblehead Collection Platform

## Project Overview

Head Shakers is a specialized platform for bobblehead collectors to showcase, track, and manage their collections. The site prioritizes collection display and management over social features, with robust tracking capabilities, real-time interactions, and community engagement through collection showcases and commenting.

## Architecture & Technology Stack

### Core Framework
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **React 19** with modern hooks and patterns
- **TailwindCSS v4** for styling

### Database & Backend
- **PostgreSQL** via Neon Database
- **Drizzle ORM** for database operations
- **Zod** for validation with drizzle-zod integration
- **ZSA** (Zod Server Actions) for type-safe server actions

### Authentication & Security
- **Clerk** for authentication with custom theming
- **Sentry** for error monitoring and performance tracking
- Rate limiting and permission-based access control

### UI & Components
- **Radix UI** primitives for accessible components
- **Custom design system** with consistent patterns
- **Shadcn/ui** component architecture
- **Lucide React** for icons

### External Services
- **Cloudinary** for image management
- **Ably** for real-time features
- **Redis** for caching and sessions
- **Resend** for email notifications

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (app)/             # Main authenticated application
│   ├── (auth)/            # Authentication pages
│   ├── (public)/          # Public pages (about, terms, etc.)
│   └── api/               # API routes
├── components/            # Reusable UI components
│   ├── layout/            # Layout-specific components
│   └── ui/                # Base UI components
├── lib/                   # Core business logic
│   ├── actions/           # Server actions
│   ├── db/                # Database schema and utilities
│   ├── queries/           # Database queries
│   ├── services/          # External service integrations
│   ├── utils/             # Utility functions
│   └── validations/       # Zod schemas
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
└── utils/                 # General utilities
```

## Key Features

### Collection Management
- **Bobblehead tracking** with detailed metadata (condition, acquisition, photos)
- **Collection organization** with sub-collections and tagging
- **Photo management** with Cloudinary integration
- **Custom fields** for specialized tracking needs

### Social Features
- **User profiles** and follower systems
- **Collection sharing** with privacy controls
- **Comments and likes** on collections and items
- **Discovery feeds** for trending and featured content

### Search & Discovery
- **Advanced search** with filters and categories
- **Trending collections** and featured items
- **Category browsing** and recommendation engine
- **Real-time updates** via Ably integration

### Analytics & Insights
- **Collection analytics** and growth tracking
- **View counts** and engagement metrics
- **Export capabilities** for collection data
- **Moderation tools** for community management

## Development Setup

### Prerequisites
- Node.js 18+ or Bun
- PostgreSQL database (Neon recommended)
- Environment variables configured

### Getting Started
```bash
# Install dependencies
npm install
# or
bun install

# Set up environment variables
cp .env.example .env.local

# Run database migrations
bun run db:migrate

# Start development server
bun run dev
```

### Available Scripts
- `dev` - Start development server with Turbopack
- `build` - Build for production
- `start` - Start production server
- `lint` - Run ESLint
- `lint:fix` - Fix ESLint issues
- `format` - Format code with Prettier
- `db:generate` - Generate Drizzle migrations
- `db:migrate` - Run database migrations

## Environment Variables

Required environment variables:
- **Database**: `DATABASE_URL`
- **Authentication**: Clerk keys
- **Services**: Cloudinary, Ably, Redis, Resend API keys
- **Monitoring**: Sentry DSN

## Development Patterns

### Server Actions
- Use ZSA for type-safe server actions
- Validation with Zod schemas
- Error handling with zod-validation-error

### Component Architecture
- Radix UI primitives as base components
- Compound component patterns for complex UI
- Custom hooks for shared logic

### Database Operations
- Drizzle ORM for type-safe queries
- Optimized indexes for performance
- Soft deletes and audit trails

### Styling Approach
- TailwindCSS with custom design tokens
- Component variants with class-variance-authority
- Responsive design patterns

## Performance Considerations

- **Image optimization** via Cloudinary
- **Database indexing** for common queries
- **Caching strategies** with Redis
- **Real-time updates** without polling
- **Type-safe APIs** to prevent runtime errors

## Security & Privacy

- **Authentication** required for sensitive operations
- **Permission-based access** control
- **Rate limiting** on public endpoints
- **Input validation** at all boundaries
- **GDPR compliance** features for data export/deletion

## Deployment

The application is configured for deployment on Vercel with:
- Automatic deployments from main branch
- Environment variable management
- Database connection pooling
- Static asset optimization

## Contributing

When working on this project:
1. Follow the established patterns for components and server actions
2. Use the existing validation schemas and extend as needed
3. Maintain type safety throughout the application
4. Test authentication flows and permission boundaries
5. Consider performance implications of database queries

## Current Development Stage

The project is in an advanced development stage with:
- Core authentication and user management complete
- Database schema fully designed and implemented
- Basic UI components and layout system in place
- Server actions pattern established
- Key features like collection management partially implemented

Priority areas for continued development:
- Complete remaining CRUD operations
- Implement real-time features
- Add advanced search capabilities
- Build analytics dashboard
- Implement moderation tools