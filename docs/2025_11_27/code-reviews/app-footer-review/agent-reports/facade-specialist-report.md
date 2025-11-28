# Facade Specialist Report

## Files Reviewed
- `src/lib/facades/featured-content/featured-content.facade.ts` (method: `getFooterFeaturedContentAsync`)
- `src/lib/facades/newsletter/newsletter.facade.ts` (method: `subscribeAsync`)
- `src/lib/services/cache.service.ts` (method: `featured.content`)

## Findings

### HIGH (1)
1. **featured-content.facade.ts:308** - PII/Content Leakage in Breadcrumb: `data: { ...data }` spreads entire result into Sentry logs. Should only include safe metadata like `{ count: data.length }`.

### MEDIUM (3)
1. **featured-content.facade.ts:316** - Hardcoded cache key `'footer'` instead of using `CACHE_KEYS.FEATURED.FOOTER` constant
2. **newsletter.facade.ts:78** - Email normalization happens inside transaction after context creation. Should move before transaction for consistency.
3. **newsletter.facade.ts:173** - Fire-and-forget pattern missing `level: 'warning'` in Sentry.captureException for non-critical failure

### LOW (2)
1. **newsletter.facade.ts:161-197** - Redundant try-catch wrapper around fire-and-forget (already has `.catch()` handler)
2. **featured-content.facade.ts:105** - TODO comment for hardcoded `'active'` cache key not addressed

## Compliant Patterns
- Transaction usage in `subscribeAsync` is correct
- Sentry breadcrumbs present for success paths with safe metadata
- Email privacy handled correctly (substring masking)
- Domain-specific cache helper used correctly
