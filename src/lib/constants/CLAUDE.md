# Constants - CLAUDE.md

## Purpose
Centralized application constants for a Head Shakers bobblehead collection platform. This directory provides type-safe constants, configuration values, validation limits, and system defaults to ensure consistency across the application.

## Key Patterns
- **Nested Object Structure**: All constants use nested objects for categorization (e.g., `CONFIG.CACHE.TTL`)
- **`as const` Assertions**: All constant objects use `as const` for strict type inference and immutability
- **Type Helpers**: Most files include TypeScript utility types and helper functions for type safety
- **Environment Overrides**: Configuration supports environment-specific overrides via helper functions
- **Builder Functions**: Key builders and validator functions are provided alongside constants

## Configuration Architecture

### Core Configuration Files
- **config.ts**: Primary application settings with environment-specific overrides via `getEnvironmentConfig()`
- **defaults.ts**: Database entity default values organized by table/model name
- **enums.ts**: Valid enum values for database fields and UI options
- **schema-limits.ts**: Database field length limits and constraints for validation

### System Integration Constants
- **action-names.ts**: Server action names grouped by domain (ADMIN, BOBBLEHEADS, COLLECTIONS, etc.)
- **cache.ts**: Cache keys, tags, and TTL values for data caching strategy
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

## Important Notes
- **Schema Limits**: Use `SCHEMA_LIMITS` for form validation and database constraints
- **Rate Limiting**: Action-specific limits in `CONFIG.RATE_LIMITING.ACTION_SPECIFIC`
- **Feature Flags**: Toggle features using `CONFIG.FEATURES` and `isFeatureEnabled()`
- **Cache Strategy**: Cache keys include invalidation tags for efficient cache management
- **Error Handling**: Use domain-specific error messages from `ERROR_MESSAGES` for consistency
- **Configuration Override**: Always use `getEnvironmentConfig()` instead of direct `CONFIG` access for environment-aware settings