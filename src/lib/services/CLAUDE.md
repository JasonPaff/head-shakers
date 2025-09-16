# Services - CLAUDE.md

## Purpose

Infrastructure service layer providing resilient external integrations and cross-cutting concerns for the Head Shakers application. Services handle cache invalidation strategies and third-party API interactions with fault tolerance.

## Key Patterns

- **Static Service Classes**: All services use static methods without instantiation
- **Circuit Breaker Pattern**: External service calls wrapped in circuit breakers via `circuitBreakers` registry
- **Retry Logic**: Service operations use `withServiceRetry()` for transient failure handling
- **Error Transformation**: Service errors converted to domain errors using `createServiceError()` and custom error classes
- **Batch Operations**: Services provide both single and batch operation methods with consistent error handling

## Dependencies

- **External**: Cloudinary SDK for image management
- **Internal**: Circuit breaker registry, retry utilities, error builders, cache constants
- **Framework**: Next.js cache revalidation (`revalidatePath`, `revalidateTag`)

## Service Architecture

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

## Important Notes

- **Cloudinary Config**: Duplicate config calls exist (lines 12-23 in cloudinary.service.ts) - second overwrites first
- **Error Recovery**: Services never throw on cache invalidation failures to prevent disrupting operations
- **Batch Limits**: Cloudinary batch operations have API limits - consider chunking for large sets
- **Circuit Breaker Names**: Use consistent naming: `cloudinary-{operation}` for monitoring
- **Public ID Format**: `{folder}/{filename}` structure expected for proper organization