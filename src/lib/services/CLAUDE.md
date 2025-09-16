# Services - CLAUDE.md

## Purpose

Infrastructure service layer providing resilient external integrations and cross-cutting concerns for the Head Shakers application. Services handle NextJS cache management, cache invalidation strategies, and third-party API interactions with fault tolerance and enterprise-grade reliability.

## Key Patterns

- **Static Service Classes**: All services use static methods without instantiation
- **Enterprise Cache Management**: NextJS `unstable_cache()` wrapper with comprehensive error handling and fallback patterns
- **Type-Safe Cache Operations**: Strict TypeScript typing for all cache keys, tags, and TTL configurations
- **Circuit Breaker Pattern**: External service calls wrapped in circuit breakers via `circuitBreakers` registry
- **Retry Logic**: Service operations use `withServiceRetry()` for transient failure handling
- **Error Transformation**: Service errors converted to domain errors using `createServiceError()` and custom error classes
- **Batch Operations**: Services provide both single and batch operation methods with consistent error handling

## Dependencies

- **External**: Cloudinary SDK for image management
- **Internal**: Circuit breaker registry, retry utilities, error builders, cache constants, cache tag generators
- **Framework**: Next.js cache system (`unstable_cache`, `revalidateTag`, `revalidatePath`)
- **Cache System**: Enterprise cache management utilities with type-safe operations

## Service Architecture

### CacheService

**Purpose**: Enterprise-grade cache management wrapper for NextJS `unstable_cache()`

**Key Methods**:
- `cached()`: Generic cache wrapper with comprehensive error handling and fallback patterns
- Domain-specific utilities: `bobbleheads.*`, `collections.*`, `users.*`, `featured.*`, `search.*`
- Statistics tracking: `getStats()`, `resetStats()` for performance monitoring
- Smart invalidation: Integration with `CacheRevalidationService` for tag-based invalidation

**Error Handling**:
- Graceful fallback to direct function execution on cache failures
- Comprehensive error statistics tracking (hits, misses, errors, hit rate)
- Force refresh capability that bypasses cache but still populates it
- Cache bypass mode for debugging and testing scenarios

**Important Patterns**:
- Environment-aware TTL adjustment using `getEnvironmentTTL()`
- Type-safe cache key generation with automatic length validation
- Memory leak protection through tag limits and builder patterns
- Structured logging with appropriate log levels for different operations

### CacheRevalidationService

**Purpose**: Manages NextJS cache invalidation using `revalidateTag` with enterprise patterns

**Key Methods**:
- Domain-specific invalidation: `bobbleheads.*`, `collections.*`, `users.*`, `social.*`, `featured.*`
- Administrative utilities: `admin.onFullRevalidation()`, `admin.onSystemChange()`
- Statistics tracking: Comprehensive revalidation metrics and performance monitoring
- Context-aware logging: Detailed operation tracking with reason codes

**Error Handling**:
- Never throws on revalidation failures to prevent disrupting operations
- Comprehensive error logging with operation context
- Statistics tracking for failed vs successful revalidations
- Graceful handling when caching is disabled

**Important Patterns**:
- Uses `CacheTagInvalidation` utilities for smart tag generation
- Operation-specific context tracking for monitoring and debugging
- Batch tag invalidation with performance considerations
- Environment-aware operation logging

### CloudinaryService

**Purpose**: Manages image operations with Cloudinary CDN

**Key Methods**:
- `deletePhotosByUrls()`: Batch delete using URL extraction
- `movePhotosToPermFolder()`: Atomic move from temp to permanent storage
- `generateUploadSignature()`: Creates secure upload signatures
- `getOptimizedUrl()`: Generates transformation URLs for responsive images

**Error Handling**:
- Custom `CloudinaryError` extends `ActionError` with proper error codes
- Circuit breaker wrapping for all Cloudinary API calls
- Retry logic with configurable attempts (default: 3)
- Returns partial success arrays for batch operations

**Important Patterns**:
- Public ID extraction from URLs using regex pattern matching
- Batch operations return detailed per-item results
- Uses `invalidate: true` for CDN cache clearing on moves

## Security Considerations

- Cloudinary credentials loaded from environment variables
- Upload signatures generated server-side only
- No direct credential exposure in error messages
- Secure URL generation enforced (`secure: true`)

## Cache Integration Patterns

### Facade Layer Integration

```typescript
// Use domain-specific cache utilities in facades
const result = await CacheService.bobbleheads.byId(
  () => this.queries.getById(id),
  bobbleheadId,
  { context: { userId, operation: 'facade:get-bobblehead' } }
);

// Invalidate after mutations
CacheRevalidationService.bobbleheads.onUpdate(bobbleheadId, userId, collectionId);
```

### Environment Configuration

- **Development**: 10% production TTL, verbose logging enabled
- **Production**: Full TTL, minimal logging for performance
- **Test**: Cache disabled for predictable test results
- **Edge**: Cache enabled, no logging for edge runtime compatibility

### Performance Monitoring

- **Cache Statistics**: Hit rate, total operations, error tracking
- **Revalidation Metrics**: Success/failure rates, tag invalidation counts
- **Structured Logging**: Operation context, timing, and error details
- **Memory Protection**: Tag limits and automatic cleanup

## Important Notes

- **Cloudinary Config**: Duplicate config calls exist (lines 12-23 in cloudinary.service.ts) - second overwrites first
- **Cache First**: Always prefer cache operations over direct database calls in service layer
- **Error Recovery**: Services never throw on cache invalidation failures to prevent disrupting operations
- **Memory Management**: Cache builders include automatic memory leak prevention
- **Type Safety**: All cache operations use strict TypeScript typing for keys and tags
- **Environment Safety**: Cache config validates environment with safe fallbacks
- **Batch Limits**: Cloudinary batch operations have API limits - consider chunking for large sets
- **Circuit Breaker Names**: Use consistent naming: `cloudinary-{operation}` for monitoring
- **Public ID Format**: `{folder}/{filename}` structure expected for proper organization
- **Cache Key Patterns**: Use `CACHE_KEYS` builders for consistent naming across the application
- **Tag Generation**: Use `CacheTagGenerators` for type-safe, validated cache tag creation