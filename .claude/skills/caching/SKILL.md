---
name: caching
description: Enforces Head Shakers caching conventions when implementing cache layers using Next.js unstable_cache and Upstash Redis. This skill ensures consistent patterns for cache keys, tags, TTL configuration, cache invalidation, and domain-specific CacheService helpers.
---

# Caching Skill

## Purpose

This skill enforces the Head Shakers caching conventions automatically during cache implementation. It ensures consistent patterns for domain-specific CacheService helpers, cache keys, tags, TTL configuration, and coordinated cache invalidation with CacheRevalidationService.

## Activation

This skill activates when:

- Working with `CacheService` domain-specific helpers (`.bobbleheads`, `.collections`, `.users`, `.search`, `.analytics`, `.featured`)
- Implementing cached data fetching in facades
- Setting up cache invalidation after mutations using `CacheRevalidationService`
- Working with Redis operations for high-traffic public search caching
- Configuring cache tags and TTL values
- Using `CACHE_KEYS`, `CACHE_CONFIG`, or `CacheTagGenerators`

## Workflow

1. Detect caching work (imports from `CacheService`, `CacheRevalidationService`, `CACHE_KEYS`, or `CacheTagGenerators`)
2. Load `references/Caching-Conventions.md`
3. Generate/modify code following all conventions
4. Scan for violations of caching patterns
5. Auto-fix all violations (no permission needed)
6. Report fixes applied

## Key Patterns

### CacheService Domain Helpers

- Use `CacheService.bobbleheads.{method}()` for bobblehead caching
- Use `CacheService.collections.{method}()` for collection caching
- Use `CacheService.users.{method}()` for user caching
- Use `CacheService.search.{method}()` for search caching (Next.js unstable_cache)
- Use `CacheService.redisSearch.{method}()` for high-traffic public search (Redis)
- Use `CacheService.analytics.{method}()` for analytics caching
- Use `CacheService.featured.{method}()` for featured content caching

### Cache Invalidation

- Use `CacheRevalidationService.{domain}.on{Operation}()` for coordinated invalidation
- Use `CacheService.invalidateByTag()` for direct tag-based invalidation
- Always invalidate cache after mutations in server actions
- Check `RevalidationResult.isSuccess` and log failures to Sentry as warnings

### Constants and Utilities

- Use `CACHE_KEYS.{DOMAIN}.{METHOD}()` for cache key generation
- Use `CacheTagGenerators.{domain}.{method}()` for tag generation
- Use `CACHE_CONFIG.TTL.{LEVEL}` for TTL values (SHORT, MEDIUM, LONG, EXTENDED, PUBLIC_SEARCH)
- Use `createHashFromObject()` for generating option hashes in cache keys

## Usage Pattern Reference

| Use Case         | CacheService Helper                         | Invalidation Service                                |
| ---------------- | ------------------------------------------- | --------------------------------------------------- |
| Bobblehead by ID | `CacheService.bobbleheads.byId()`           | `CacheRevalidationService.bobbleheads.onUpdate()`   |
| Collection list  | `CacheService.collections.byUser()`         | `CacheRevalidationService.collections.onCreate()`   |
| User profile     | `CacheService.users.profile()`              | `CacheRevalidationService.users.onProfileUpdate()`  |
| Public search    | `CacheService.redisSearch.publicDropdown()` | `CacheService.search.invalidatePublic()`            |
| Analytics        | `CacheService.analytics.viewCounts()`       | `CacheRevalidationService.analytics.onViewRecord()` |
| Social (likes)   | N/A (use tag generators)                    | `CacheRevalidationService.social.onLikeChange()`    |

## References

- `references/Caching-Conventions.md` - Complete caching conventions
