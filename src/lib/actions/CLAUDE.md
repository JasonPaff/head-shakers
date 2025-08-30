# CLAUDE.MD - Server Actions Directory

## Overview
This directory contains Next.js server actions that handle business logic for the bobblehead collection application. The actions use `next-safe-action` for type safety and validation, implement rate limiting, error handling, and transaction management.

## Architecture

### Action Clients
- **`authActionClient`**: For authenticated operations requiring user login
- **`publicActionClient`**: For public operations that don't require authentication

### Common Patterns
All actions follow consistent patterns:
- Input validation using Zod schemas
- Rate limiting middleware
- Comprehensive error handling with Sentry integration
- Transaction support for data consistency
- Cache invalidation with `revalidatePath`
- Standardized return format: `{ data, success }`

## File Structure

### `bobbleheads.actions.ts` ✅ IMPLEMENTED
Complete CRUD operations for bobblehead management:

**Create Operations:**
- `createBobbleheadAction` - Creates new bobblehead with photos

**Read Operations:**
- `getBobbleheadByIdAction` - Fetches single bobblehead with details
- `getBobbleheadsByCollectionAction` - Gets all bobbleheads in a collection
- `getBobbleheadsByUserAction` - Gets all bobbleheads for a user
- `searchBobbleheadsAction` - Search with filters, pagination

**Update Operations:**
- `updateBobbleheadAction` - Updates bobblehead data with ownership verification

**Delete Operations:**
- `deleteBobbleheadAction` - Deletes single bobblehead
- `deleteBobbleheadsAction` - Bulk delete with collection cache invalidation

**Photo Operations:**
- `uploadBobbleheadPhotoAction` - Upload new photo
- `updateBobbleheadPhotoAction` - Update photo metadata
- `deleteBobbleheadPhotoAction` - Delete photo
- `reorderBobbleheadPhotosAction` - Reorder photo display order

**Tag Operations:**
- `addTagToBobbleheadAction` - Associate tag with bobblehead
- `removeTagFromBobbleheadAction` - Remove tag association

### Placeholder Files (Empty - Need Implementation)
- `analytics.actions.ts` - Analytics and reporting actions
- `collections.actions.ts` - Collection management actions
- `moderation.actions.ts` - Content moderation actions
- `social.actions.ts` - Social features (likes, follows, shares)
- `system.actions.ts` - System administration actions
- `tags.actions.ts` - Tag management actions
- `users.actions.ts` - User profile and account actions

## Security Features

### Authorization
- Ownership verification for all mutation operations
- User ID validation from authentication context
- Resource-level permission checks

### Rate Limiting
- Create operations: 60 requests per 60 seconds
- Update operations: 60 requests per 60 seconds
- Delete operations: 30 requests per 60 seconds (single), 10 requests per 60 seconds (bulk)
- Photo operations: 30 requests per 60 seconds

### Error Handling
- Typed error responses with `ActionError` class
- Sentry integration for error tracking and breadcrumbs
- Consistent HTTP status codes
- Sanitized error messages for security

## Database Integration

### Transaction Management
- Actions marked with `isTransactionRequired: true` use database transactions
- Automatic rollback on errors
- Context-aware database connections (`ctx.db`, `ctx.tx`)

### Cache Management
- Automatic cache invalidation using `revalidatePath`
- Collection-specific cache invalidation
- Bulk operation cache optimization

## Validation & Sanitization

### Input Validation
- Zod schemas for all inputs (`insertBobbleheadSchema`, `updateBobbleheadSchema`, etc.)
- Type-safe parsed inputs
- Sanitized data access via `ctx.sanitizedInput`

### Schema Extensions
- Dynamic schema composition (e.g., `updateBobbleheadSchema.extend({ id: ... })`)
- Reusable validation patterns

## Monitoring & Observability

### Sentry Integration
- Context setting for business data
- Breadcrumb tracking for operations
- Error categorization and metadata
- Performance monitoring

### Action Metadata
- Standardized action naming (`ACTION_NAMES` constants)
- Operation tracking for analytics
- Transaction requirement flags

## Development Guidelines

### Adding New Actions
1. Create action client (auth vs public)
2. Add rate limiting middleware
3. Define metadata (name, transaction requirements)
4. Create input schema
5. Implement business logic with error handling
6. Add ownership verification for mutations
7. Include cache invalidation
8. Add Sentry context and breadcrumbs

### Error Handling Pattern
```typescript
try {
  // Business logic
} catch (error) {
  handleActionError(error, {
    input: parsedInput,
    metadata: { actionName: ACTION_NAMES.FEATURE.ACTION },
    operation: 'operation_name',
    userId, // if authenticated
  });
}
```

### Cache Invalidation Pattern
```typescript
revalidatePath(
  $path({
    route: '/route/[param]',
    routeParams: { param: value },
  }),
);
```

## Dependencies
- `@sentry/nextjs` - Error tracking and monitoring
- `next-typesafe-url` - Type-safe URL generation
- `next/cache` - Cache invalidation
- Custom middleware, services, and utilities
- Validation schemas from `@/lib/validations`
