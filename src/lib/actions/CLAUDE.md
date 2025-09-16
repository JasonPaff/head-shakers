# Server Actions - CLAUDE.md

## Purpose

Server-side actions implementing business logic for the Head Shakers platform using Next.js server actions
with Next-Safe-Action (Server Actions) for type-safe operations and comprehensive error handling.

## Key Patterns

- **Action Chains**: Three distinct chains based on access level
  - `authActionClient`: Authenticated users (auth → sanitization → transaction)
  - `adminActionClient`: Admin/moderator users (admin → sanitization → transaction)
  - `publicActionClient`: No authentication required (database → sanitization → transaction)
- **Consistent Structure**: All actions follow `.metadata()` → `.inputSchema()` → `.action()` pattern
- **Transaction Support**: Optional database transactions via `isTransactionRequired` metadata

## Authentication

- **Middleware Chain**: Authentication verified through `authMiddleware` or `adminMiddleware`
- **User Context**: `ctx.userId` (internal DB ID) and `ctx.clerkUserId` (Clerk auth ID) available
- **Role-Based Access**: Admin actions have `ctx.isAdmin`, `ctx.isModerator`, and `ctx.role`
- **Permission Checks**: Additional ownership validation using `eq(table.userId, ctx.userId)`

## Error Handling

- **Centralized Handler**: `handleActionError()` function for consistent error processing
- **Error Classification**: ActionError with types (VALIDATION, DATABASE, BUSINESS_RULE, etc.)
- **Sentry Integration**: Automatic error tracking with context via `sentryMiddleware`
- **User-Friendly Messages**: Errors transformed to safe messages in `next-safe-action` client
- **Recovery Patterns**: `isRecoverable` flag for transient errors

## Data Validation

- **Zod Schemas**: All inputs validated using schemas from `lib/validations/*.validation.ts`
- **Input Sanitization**: Automatic via `sanitizationMiddleware` - available as `ctx.sanitizedInput`
- **Schema Reuse**: Common schemas like `insertBobbleheadSchema` extended for specific actions
- **Transform Support**: Number/string conversions and defaults handled in schemas

## Return Types

- **Success Pattern**: `{ data: T, success: true, message?: string }`
- **Error Pattern**: Handled by next-safe-action, returns `{ serverError: string }`
- **Consistent Shape**: All actions return predictable response structures

## Security Considerations

- **Rate Limiting**: Via `createRateLimitMiddleware(requests, windowInSeconds)`
- **SQL Injection**: Protected by Drizzle ORM parameterized queries
- **Ownership Validation**: Always check `eq(table.userId, ctx.userId)` for user resources
- **Admin Verification**: Admin actions verify privileges even after middleware
- **Soft Deletes**: Check `isDeleted` flags when querying user data

## Dependencies

- **Database**: Drizzle ORM with PostgreSQL (`ctx.db` or `ctx.tx`)
- **Validation**: Zod with drizzle-zod integration
- **Authentication**: Clerk via middleware
- **Caching**: Redis (Upstash) for rate limiting
- **Monitoring**: Sentry for error tracking
- **External Services**: Cloudinary (images), Ably (real-time)

## Important Notes

- **Action Names**: Use constants from `ACTION_NAMES` for consistency and tracking
- **Database Instance**: Use `ctx.tx ?? ctx.db` to support optional transactions
- **Path Revalidation**: Always revalidate affected routes after mutations
- **Service Layer**: Complex operations use service classes (e.g., `BobbleheadService`)
- **Metadata Required**: Every action must have `actionName` in metadata for tracking

## File Organization

- `collections.actions.ts`: Collection CRUD operations
- `bobbleheads.actions.ts`: Bobblehead management with photo handling
- `admin.actions.ts`: Featured content and platform management
- `admin/featured-content.actions.ts`: Specific featured content operations
- `content-search.actions.ts`: Search functionality for admin features
