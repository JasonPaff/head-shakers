---
name: caching
description: Enforces Head Shakers caching conventions when implementing cache layers using Next.js unstable_cache and Upstash Redis. This skill ensures consistent patterns for cache keys, tags, TTL configuration, and cache invalidation.
---

# Caching Skill

## Purpose

This skill enforces the Head Shakers caching conventions automatically during cache implementation. It ensures consistent patterns for cache keys, tags, TTL configuration, and cache invalidation.

## Activation

This skill activates when:

- Working with `CacheService` methods
- Implementing cached data fetching in facades
- Setting up cache invalidation after mutations
- Working with Redis operations for search caching
- Configuring cache tags and TTL values

## Workflow

1. Detect caching work (imports from `CacheService`, `CACHE_KEYS`, or `CacheTagGenerators`)
2. Load `references/Caching-Conventions.md`
3. Generate/modify code following all conventions
4. Scan for violations of caching patterns
5. Auto-fix all violations (no permission needed)
6. Report fixes applied

## Key Patterns

- Use `CacheService.{domain}.{method}` for domain-specific caching
- Use `CacheTagGenerators` for consistent tag generation
- Use `CACHE_KEYS` constants for cache key patterns
- Use `CACHE_CONFIG.TTL` for TTL values
- Invalidate cache with `CacheService.invalidateByTag` after mutations
- Use `CacheRevalidationService` for coordinated invalidation

## References

- `references/Caching-Conventions.md` - Complete caching conventions
