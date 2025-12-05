# Step 2: Source & Test Discovery

**Start Time**: 2025-12-04T00:01:00Z
**End Time**: 2025-12-04T00:02:00Z
**Duration**: ~60 seconds
**Status**: Complete

## Input (Refined Scope from Step 1)

Feature area involves:
- Home page route and components
- Featured bobblehead display (server and client components)
- Featured content facade and queries
- Redis caching service
- Cloudinary image handling

## Agent Prompt

```
Discover all source files and existing E2E tests for the home page featured bobblehead section in the Head Shakers project.

Based on the refined scope, the feature involves:
- Home page route and components
- Featured bobblehead display (server and client components)
- Featured content facade and queries
- Redis caching service
- Cloudinary image handling

**TASK**: Search the codebase and discover:

1. **Source Files in `src/`**:
   - Home page components: `src/app/(app)/(home)/**/*`
   - Featured content related: `src/lib/facades/featured-content/**/*`, `src/lib/queries/featured-content/**/*`
   - Cache service: `src/lib/services/cache*.ts`
   - Any components in `src/components/` related to featured content or bobblehead display

2. **Existing E2E Tests in `tests/e2e/`**:
   - Look for any E2E tests in `tests/e2e/specs/**/*.spec.ts`
   - Check for home page tests, featured content tests, or bobblehead display tests

For each discovered file, provide:
- Full file path
- Category: SOURCE or TEST
- Priority: Critical (core logic), High (user-facing), Medium (supporting), Low (utilities)
- Brief description of what the file does

Use glob patterns and grep to thoroughly search. Return a comprehensive list of all relevant files.
```

## Agent Response Summary

### Discovered Source Files (27 relevant files)

#### Critical Priority (Core Implementation)
| File Path | Description |
|-----------|-------------|
| `src/app/(app)/(home)/page.tsx` | Main home page route, renders HeroSection |
| `src/app/(app)/(home)/components/sections/hero-section.tsx` | Hero section container with featured bobblehead |
| `src/app/(app)/(home)/components/display/featured-bobblehead-display.tsx` | Client component for featured card display |
| `src/app/(app)/(home)/components/async/featured-bobblehead-async.tsx` | Server component fetching data |
| `src/lib/facades/featured-content/featured-content.facade.ts` | Business logic with caching |
| `src/lib/queries/featured-content/featured-content-query.ts` | Database queries with Drizzle ORM |

#### High Priority (Supporting)
| File Path | Description |
|-----------|-------------|
| `src/lib/queries/featured-content/featured-content-transformer.ts` | Data transformation |
| `src/lib/services/cache.service.ts` | Redis + unstable_cache service |
| `src/lib/services/cache-revalidation.service.ts` | Cache invalidation |
| `src/app/(app)/(home)/components/skeleton/featured-bobblehead-skeleton.tsx` | Loading skeleton |

#### Medium Priority (Context/Related)
| File Path | Description |
|-----------|-------------|
| `src/lib/utils/cloudinary.utils.ts` | Cloudinary URL utilities |
| `src/lib/utils/redis-client.ts` | Redis client operations |
| `src/lib/constants/cache.ts` | Cache configuration |
| `src/lib/constants/operations.ts` | Operation name constants |
| Other home sections (trending, collections, platform stats) | Related components |

### Discovered Test Files (14 files)

#### E2E Tests
| File Path | Description |
|-----------|-------------|
| `tests/e2e/specs/public/home-sections.spec.ts` | Public home page E2E tests |
| `tests/e2e/specs/user/home-authenticated.spec.ts` | Authenticated home page E2E tests |
| `tests/e2e/specs/smoke/auth-flow.spec.ts` | Authentication flow smoke tests |
| `tests/e2e/specs/smoke/health.spec.ts` | Basic health checks |
| `tests/e2e/pages/home.page.ts` | Home page Page Object |

#### Component Tests
| File Path | Description |
|-----------|-------------|
| `tests/components/home/display/featured-bobblehead-display.test.tsx` | FeaturedBobbleheadDisplay tests |
| `tests/components/home/sections/hero-section.test.tsx` | HeroSection tests |
| `tests/components/home/skeleton/featured-bobblehead-skeleton.test.tsx` | Skeleton tests |

#### Integration Tests
| File Path | Description |
|-----------|-------------|
| `tests/integration/facades/featured-content/featured-content.facade.test.ts` | Facade integration tests |
| `tests/integration/queries/featured-content/featured-content-query.test.ts` | Query integration tests |

#### Unit Tests
| File Path | Description |
|-----------|-------------|
| `tests/unit/lib/queries/featured-content/featured-content-transformer.test.ts` | Transformer unit tests |

#### Fixtures
| File Path | Description |
|-----------|-------------|
| `tests/fixtures/featured-content.factory.ts` | Featured content factory |
| `tests/fixtures/bobblehead.factory.ts` | Bobblehead factory |

## Architecture Insights

**Layered Architecture Pattern:**
1. **Route Layer** (`page.tsx`) → Renders sections with Suspense boundaries
2. **Section Layer** (HeroSection) → Orchestrates async/display components
3. **Async Layer** (FeaturedBobbleheadAsync) → Server components calling facades
4. **Facade Layer** (FeaturedContentFacade) → Business logic + caching
5. **Query Layer** (FeaturedContentQuery) → Database operations with Drizzle ORM
6. **Display Layer** (FeaturedBobbleheadDisplay) → Client component for interactivity

**Caching Strategy:**
- Two-tier: Redis (distributed) + Next.js unstable_cache (in-memory)
- TTL: EXTENDED (4 hours production, 48 minutes development)
- Cache key: `featured:featured-bobblehead`

## Existing E2E Test Coverage

### What's Covered:
- Home page visibility checks (public and authenticated)
- Hero section rendering
- Platform stats display
- Basic navigation

### E2E Test Gaps Identified:
- No specific tests for featured bobblehead card interactions (click, navigation)
- No tests for Cloudinary image loading
- No tests for featured bobblehead stats display accuracy
- No tests for empty state/fallback when no featured content
- No tests for floating cards animations
- No tests for responsive behavior
- No tests for dark mode rendering

## Validation Results

- **Source Files**: 27 relevant files discovered
- **Test Files**: 14 files discovered (4 E2E specs, 1 Page Object, component/integration/unit tests)
- **File Validation**: All paths verified to exist
- **Coverage Map**: Source-to-test mapping complete
