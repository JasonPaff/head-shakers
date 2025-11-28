# Database Specialist Report

## Files Reviewed
- `src/lib/queries/featured-content/featured-content-query.ts` (method: `getFooterFeaturedContentAsync`)
- `src/lib/queries/newsletter/newsletter.queries.ts` (methods: `createSignupAsync`, `findByEmailAsync`, `resubscribeAsync`, `updateUserIdAsync`)

## Findings

### HIGH (2)
1. **featured-content-query.ts:448-476** - Missing soft delete filter for collections in `getFooterFeaturedContentAsync`. Query doesn't check `isNull(collections.deletedAt)` when joining.
2. **newsletter.queries.ts:105-125** - `isActiveSubscriberAsync` performs two separate queries when one would suffice (inefficient)

### MEDIUM (4)
1. **featured-content-query.ts:448-476** - No permission filters documented in `getFooterFeaturedContentAsync`
2. **newsletter.queries.ts:36-38** - NULL vs undefined inconsistency: accepts `userId: null | string` but converts to undefined before insert
3. **newsletter.queries.ts:130-147** - `resubscribeAsync` doesn't verify record exists before updating
4. **newsletter.queries.ts:174-191** - `updateUserIdAsync` no idempotency check (could overwrite existing userId)

### LOW (4)
1. **featured-content-query.ts:454-462** - Undocumented NULL handling in return type for `collectionName`/`collectionSlug`
2. **newsletter.queries.ts:36** - Email normalization not documented in JSDoc
3. **newsletter.queries.ts** - Duplicate email normalization logic across methods (DRY violation)
4. **newsletter.queries.ts:139** - `resubscribeAsync` overwrites original `subscribedAt` date, losing historical data

## Compliant Patterns
- All methods correctly use `Async` suffix
- Proper type inference from Drizzle schemas
- Returns `null` for single items when not found
- BaseQuery extension correct
