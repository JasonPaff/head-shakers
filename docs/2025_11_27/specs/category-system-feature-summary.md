# Category System Enhancement

## Feature Summary

This document outlines the planned improvements to how bobblehead collections and items are categorized on Head Shakers. These changes will provide collectors with a more structured, discoverable, and flexible way to organize and share their collections.

---

## Problem Statement

Currently, categories are free-form text fields. Users type whatever they want, leading to:

- Inconsistent data ("Sports" vs "sports" vs "Sport")
- Poor discoverability (hard to browse by category when everyone names things differently)
- Limited organization options (bobbleheads can only belong to one collection)

Power users like sports collectors with large, specialized collections have no way to organize items across multiple views (e.g., "All my Orioles bobbleheads" AND "Just my MLB bobbleheads" using the same items).

---

## Proposed Solution

### Structured Category System

Replace free-form text with a curated, hierarchical category system that users can browse and select from.

**Example hierarchy:**
- Sports
  - Baseball
    - MLB
      - Baltimore Orioles
      - New York Yankees
      - ...
    - Minor League
      - Bowie Baysox
      - ...
    - College
  - Football
    - NFL
    - College
  - Basketball
- Entertainment
  - Movies
  - TV Shows
  - Anime
- Music
- Gaming
- Pop Culture
- Mascots & Brands
- Historical & Political
- Holiday & Seasonal
- Other (Custom)

**Key characteristics:**
- Up to 5 levels of depth to accommodate detailed categorization
- Users select the most specific category that applies (e.g., "Baltimore Orioles" rather than just "Baseball")
- Up to 5 categories can be applied to a collection or bobblehead
- "Other" option available at any level for items that don't fit existing categories

### Multi-Collection Support

Allow bobbleheads to belong to multiple collections simultaneously.

**Example use case:**

A Baltimore Orioles collector could have:
1. "All My Orioles" - contains every Orioles-related bobblehead
2. "Baltimore Orioles MLB" - just the major league items
3. "Bowie Baysox" - just one minor league affiliate

The same bobblehead can appear in multiple collections without duplicating data. Edit it once, it updates everywhere.

### Community-Driven Growth

When users can't find the right category:
- They select "Other" and type what they were looking for
- These suggestions are collected for admin review
- Popular or valid suggestions can be added as official categories
- The category list grows organically based on real user needs

---

## User Benefits

| User Type | Benefit |
|-----------|---------|
| **New collectors** | Easy onboarding - browse and pick from a list instead of guessing what to type |
| **Serious collectors** | Organize large collections across multiple views without duplicating work |
| **Browsers** | Find collections by category with confidence that results are accurate |
| **Niche collectors** | Request new categories through "Other" option; system grows with the community |

---

## Key Features

### For Collectors

- **Category picker** - Drill down through the hierarchy to find the right category
- **Multi-select** - Apply up to 3 categories per collection or bobblehead
- **Multi-collection membership** - Add the same bobblehead to multiple collections
- **Bulk operations** - Add multiple items to a collection at once
- **Suggest new categories** - Can't find what you need? Suggest it via "Other"

### For Browsers & Searchers

- **Category browsing** - Navigate the category tree to discover collections
- **Subcategory toggle** - Choose whether to include subcategories in results (on by default)
- **Consistent results** - No more missing items due to typos or naming variations

### For Admins

- **Category management** - Add, edit, reorder, and nest categories
- **Suggestion review queue** - See what users are requesting, approve or reject
- **Analytics potential** - Clean data enables better insights on popular categories

---

## Example User Journey

**Meet Mike, a Baltimore Orioles collector:**

1. Mike creates a collection called "All My Orioles Bobbleheads"
2. He assigns categories: Baseball > MLB > Baltimore Orioles
3. He adds his 100+ bobbleheads to this collection
4. Later, Mike wants a focused view of just his minor league items
5. He creates "Bowie Baysox" collection with category: Baseball > Minor League > Bowie Baysox
6. He selects his 15 Baysox bobbleheads and adds them to this new collection
7. Those 15 bobbleheads now appear in BOTH collections
8. Mike edits a bobblehead's details - it updates in both places automatically
9. When browsing the site, Mike's collections appear under the appropriate categories
10. Other collectors searching for "Baltimore Orioles" find Mike's collection easily

---

## How Categories and Collections Work Together

- **Collections** have categories that describe what the collection is about
- **Bobbleheads** have categories that describe what the item is
- Both can have up to 3 categories
- Bobbleheads can belong to multiple collections
- A single bobblehead record is shared across all collections (no data duplication)

---

## Success Metrics

- Increase in categorized bobbleheads (vs. uncategorized)
- Reduction in "orphan" items that don't fit any browse category
- User engagement with category browsing features
- Growth of category suggestions indicating active user participation
- Collectors creating multiple collections (indicating multi-collection feature adoption)

---

## Future Considerations

- **Smart suggestions** - Recommend categories based on bobblehead name/description
- **Category following** - Let users follow categories for notifications on new additions
- **Trending categories** - Surface popular or growing categories on the homepage
- **Category-based achievements** - Gamification around collection completeness within a category

---

## Timeline & Priority

This feature is planned for implementation before the initial production release. Since no production data exists yet, this is the ideal time to make these foundational changes without migration concerns.

---

*Document prepared: November 27, 2025*
