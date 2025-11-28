# Step 2: File Discovery

## Metadata

| Field | Value |
|-------|-------|
| Step | 2 of 3 |
| Start Time | 2025-11-28T00:00:30Z |
| End Time | 2025-11-28T00:01:30Z |
| Status | Completed |
| Duration | ~60 seconds |

## Input: Refined Feature Request

Remove the `totalValue` column from the `collections` table in the PostgreSQL database, as it represents a denormalized field that should be replaced with computed values fetched dynamically via proper SQL joins. This column currently stores a pre-calculated aggregate of bobblehead values within a collection, but maintaining this denormalized value creates data consistency challenges and requires manual updates whenever bobblehead values change. Instead, queries should join the `collections` table with the `bobbleheads` table to calculate the total value on-demand by summing the individual bobblehead values.

## Agent: file-discovery-agent

## Discovered Files

### CRITICAL Priority (Must Modify)

| File | Reason |
|------|--------|
| `src/lib/db/schema/collections.schema.ts` | Contains `totalValue` column definition (lines 33-36), default value, check constraint (line 68), and performance index (line 60) |
| `src/lib/constants/defaults.ts` | Contains `COLLECTION.TOTAL_VALUE: '0.00'` (line 27) |
| `src/lib/constants/schema-limits.ts` | Contains `TOTAL_VALUE: { PRECISION: 15, SCALE: 2 }` (line 34) |
| `src/lib/validations/collections.validation.ts` | Uses drizzle-zod schemas that auto-generate from DB schema |

### HIGH Priority (Direct References)

| File | Reason |
|------|--------|
| `src/lib/queries/collections/collections.query.ts` | Multiple `totalValue` references in `getBrowseCategoriesAsync` and `getBrowseCollectionsAsync` (lines 466, 493, 549, 575, 690, 716) |
| `src/lib/queries/featured-content/featured-content-query.ts` | References `totalValue` in type definition and SELECT query (lines 34, 412) |

### MEDIUM Priority (UI Display)

| File | Reason |
|------|--------|
| `src/app/(app)/(home)/components/display/featured-collections-display.tsx` | Displays `totalValue` in UI (lines 34, 206) |
| `src/app/(app)/(home)/components/async/featured-collections-async.tsx` | Converts `totalValue` from string to number (line 28) |

### LOW Priority (Tests & Supporting)

| File | Reason |
|------|--------|
| `tests/components/home/display/featured-collections-display.test.tsx` | Test fixtures include `totalValue` (lines 70, 88, 106, 230) |
| `tests/integration/queries/featured-content/featured-content-query.test.ts` | Test assertions include `totalValue: '0.00'` (lines 403, 760) |
| `tests/fixtures/collection.factory.ts` | Factory may rely on database defaults |
| `src/lib/db/scripts/seed.ts` | Seed data includes `totalValue: '0.00'` (lines 168, 175, 182, 189, 196) |

## Discovery Statistics

| Metric | Value |
|--------|-------|
| Directories Explored | 8 |
| Candidate Files Examined | 28 |
| Highly Relevant Files | 18 |
| Supporting Files | 10 |

## Architecture Insights

### Column Storage
- `totalValue` stored as `decimal` with precision 15, scale 2
- Has check constraint for non-negative values
- Has performance index for sorting

### Data Source
- Should be computed from `bobbleheads.purchasePrice`
- Join via `bobbleheads.collectionId` -> `collections.id`

### Recommended Query Pattern
```sql
LEFT JOIN bobbleheads ON collections.id = bobbleheads.collectionId
  AND bobbleheads.deletedAt IS NULL
GROUP BY collections.id
SELECT ..., COALESCE(SUM(bobbleheads.purchasePrice), 0) as totalValue
```

## Validation Results

| Check | Result |
|-------|--------|
| Minimum Files (3+) | PASS (18 files) |
| File Paths Validated | PASS |
| Smart Categorization | PASS |
| Comprehensive Coverage | PASS |

---
*Step 2 completed successfully*
