# Constants - CLAUDE.md

## Purpose

Centralized application constants for a Head Shakers bobblehead collection platform. This directory provides type-safe constants, configuration values, validation limits, and system defaults to ensure consistency across the application. Includes enterprise-grade cache configuration and management utilities.

## Key Patterns

- **Nested Object Structure**: All constants use nested objects for categorization (e.g., `CONFIG.CACHE.TTL`)
- **`as const` Assertions**: All constant objects use `as const` for strict type inference and immutability
- **Type Helpers**: Most files include TypeScript utility types and helper functions for type safety
- **Environment Overrides**: Configuration supports environment-specific overrides via helper functions
- **Builder Functions**: Key builders and validator functions are provided alongside constants

## Configuration Architecture

### Core Configuration Files

- **config.ts**: Primary application settings with environment-specific overrides via `getEnvironmentConfig()`
- **cache.ts**: Enterprise-grade cache configuration with environment-aware settings, TTL management, and key builders
- **defaults.ts**: Database entity default values organized by table/model name
- **enums.ts**: Valid enum values for database fields and UI options
- **schema-limits.ts**: Database field length limits and constraints for validation

### System Integration Constants

- **action-names.ts**: Server action names grouped by domain (ADMIN, BOBBLEHEADS, COLLECTIONS, etc.)
- **cache.ts**: NextJS unstable_cache() configuration with environment-specific settings, TTL multipliers, and cache key builders
- **redis-keys.ts**: Redis key patterns with builder functions and TTL settings
- **error-messages.ts**: Standardized error messages organized by domain
- **sentry.ts**: Error tracking tags, contexts, and operations for monitoring

## Important Conventions

### Constant Naming

- Use SCREAMING_SNAKE_CASE for constant object names
- Use PascalCase for nested categories
- Use descriptive, domain-specific prefixes

### Type Safety Patterns

```typescript
// Constant with type extraction
export const ENUMS = { ... } as const;
export type UserRole = (typeof ENUMS.USER.ROLE)[number];

// Helper functions for type-safe access
export const getConfig = <T extends keyof typeof CONFIG>(category: T) => CONFIG[category];
```

### Key Builder Functions

- Redis keys use builder functions: `REDIS_KEYS.CACHE.BOBBLEHEAD(id)`
- Cache keys use parameterized functions for consistency
- Error messages are accessed via nested object paths

### Environment Handling

- Development environment: Relaxed rate limits, shorter cache TTLs
- Test environment: Disabled analytics and email notifications
- Production environment: Uses default CONFIG values

## Critical Dependencies

- Uses TypeScript strict mode with `as const` for type safety
- No runtime dependencies - pure constant definitions
- Integrates with Redis, Sentry, database schemas, and caching layers

## Cache Configuration (cache.ts)

### Environment-Specific Settings

- **Development**: Cache enabled with verbose logging, 10% production TTL
- **Production**: Cache enabled with minimal logging, full TTL
- **Test**: Cache disabled for predictable testing, 1% TTL
- **Edge**: Cache enabled with no logging for edge runtime compatibility

### Cache Key Builders

- **CACHE_KEYS.BOBBLEHEADS**: Key patterns for bobblehead operations (`BY_ID`, `BY_USER`, `SEARCH`)
- **CACHE_KEYS.COLLECTIONS**: Collection-specific cache keys with options hashing
- **CACHE_KEYS.FEATURED**: Featured content keys organized by type
- **CACHE_KEYS.USERS**: User profile, stats, and activity cache keys

### Cache Tag System

- **Entity Tags**: `CACHE_CONFIG.TAGS.BOBBLEHEAD(id)`, `CACHE_CONFIG.TAGS.USER(id)`
- **Feature Tags**: `FEATURED_CONTENT`, `POPULAR_CONTENT`, `PUBLIC_CONTENT`
- **Relationship Tags**: `USER_BOBBLEHEADS(userId)`, `COLLECTION_BOBBLEHEADS(collectionId)`

### TTL Configuration

- **REALTIME**: 30 seconds for frequently changing data
- **SHORT**: 5 minutes for user-specific data
- **MEDIUM**: 30 minutes for semi-static data
- **LONG**: 1 hour for relatively stable data
- **EXTENDED**: 4 hours for rarely changing data
- **DAILY/WEEKLY**: Long-term caching for aggregated data

## Important Notes

- **Schema Limits**: Use `SCHEMA_LIMITS` for form validation and database constraints
- **Rate Limiting**: Action-specific limits in `CONFIG.RATE_LIMITING.ACTION_SPECIFIC`
- **Feature Flags**: Toggle features using `CONFIG.FEATURES` and `isFeatureEnabled()`
- **Cache Strategy**: Use `CACHE_KEYS` builders and `CACHE_CONFIG.TAGS` for consistent cache management
- **Environment Safety**: Cache config uses `getValidatedEnvironment()` with safe fallbacks to production
- **Error Handling**: Use domain-specific error messages from `ERROR_MESSAGES` for consistency
- **Configuration Override**: Always use `getEnvironmentConfig()` instead of direct `CONFIG` access for environment-aware settings
- **TTL Adjustment**: Use `getEnvironmentTTL()` for environment-aware cache duration calculation
