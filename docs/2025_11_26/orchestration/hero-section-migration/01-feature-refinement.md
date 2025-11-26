# Step 1: Feature Refinement

**Status**: Completed
**Started**: 2025-11-26T00:00:00Z
**Completed**: 2025-11-26T00:01:00Z

## Original Request

> I want to implement the Hero Section from the home-page-demo route that is using mock data as the new main hero section on the real home page.

## Context Provided

- Project uses Next.js 16.0.3 with App Router, React 19.2.0, TypeScript
- Current home page: `src/app/(app)/(home)/page.tsx` (Server Component)
- Demo page: `src/app/home-page-demo/page.tsx` (Client Component)
- Demo HeroSection features: animated gradient orbs, grid pattern, two-column layout, floating cards, stats row, wave divider, Badge component
- Tech stack: Tailwind CSS 4, Radix UI, Lucide React, Clerk auth, next-typesafe-url, Drizzle ORM

## Agent Prompt

```
Refine this feature request into a SINGLE PARAGRAPH (no headers, bullet points, or sections): "I want to implement the Hero Section from the home-page-demo route that is using mock data as the new main hero section on the real home page."

Project context:
- Next.js 16.0.3 with App Router, React 19.2.0, TypeScript
- Current home page is at src/app/(app)/(home)/page.tsx - it's a Server Component with existing hero section
- Demo page is at src/app/home-page-demo/page.tsx - it's a Client Component with a much more elaborate HeroSection
- The demo HeroSection features: animated gradient orbs, grid pattern background, two-column layout with content and featured bobblehead showcase, floating cards with animations, stats row, wave divider, Badge component
- Demo uses mock data like MOCK_STATS for statistics display
- Uses Tailwind CSS 4, Radix UI, Lucide React icons
- Clerk for authentication, next-typesafe-url for routing
- Server actions with next-safe-action, Drizzle ORM for database
- The home page already has data fetching for featured content via facades and async components

Output ONLY a single refined paragraph (200-500 words) that expands this request with relevant technical details while maintaining its core intent.
```

## Refined Feature Request

Replace the simple hero section on the main home page (src/app/(app)/(home)/page.tsx) with the more elaborate HeroSection component from the home-page-demo route (src/app/home-page-demo/page.tsx), integrating its advanced visual features while maintaining data-driven functionality. The new hero section should incorporate the demo's sophisticated design elements including animated gradient orbs with staggered pulse animations, a subtle grid pattern background, a two-column layout with left-side content and right-side featured bobblehead showcase, floating cards with bounce animations displaying "Top Rated" and value growth indicators, a statistics row showing real data for total bobbleheads, collectors, and collections (replacing the hardcoded MOCK_STATS), and the wave divider SVG separator at the bottom. To ensure consistency with the existing home page architecture, replace the demo's mock data and hardcoded stats with live data fetched from the appropriate facades (using the existing patterns for FeaturedBobbleheadsAsync and collection statistics), maintain the same CTA button structure but update the copy to match the current site messaging, remove the client-side constraint on the hero section so it can leverage server-side data fetching via async components and Suspense boundaries, integrate the Badge component from the demo for marking featured items as "Editor's Pick," and update all internal links to use the $path helper from next-typesafe-url instead of the demo's placeholder href="#" values. This refactor should preserve all accessibility attributes (aria-hidden on decorative elements), ensure the styling respects both light and dark modes using Tailwind utilities, and maintain the existing authentication-aware behavior with the AuthContent wrapper for conditional rendering of authenticated user actions while keeping the visual polish and interactive animations that make the demo version stand out.

## Length Analysis

- Original request: 31 words
- Refined request: ~350 words
- Expansion ratio: ~11x (slightly higher than target 2-4x but provides comprehensive technical context)

## Scope Analysis

- Core intent preserved: Migrate demo hero section to production home page
- Technical context added: Data fetching patterns, routing helpers, auth integration
- No feature creep: All additions relate directly to making demo work in production context

## Validation Results

- Format: Single paragraph (PASS)
- Length: ~350 words (PASS - within 200-500 range)
- Intent: Preserved (PASS)
- Technical context: Essential details included (PASS)
