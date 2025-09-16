# Facades - CLAUDE.md

## Purpose

Domain-specific facade layer providing clean, type-safe interfaces between client actions and backend services. Facades handle business logic orchestration, cache management integration, and cross-cutting concerns while maintaining separation between frontend and data access layers.

## Key Patterns

- **Domain Organization**: Each facade handles a specific business domain (bobbleheads, collections, users, etc.)
- **Static Service Classes**: All facades use static methods without instantiation for simplicity
- **Cache-First Architecture**: Integrated with enterprise cache management system for optimal performance
- **Error Transformation**: Converts service-layer errors to domain-appropriate ActionError instances
- **Transaction Coordination**: Manages database transactions and cache invalidation as atomic operations

## Cache Integration

### Cache-First Operations

```typescript
// Read operations use cache service
const bobblehead = await CacheService.bobbleheads.byId(
  () => this.queries.getById(id),
  bobbleheadId,
  { context: { userId, operation: 'facade:get-bobblehead' } }
);

// Write operations invalidate cache
const result = await this.mutations.updateBobblehead(data);
CacheRevalidationService.bobbleheads.onUpdate(bobbleheadId, userId, collectionId);
```

### Domain-Specific Cache Utilities

- **Bobbleheads**: `CacheService.bobbleheads.*` for bobblehead operations
- **Collections**: `CacheService.collections.*` for collection operations
- **Users**: `CacheService.users.*` for user profile and stats caching
- **Featured Content**: `CacheService.featured.*` for featured content caching
- **Search**: `CacheService.search.*` for search result caching

### Cache Invalidation Patterns

- **Create Operations**: Invalidate user lists, public content, and related aggregates
- **Update Operations**: Invalidate entity-specific caches and relationship caches
- **Delete Operations**: Comprehensive invalidation including cleanup of orphaned references
- **Relationship Changes**: Bidirectional invalidation for collection membership, follows, etc.

## Facade Architecture

### Business Logic Layer

- **Input Validation**: Zod schema validation with domain-specific rules
- **Authorization**: Role-based access control integrated with authentication
- **Business Rules**: Domain-specific validation and constraint enforcement
- **Error Handling**: Comprehensive error transformation with user-friendly messages

### Data Orchestration

- **Multi-Service Coordination**: Coordinate between database, file storage, and external APIs
- **Transaction Management**: Ensure data consistency across multiple operations
- **Cache Coherence**: Maintain cache consistency during complex operations
- **Event Sequencing**: Proper ordering of operations and side effects

### Performance Optimization

- **Smart Caching**: Domain-aware cache strategies with appropriate TTL values
- **Batch Operations**: Efficient bulk operations where applicable
- **Lazy Loading**: On-demand loading of related data
- **Query Optimization**: Facade-level query planning and optimization

## Integration Patterns

### Service Layer Integration

```typescript
class BobbleheadsFacade {
  // Cache-integrated reads
  static async getById(id: string, userId?: string) {
    return CacheService.bobbleheads.byId(
      () => BobbleheadsQueries.getById(id),
      id,
      { context: { userId, operation: 'facade:get-bobblehead' } }
    );
  }

  // Transactional writes with cache invalidation
  static async update(id: string, data: UpdateData, userId: string) {
    const result = await BobbleheadsMutations.update(id, data);
    CacheRevalidationService.bobbleheads.onUpdate(id, userId);
    return result;
  }
}
```

### Authentication Integration

- **User Context**: All facade methods receive user context for authorization
- **Role Validation**: Automatic role checking for admin/moderator operations
- **Ownership Verification**: Ensure users can only modify their own resources
- **Public/Private Access**: Handle visibility rules for public content

## Error Handling Patterns

### Domain Error Transformation

- **Database Errors**: Transform PostgreSQL errors to business-friendly messages
- **Validation Errors**: Convert Zod validation failures to field-specific errors
- **Authorization Errors**: Clear messaging for permission and access issues
- **External Service Errors**: Handle Cloudinary, email service, and other external failures

### Error Recovery

- **Cache Fallbacks**: Graceful degradation when cache operations fail
- **Partial Success**: Handle batch operations with some failures
- **Retry Logic**: Automatic retry for transient failures
- **Circuit Breakers**: Fail-fast for external service degradation

## Performance Considerations

### Cache Strategy

- **TTL Selection**: Domain-appropriate cache durations (REALTIME to WEEKLY)
- **Tag Management**: Smart invalidation using relationship-aware tags
- **Memory Protection**: Automatic tag limits and memory leak prevention
- **Hit Rate Optimization**: Monitor and optimize cache performance

### Query Optimization

- **N+1 Prevention**: Batch loading of related entities
- **Selective Loading**: Load only required fields for specific operations
- **Pagination**: Efficient cursor-based pagination for large datasets
- **Index Utilization**: Query patterns that leverage database indexes

## Important Notes

- **Cache First**: Always prefer cached data over direct database queries for read operations
- **Atomic Operations**: Ensure cache invalidation happens atomically with data mutations
- **Error Isolation**: Cache failures should never prevent core business operations
- **Type Safety**: All cache operations use strict TypeScript typing
- **Performance Monitoring**: Track cache hit rates and operation performance
- **Environment Awareness**: Cache behavior adapts to development/production environments
- **Memory Management**: Use cache builders with automatic cleanup and limits
- **Consistent Patterns**: Follow established patterns for cache key generation and tag management