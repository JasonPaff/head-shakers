# Step 1: Feature Refinement

**Status**: Complete
**Started**: 2025-11-28
**Duration**: ~5 seconds

## Original Request

"I'd like you to remove the likeCount column from the collections database. Any queries that were using the likeCount field should instead include the proper joins to fetch that information in a differently."

## Project Context Provided

- Next.js 16.0.3 with App Router, React 19.2.0, TypeScript
- PostgreSQL with Neon serverless, Drizzle ORM for database operations
- Drizzle-Zod for schema validation based on Drizzle schemas
- Zod for schema validation and type safety
- Next-Safe-Action for server actions
- Architecture: Server Actions for mutations, Server Components for data fetching
- Folder structure: src/lib/db/ for schema, src/lib/actions/ for server actions, src/lib/queries/ for database queries, src/lib/facades/ for business logic, src/lib/validations/ for Zod schemas

## Agent Prompt

```
Refine this feature request into a SINGLE PARAGRAPH (no headers, bullet points, or sections):

"I'd like you to remove the likeCount column from the collections database. Any queries that were using the likeCount field should instead include the proper joins to fetch that information in a differently."

Using the project context, expand the request with relevant technical details about how this would be implemented in this specific tech stack.

Output ONLY the refined paragraph (200-500 words), nothing else.
```

## Refined Feature Request

Remove the denormalized likeCount column from the collections table in the Drizzle ORM schema and update all related database operations to fetch like counts dynamically through proper SQL joins with the likes table instead. This requires modifying the collections schema definition in src/lib/db/schema.ts to remove the likeCount column, then updating all database queries in src/lib/queries/ that currently select or reference likeCount to instead perform an INNER JOIN or LEFT JOIN with the likes table (filtering by targetType and targetId) and use a COUNT aggregate function to compute the like count on-the-fly. Any Zod validation schemas in src/lib/validations/ that include likeCount in their type definitions must be updated to reflect the new structure, and the Drizzle-Zod generated schemas should be regenerated to match the updated table schema. Server actions in src/lib/actions/ that handle collection mutations should be reviewed to ensure they don't attempt to update or return likeCount directly, and facade layer methods in src/lib/facades/ that orchestrate collection queries should be refactored to include the necessary joins and aggregations in their select statements, ensuring the like count is properly calculated and returned as part of the collection object. Any type definitions used throughout the codebase that expect a likeCount property on collection objects should be updated to include the calculated field, and all components and pages consuming collection data should continue to work seamlessly with this new approach where the like count is fetched via join rather than read from a denormalized column.

## Validation Results

- **Format**: ✅ Single paragraph (no headers, sections, or bullet points)
- **Word Count**: ~280 words (within 200-500 range)
- **Length Ratio**: ~4x original length (acceptable)
- **Intent Preserved**: ✅ Core intent to remove likeCount and use joins maintained
- **Scope Control**: ✅ No feature creep, focuses on the specific task
