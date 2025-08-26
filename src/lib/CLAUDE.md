# Core Business Logic (`src/lib/`)

This directory contains the core business logic and infrastructure for the Head Shakers application. It's organized into distinct layers that handle data operations, external service integrations, validation, and utilities.

## Directory Structure

```
lib/
├── actions/           # Server actions (ZSA-based)
├── db/               # Database schema and utilities  
├── queries/          # Database query functions
├── services/         # External service integrations
├── utils/            # Core utility functions
└── validations/      # Zod validation schemas
```

## Key Architecture Patterns

### 1. Server Actions with ZSA
All server-side operations use the ZSA (Zod Server Actions) pattern for type safety:

```typescript
// Example pattern used throughout actions/
import { createServerAction } from 'zsa'
import { z } from 'zod'

export const createCollection = createServerAction()
  .input(createCollectionSchema)
  .handler(async ({ input }) => {
    // Type-safe server action logic
  })
```

### 2. Database Operations
- **Drizzle ORM** for type-safe database operations
- **Separate query layer** for reusable database operations
- **Schema-driven validation** with Zod integration

### 3. External Service Integration
Located in `services/`, these modules provide abstracted access to:
- **Cloudinary** - Image management and optimization
- **Ably** - Real-time messaging and updates
- **Redis** - Caching and session storage
- **Resend** - Email notifications
- **Search** - Search engine integration

### 4. Validation Strategy
All data validation uses Zod schemas in `validations/`:
- **Input validation** for server actions
- **Database schema validation** 
- **API response validation**
- **Form validation** on client and server

## Core Components

### Actions Layer (`actions/`)
Server actions organized by domain:
- `analytic.action.ts` - Analytics and metrics
- `bobblehead.action.ts` - Bobblehead CRUD operations
- `collection.action.ts` - Collection management
- `moderation.ts` - Content moderation
- `social.action.ts` - Social features (likes, follows)
- `system.action.ts` - System-level operations
- `tag.action.ts` - Tag management
- `user.action.ts` - User profile operations

**Key Patterns:**
- Input validation with Zod schemas
- Authentication checks via Clerk
- Error handling with zod-validation-error
- Database operations through query layer

### Database Layer (`db/`)
Centralized database configuration and schema:

```
db/
├── index.ts          # Database connection and config
└── schema/           # Drizzle schema definitions
    ├── analytics.ts  # Analytics tables
    ├── bobbleheads.ts # Core bobblehead entities
    ├── collections.ts # Collection structures
    ├── moderations.ts # Moderation system
    ├── relations.ts   # Table relationships
    ├── socials.ts     # Social features
    ├── systems.ts     # System configuration
    ├── tags.ts        # Tagging system
    └── users.ts       # User profiles
```

**Schema Design Principles:**
- **Comprehensive indexing** for performance
- **Soft deletes** with `deletedAt` timestamps
- **Audit trails** with created/updated timestamps
- **Foreign key constraints** with cascade deletes
- **JSON fields** for flexible custom data

### Query Layer (`queries/`)
Reusable database query functions organized by domain:
- Pure functions that accept parameters
- Return typed results from Drizzle
- Handle complex joins and aggregations
- Provide consistent error handling

### Services Layer (`services/`)
External service integrations with consistent patterns:

**Cloudinary Integration:**
- Image upload and optimization
- Transformation pipelines for different sizes
- URL generation and management

**Ably Real-time:**
- Channel management for live updates
- Event publishing for collection changes
- Presence detection for active users

**Redis Caching:**
- Session storage and management
- Query result caching
- Rate limiting data storage

**Resend Email:**
- Transactional email sending
- Template management
- Notification queues

**Search Service:**
- Full-text search capabilities
- Filtering and faceting
- Index management

### Utilities (`utils/`)
Core utility functions:
- `auth.ts` - Authentication helpers and guards
- `cache.ts` - Caching strategies and invalidation
- `permissions.ts` - Role-based access control
- `rate-limit.ts` - Rate limiting implementation

### Validations (`validations/`)
Comprehensive Zod schemas for all data structures:
- **Input validation** for forms and APIs
- **Database constraints** validation
- **Business rule enforcement**
- **Type generation** for TypeScript

## Integration Patterns

### Authentication Flow
1. **Clerk middleware** handles authentication state
2. **Server actions** validate user permissions
3. **Database operations** include user context
4. **Error handling** for unauthorized access

### Data Flow Pattern
```
Client Form → Server Action → Validation → Query Layer → Database
                   ↓
Client Update ← Response ← Business Logic ← Result
```

### Real-time Updates
1. **Server action** performs database update
2. **Ably service** publishes change event
3. **Client components** receive and apply updates
4. **Optimistic updates** for immediate feedback

### Caching Strategy
- **Redis** for session and query caching
- **Next.js** built-in caching for static data
- **React Query** for client-side cache management
- **Database indexing** for query performance

## Development Guidelines

### Adding New Features
1. Define Zod validation schemas first
2. Create server actions with ZSA pattern
3. Implement query functions for data access
4. Add any required external service integration
5. Update database schema if needed

### Error Handling
- Use `zod-validation-error` for user-friendly messages
- Implement proper error boundaries in UI components
- Log errors to Sentry for monitoring
- Provide meaningful error responses

### Performance Considerations
- **Database queries** should use appropriate indexes
- **Server actions** should handle bulk operations efficiently
- **External services** should implement retry logic
- **Caching** should be used for expensive operations

### Security Patterns
- **Input validation** at all boundaries
- **Authentication** required for sensitive operations
- **Rate limiting** on public endpoints
- **Permission checks** in server actions

This architecture provides a solid foundation for the bobblehead collection platform with clear separation of concerns, type safety, and scalability.