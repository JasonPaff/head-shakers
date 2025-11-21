# SEO Implementation Guide - Head Shakers Platform

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Components Reference](#components-reference)
4. [Content Type Examples](#content-type-examples)
5. [Configuration Guide](#configuration-guide)
6. [Adding Metadata to New Pages](#adding-metadata-to-new-pages)
7. [Cache Management](#cache-management)
8. [Testing](#testing)
9. [Troubleshooting Guide](#troubleshooting-guide)
10. [Performance Optimization](#performance-optimization)
11. [Maintenance Procedures](#maintenance-procedures)
12. [Security Considerations](#security-considerations)

---

## Overview

### Purpose and Goals

The SEO implementation for Head Shakers provides comprehensive search engine optimization and social media sharing capabilities across the platform. The system ensures that:

- **Search Engines** can efficiently discover, crawl, and index public content
- **Social Media Platforms** display rich previews when content is shared
- **Metadata** is automatically generated, cached, and invalidated when content changes
- **Performance** remains optimal through intelligent caching and ISR (Incremental Static Regeneration)

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Page Component                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ generateMetadata() - Server-side metadata generation     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                     │
│                            ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ generatePageMetadata() - Core orchestration utility      │  │
│  │  • Combines OG, Twitter, Robots, Verification           │  │
│  │  • Enforces character limits                            │  │
│  │  • Handles image optimization                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                     │
│              ┌─────────────┼─────────────┐                      │
│              ▼             ▼             ▼                      │
│    ┌─────────────┐  ┌──────────┐  ┌──────────┐               │
│    │ Open Graph  │  │ Twitter  │  │ JSON-LD  │               │
│    │  Metadata   │  │   Card   │  │ Schemas  │               │
│    └─────────────┘  └──────────┘  └──────────┘               │
│              │             │             │                      │
│              └─────────────┼─────────────┘                      │
│                            ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Caching Layer (Redis + Upstash)                         │  │
│  │  • 1-hour TTL for metadata                              │  │
│  │  • Tag-based invalidation on content updates            │  │
│  │  • Cache warming for featured content                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                     │
│                            ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ ISR (Incremental Static Regeneration)                   │  │
│  │  • Static pages: Revalidated on demand                  │  │
│  │  • Dynamic pages: ISR with 60s revalidation             │  │
│  │  • Sitemap: Generated on-demand with database queries   │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Key Components and Responsibilities

| Component              | Responsibility                                           |
| ---------------------- | -------------------------------------------------------- |
| **metadata.utils.ts**  | Core orchestration - generates complete metadata objects |
| **opengraph.utils.ts** | Open Graph and Twitter Card metadata generation          |
| **jsonld.utils.ts**    | Structured data (schema.org) generation                  |
| **cache.utils.ts**     | Metadata caching, invalidation, and warming              |
| **preview.utils.ts**   | Preview mode for content editors                         |
| **seo.constants.ts**   | Configuration values, limits, defaults                   |
| **sitemap.ts**         | Dynamic sitemap generation                               |
| **robots.ts**          | Robots.txt configuration                                 |
| **/api/preview**       | Preview mode API endpoint                                |

### Technology Stack

- **Next.js 16** - App Router with native Metadata API
- **React 19** - Server Components for data fetching
- **Drizzle ORM** - Database queries for dynamic content
- **Upstash Redis** - Metadata caching layer
- **Cloudinary** - Image optimization for social previews
- **Sentry** - Performance monitoring and error tracking
- **next-typesafe-url** - Type-safe URL generation

---

## Architecture

### Metadata Generation Flow

```
1. User/Search Engine requests page
   │
   ▼
2. Next.js invokes generateMetadata()
   │
   ▼
3. Check cache for existing metadata
   │
   ├─ Cache Hit: Return cached metadata (fast path)
   │
   └─ Cache Miss:
      │
      ▼
   4. Fetch content from database (via Facade)
      │
      ▼
   5. Generate metadata using utilities
      │  • generatePageMetadata()
      │  • generateOpenGraphMetadata()
      │  • generateTwitterCardMetadata()
      │  • generateProductSchema() / generatePersonSchema()
      │
      ▼
   6. Cache generated metadata with tags
      │
      ▼
   7. Return metadata to Next.js
      │
      ▼
8. Next.js renders HTML with meta tags
   │
   ▼
9. Search engines/social platforms consume metadata
```

### Caching Strategy

**Cache Keys Pattern:**

```
seo:metadata:{contentType}:{contentId}

Examples:
- seo:metadata:bobblehead:bobblehead_123
- seo:metadata:collection:collection_456
- seo:metadata:user:user_789
```

**Cache Tags Pattern:**

```
Tags: ['seo', 'metadata', {contentType}, '{contentType}:{contentId}']

Examples:
- ['seo', 'metadata', 'bobblehead', 'bobblehead:bobblehead_123']
- ['seo', 'metadata', 'collection', 'collection:collection_456']
```

**TTL Values:**

- **Metadata Cache**: 3600 seconds (1 hour) - `CACHE_CONFIG.TTL.LONG`
- **Extended Cache**: 7200 seconds (2 hours) - `CACHE_CONFIG.TTL.EXTENDED` (for featured content)
- **Short Cache**: 300 seconds (5 minutes) - `CACHE_CONFIG.TTL.SHORT` (for rapidly changing data)

### Invalidation Triggers

Cache invalidation automatically occurs when:

1. **Bobblehead Updated** → Invalidates `seo:metadata:bobblehead:{id}`
2. **Collection Updated** → Invalidates `seo:metadata:collection:{id}`
3. **User Profile Updated** → Invalidates `seo:metadata:user:{id}`
4. **Content Deleted** → Invalidates all related metadata caches
5. **Photos Reordered** → Invalidates parent content metadata

**Implementation Example:**

```typescript
// In bobbleheads.actions.ts
import { invalidateMetadataCache } from '@/lib/seo/cache.utils';

// After updating bobblehead
invalidateMetadataCache('bobblehead', bobbleheadId);
```

### ISR Configuration

**Static Pages** (no database queries):

- `/about`, `/terms`, `/privacy`
- **Revalidation**: On-demand only
- **Cache**: Served from CDN until manual revalidation

**Dynamic Pages** (with database queries):

- `/bobbleheads/[slug]`, `/collections/[slug]`, `/users/[username]`
- **Revalidation**: 60 seconds (next.config.ts)
- **Cache**: ISR with stale-while-revalidate

**Sitemap**:

- Generated on-demand with database queries
- **Cache**: 60 seconds
- **Fallback**: Static routes only if DB query fails

### Preview Mode Workflow

```
1. Editor generates preview URL
   │
   ▼
2. GET /api/preview?token=SECRET&slug=/path
   │
   ├─ Token Invalid → 401 Unauthorized
   │
   └─ Token Valid:
      │
      ▼
   3. Enable draftMode() via Next.js API
      │  (Sets secure httpOnly cookie)
      │
      ▼
   4. Redirect to content at /path
      │
      ▼
   5. Page checks isPreviewMode()
      │
      ├─ true → Show draft content with metadata
      │
      └─ false → Show published content only
      │
      ▼
6. Editor reviews content and metadata
   │
   ▼
7. DELETE /api/preview to exit preview mode
```

---

## Components Reference

### Core Utilities

#### metadata.utils.ts

**Primary Functions:**

1. **generatePageMetadata(pageType, content, options)**
   - Orchestrates metadata generation for any page type
   - Combines OG, Twitter, robots, verification tags
   - Enforces character limits and provides defaults
   - Returns Next.js-compatible `Metadata` object

2. **generateTitle(pageTitle)**
   - Appends site name to page title
   - Prevents duplicate site names
   - Example: `"My Collection"` → `"My Collection | Head Shakers"`

3. **generateRobotsMetadata(isIndexable, isPublic)**
   - Determines appropriate robots directives
   - Private pages → `['noindex', 'nofollow']`
   - Public indexable → `['index', 'follow']`
   - Public non-indexable → `['noindex', 'follow']`

4. **generateVerificationMetaTags()**
   - Reads verification codes from environment variables
   - Returns tags for Google, Bing, Yandex Search Console

5. **serializeJsonLd(schema)**
   - Converts JSON-LD schema to string for script tag
   - Used in page components to render structured data

#### opengraph.utils.ts

**Primary Functions:**

1. **generateOpenGraphMetadata(options)**
   - Creates OG metadata for Facebook, LinkedIn, etc.
   - Enforces character limits (title: 60, description: 155)
   - Optimizes images (1200x630px recommended)
   - Returns object compatible with Next.js Metadata API

2. **generateTwitterCardMetadata(options)**
   - Creates Twitter Card metadata for Twitter/X
   - Enforces character limits (title: 70, description: 200)
   - Supports different card types (summary, summary_large_image)
   - Returns object compatible with Next.js Metadata API

**Character Limits:**

- OG Title: 60 characters (truncated with ellipsis)
- OG Description: 155 characters (truncated with ellipsis)
- Twitter Title: 70 characters (truncated with ellipsis)
- Twitter Description: 200 characters (truncated with ellipsis)

#### jsonld.utils.ts

**Primary Functions:**

1. **generateProductSchema(params)**
   - Creates Product schema for bobblehead pages
   - Includes name, description, images, brand, category
   - Compatible with Google's rich results

2. **generatePersonSchema(params)**
   - Creates Person schema for user profiles
   - Includes name, bio, avatar, social links
   - Supports knowledge graph integration

3. **generateCollectionPageSchema(params)**
   - Creates CollectionPage schema for collection listings
   - Includes name, description, URL, item count

4. **generateBreadcrumbSchema(items)**
   - Creates BreadcrumbList schema for navigation
   - Helps search engines understand site hierarchy

5. **generateOrganizationSchema()**
   - Creates Organization schema for site-wide data
   - Used on homepage and about page

**Usage Pattern:**

```typescript
// Generate schema
const productSchema = generateProductSchema({
  name: bobblehead.name,
  description: bobblehead.description,
  image: [bobblehead.imageUrl],
  category: bobblehead.category,
  brand: bobblehead.manufacturer,
});

// Render in page component
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: serializeJsonLd(productSchema) }}
/>
```

#### cache.utils.ts

**Primary Functions:**

1. **cacheMetadata(key, generator, ttl, tags)**
   - Caches metadata with automatic error handling
   - Falls back to direct generation on cache failures
   - Tracks hit/miss statistics for monitoring

2. **invalidateMetadataCache(contentType, contentId)**
   - Invalidates cached metadata by tag
   - Called automatically in server actions after mutations
   - Supports: 'bobblehead', 'collection', 'subcollection', 'user'

3. **warmMetadataCache(contentType, contentIds, metadataGenerator)**
   - Pre-populates cache for featured/trending content
   - Processes items in parallel
   - Useful after deployments or cache clears

4. **batchCacheMetadata(contentType, items, metadataGenerator, ttl)**
   - Caches metadata for multiple items efficiently
   - Processes in parallel for performance

5. **getMetadataCacheStats()**
   - Returns cache hit rate and operation counts
   - Useful for monitoring and optimization

**Key Generators:**

- `getBobbleheadMetadataKey(id)` → `seo:metadata:bobblehead:{id}`
- `getCollectionMetadataKey(id)` → `seo:metadata:collection:{id}`
- `getSubcollectionMetadataKey(id)` → `seo:metadata:subcollection:{id}`
- `getUserMetadataKey(id)` → `seo:metadata:user:{id}`

#### preview.utils.ts

**Primary Functions:**

1. **isPreviewMode()**
   - Checks if current request is in preview mode
   - Uses Next.js draftMode() API
   - Returns boolean promise

2. **validatePreviewToken(token)**
   - Validates token using timing-safe comparison
   - Prevents timing attacks
   - Compares against PREVIEW_SECRET env var

3. **buildPreviewUrl(contentPath, token?, baseUrl?)**
   - Constructs preview URL with authentication
   - Example: `/api/preview?token=SECRET&slug=/bobbleheads/draft`

4. **buildPreviewExitUrl(redirectPath?, baseUrl?)**
   - Constructs URL to disable preview mode
   - Example: `/api/preview` (DELETE method)

#### seo.constants.ts

**Exported Constants:**

1. **DEFAULT_SITE_METADATA**
   - `siteName`: "Head Shakers"
   - `title`: "Head Shakers - Bobblehead Collection Platform"
   - `description`: Default site description
   - `url`: From NEXT_PUBLIC_SITE_URL or default
   - `locale`: "en_US"
   - `twitterHandle`: "@headshakers"

2. **CHARACTER_LIMITS**
   - `pageTitle`: 60 characters
   - `pageDescription`: 155 characters
   - `ogTitle`: 60 characters
   - `ogDescription`: 155 characters
   - `twitterTitle`: 70 characters
   - `twitterDescription`: 200 characters

3. **IMAGE_DIMENSIONS**
   - `openGraph`: 1200x630px (1.91:1 aspect ratio)
   - `twitter`: 800x418px (1.91:1 aspect ratio)
   - `twitterSummary`: 400x400px (1:1 aspect ratio)

4. **ROBOTS_CONFIG**
   - `default`: `['index', 'follow']`
   - `noIndex`: `['noindex', 'follow']`
   - `noFollow`: `['index', 'nofollow']`
   - `none`: `['noindex', 'nofollow']`

5. **FALLBACK_METADATA**
   - Default values when content-specific metadata unavailable
   - Includes fallback image, description, keywords

### Configuration

#### config.ts

Environment variables used for SEO configuration (from `src/lib/config/config.ts`):

- **NEXT_PUBLIC_SITE_URL** - Base URL for canonical links and sitemaps
- **PREVIEW_SECRET** - Secret token for preview mode authentication
- **NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION** - Google Search Console verification
- **NEXT_PUBLIC_BING_SITE_VERIFICATION** - Bing Webmaster Tools verification
- **NEXT_PUBLIC_YANDEX_SITE_VERIFICATION** - Yandex Webmaster verification

### API Endpoints

#### /api/preview

**GET /api/preview?token={SECRET}&slug={PATH}**

- Enables preview mode with token validation
- Sets secure httpOnly cookie via draftMode()
- Redirects to content at `slug` path
- Returns 401 if token invalid

**DELETE /api/preview**

- Disables preview mode
- Clears preview cookie
- Optional redirect via `?redirect=/path` query param

**Security Features:**

- Timing-safe token comparison prevents timing attacks
- httpOnly cookies prevent XSS attacks
- Requires HTTPS in production

#### sitemap.ts

**GET /sitemap.xml**

- Generates XML sitemap dynamically
- Includes:
  - Static pages (homepage, about, terms, privacy, featured, trending)
  - User profiles (all users)
  - Bobblehead pages (public bobbleheads)
  - Collection pages (public collections)
- Excludes:
  - Authenticated routes (dashboard, settings, admin)
  - Edit/create routes
  - Private content
- Falls back to static routes only if database queries fail
- Sentry monitoring for performance tracking

**Change Frequencies:**

- Homepage: daily (priority 1.0)
- Featured/Trending: daily (priority 0.8)
- User profiles: weekly (priority 0.6)
- Bobbleheads: weekly (priority 0.6)
- Collections: weekly (priority 0.6)
- Static pages: monthly (priority 0.4)

#### robots.ts

**GET /robots.txt**

- Static configuration (no database queries)
- Allows all public routes
- Blocks:
  - Authenticated routes (/dashboard/_, /settings/_, /admin/\*)
  - Edit routes (_/edit/_)
  - Create routes (_/create/_)
  - Internal APIs (/api/webhooks/_, /api/internal/_)
  - Auth routes (/sign-in, /sign-up, /sign-out)
- Includes sitemap URL
- Sets crawl-delay: 1 second

---

## Content Type Examples

### User Profile Metadata

**File:** `src/app/(app)/users/[userId]/page.tsx`

```typescript
import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo/metadata.utils';
import { generatePersonSchema } from '@/lib/seo/jsonld.utils';
import { serializeJsonLd } from '@/lib/seo/metadata.utils';
import { DEFAULT_SITE_METADATA } from '@/lib/seo/seo.constants';

export async function generateMetadata({ params }): Promise<Metadata> {
  const { userId } = await params;

  // Fetch user data
  const user = await UsersFacade.getUserProfile(userId);

  if (!user) {
    return {
      title: 'User Not Found | Head Shakers',
      description: 'User not found',
      robots: 'noindex, nofollow',
    };
  }

  // Generate canonical URL
  const canonicalUrl = `${DEFAULT_SITE_METADATA.url}/users/${user.username}`;

  // Prepare profile image
  const profileImage = user.avatarUrl || FALLBACK_METADATA.imageUrl;

  // Generate metadata
  return generatePageMetadata(
    'profile',
    {
      title: user.displayName,
      description: user.bio || `${user.displayName}'s bobblehead collection on Head Shakers`,
      images: [profileImage],
      url: canonicalUrl,
      userId: user.id,
    },
    {
      isPublic: user.isPublicProfile,
      shouldIncludeOpenGraph: true,
      shouldIncludeTwitterCard: true,
      shouldUseTitleTemplate: true,
    }
  );
}

export default async function UserProfilePage({ params }) {
  const { userId } = await params;
  const user = await UsersFacade.getUserProfile(userId);

  // Generate Person schema
  const personSchema = generatePersonSchema({
    userId: user.id,
    name: user.displayName,
    description: user.bio,
    image: user.avatarUrl,
    url: `${DEFAULT_SITE_METADATA.url}/users/${user.username}`,
    sameAs: [], // Add social links if available
  });

  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(personSchema) }}
      />

      {/* Page content */}
      <div>
        <h1>{user.displayName}</h1>
        {/* ... rest of page */}
      </div>
    </>
  );
}
```

**Generated Meta Tags:**

```html
<title>John Collector | Head Shakers</title>
<meta name="description" content="Bobblehead enthusiast since 2010" />
<link rel="canonical" href="https://headshakers.com/users/johncollector" />

<!-- Open Graph -->
<meta property="og:title" content="John Collector" />
<meta property="og:description" content="Bobblehead enthusiast since 2010" />
<meta property="og:image" content="https://res.cloudinary.com/.../avatar.jpg" />
<meta property="og:url" content="https://headshakers.com/users/johncollector" />
<meta property="og:type" content="profile" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="John Collector" />
<meta name="twitter:description" content="Bobblehead enthusiast since 2010" />
<meta name="twitter:image" content="https://res.cloudinary.com/.../avatar.jpg" />

<!-- JSON-LD -->
<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "John Collector",
    "description": "Bobblehead enthusiast since 2010",
    "image": "https://res.cloudinary.com/.../avatar.jpg",
    "url": "https://headshakers.com/users/johncollector"
  }
</script>
```

### Bobblehead Product Metadata

**File:** `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/page.tsx`

```typescript
export async function generateMetadata({ routeParams }): Promise<Metadata> {
  const { bobbleheadSlug } = await routeParams;

  // Fetch bobblehead SEO metadata
  const bobblehead = await BobbleheadsFacade.getBobbleheadSeoMetadata(bobbleheadSlug);

  if (!bobblehead) {
    return {
      title: 'Bobblehead Not Found | Head Shakers',
      description: 'Bobblehead not found',
      robots: 'noindex, nofollow',
    };
  }

  // Generate canonical URL
  const canonicalUrl = `${DEFAULT_SITE_METADATA.url}/bobbleheads/${bobbleheadSlug}`;

  // Optimize primary image for OG
  let productImage = FALLBACK_METADATA.imageUrl;
  if (bobblehead.primaryImage) {
    const publicId = extractPublicIdFromCloudinaryUrl(bobblehead.primaryImage);
    productImage = generateOpenGraphImageUrl(publicId);
  }

  // Generate description with owner attribution
  const description = bobblehead.description ||
    `${bobblehead.name} - From ${bobblehead.owner.displayName}'s collection on Head Shakers`;

  // Generate metadata
  return generatePageMetadata(
    'bobblehead',
    {
      title: bobblehead.name,
      description,
      images: [productImage],
      category: bobblehead.category || undefined,
      brand: bobblehead.manufacturer || undefined,
      url: canonicalUrl,
    },
    {
      isPublic: true,
      shouldIncludeOpenGraph: true,
      shouldIncludeTwitterCard: true,
      shouldUseTitleTemplate: true,
    }
  );
}

export default async function BobbleheadPage({ routeParams }) {
  const { bobbleheadSlug } = await routeParams;
  const bobblehead = await BobbleheadsFacade.getBobbleheadBySlug(bobbleheadSlug);

  // Generate Product schema
  const productSchema = generateProductSchema({
    name: bobblehead.name,
    description: bobblehead.description,
    image: bobblehead.primaryImage ? [bobblehead.primaryImage] : undefined,
    category: bobblehead.category,
    brand: bobblehead.manufacturer,
    dateCreated: bobblehead.createdAt.toISOString(),
  });

  // Generate Breadcrumb schema
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: DEFAULT_SITE_METADATA.url },
    { name: 'Bobbleheads', url: `${DEFAULT_SITE_METADATA.url}/bobbleheads` },
    { name: bobblehead.name }, // Current page - no URL
  ]);

  return (
    <>
      {/* Product schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(productSchema) }}
      />

      {/* Breadcrumb schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbSchema) }}
      />

      {/* Page content */}
      <div>
        <h1>{bobblehead.name}</h1>
        {/* ... rest of page */}
      </div>
    </>
  );
}
```

**Generated OG Type:** `product` (optimized for commerce platforms)

### Collection Page Metadata

**File:** `src/app/(app)/collections/[collectionSlug]/(collection)/page.tsx`

```typescript
export async function generateMetadata({ routeParams }): Promise<Metadata> {
  const { collectionSlug } = await routeParams;

  const collection = await CollectionsFacade.getCollectionSeoMetadata(collectionSlug);

  if (!collection) {
    return {
      title: 'Collection Not Found | Head Shakers',
      description: 'Collection not found',
      robots: 'noindex, nofollow',
    };
  }

  const canonicalUrl = `${DEFAULT_SITE_METADATA.url}/collections/${collectionSlug}`;

  // Use collection cover image or fallback
  const coverImage = collection.coverImageUrl || FALLBACK_METADATA.imageUrl;

  const description =
    collection.description ||
    `${collection.name} by ${collection.owner.displayName} - ${collection.itemCount} bobbleheads`;

  return generatePageMetadata(
    'collection',
    {
      title: collection.name,
      description,
      images: [coverImage],
      url: canonicalUrl,
    },
    {
      isPublic: collection.isPublic,
      shouldIncludeOpenGraph: true,
      shouldIncludeTwitterCard: true,
      shouldUseTitleTemplate: true,
    },
  );
}
```

**Generated OG Type:** `website` (collections are content aggregations)

### Public Landing Page Metadata

**File:** `src/app/(public)/about/page.tsx`

```typescript
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | Head Shakers',
  description: 'Learn about Head Shakers, the premier platform for bobblehead collectors worldwide. Connect, catalog, and share your collection.',
  openGraph: {
    title: 'About Head Shakers',
    description: 'The premier platform for bobblehead collectors worldwide',
    url: 'https://headshakers.com/about',
    type: 'website',
    images: [
      {
        url: 'https://headshakers.com/images/og-about.jpg',
        width: 1200,
        height: 630,
        alt: 'Head Shakers - About Us',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Head Shakers',
    description: 'The premier platform for bobblehead collectors worldwide',
    images: ['https://headshakers.com/images/og-about.jpg'],
  },
  robots: 'index, follow',
};

export default function AboutPage() {
  return (
    <div>
      <h1>About Head Shakers</h1>
      {/* ... content */}
    </div>
  );
}
```

**Note:** Static pages can use inline metadata object instead of generateMetadata() function.

### Authenticated Route Metadata

**File:** `src/app/(app)/dashboard/page.tsx`

```typescript
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | Head Shakers',
  description: 'Manage your bobblehead collection',
  robots: 'noindex, nofollow', // Private page - don't index
};

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      {/* ... authenticated content */}
    </div>
  );
}
```

**Key Differences:**

- No Open Graph or Twitter metadata (no social sharing for private pages)
- `robots: 'noindex, nofollow'` prevents indexing
- Not included in sitemap.xml
- Blocked in robots.txt

---

## Configuration Guide

### Required Environment Variables

Add these to `.env.local` (development) and deployment environment (production):

```bash
# Site Configuration
NEXT_PUBLIC_SITE_URL=https://headshakers.com

# Preview Mode
PREVIEW_SECRET=your-secret-token-here-use-crypto-random-string

# Optional: Search Console Verification
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your-google-verification-code
NEXT_PUBLIC_BING_SITE_VERIFICATION=your-bing-verification-code
NEXT_PUBLIC_YANDEX_SITE_VERIFICATION=your-yandex-verification-code
```

#### Environment Variable Details

| Variable                               | Required | Purpose                                        | Example                                  |
| -------------------------------------- | -------- | ---------------------------------------------- | ---------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                 | **Yes**  | Base URL for canonical links, sitemap, OG tags | `https://headshakers.com`                |
| `PREVIEW_SECRET`                       | **Yes**  | Secret token for preview mode authentication   | `crypto.randomBytes(32).toString('hex')` |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | No       | Google Search Console verification meta tag    | `abc123...xyz789`                        |
| `NEXT_PUBLIC_BING_SITE_VERIFICATION`   | No       | Bing Webmaster Tools verification meta tag     | `def456...uvw012`                        |
| `NEXT_PUBLIC_YANDEX_SITE_VERIFICATION` | No       | Yandex Webmaster verification meta tag         | `ghi789...rst345`                        |

**Generating PREVIEW_SECRET:**

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32
```

### Optional Environment Variables

These are already configured with sensible defaults in `seo.constants.ts`, but can be overridden if needed:

```bash
# Optional Overrides (not recommended - modify constants instead)
NEXT_PUBLIC_TWITTER_HANDLE=@headshakers
```

### next.config.ts Settings

The following Next.js configuration is required for ISR and metadata:

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable React strict mode
  reactStrictMode: true,

  // ISR configuration
  experimental: {
    // Enable ISR
    isrMemoryCacheSize: 0, // Disable in-memory cache (use Redis)
  },

  // Image optimization for Cloudinary
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },

  // Metadata configuration
  async headers() {
    return [
      {
        source: '/sitemap.xml',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, s-maxage=60, stale-while-revalidate=60',
          },
        ],
      },
      {
        source: '/robots.txt',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=3600',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

### ISR Revalidation Intervals

Configure revalidation intervals based on content update frequency:

| Content Type                | Revalidation Interval | Rationale                          |
| --------------------------- | --------------------- | ---------------------------------- |
| Static pages (about, terms) | On-demand only        | Rarely changes                     |
| Homepage                    | 60 seconds            | Featured content rotates           |
| Bobblehead pages            | 60 seconds            | Metadata may change (likes, views) |
| User profiles               | 60 seconds            | Bio, stats may update              |
| Collection pages            | 60 seconds            | Items may be added/removed         |
| Sitemap                     | 60 seconds            | New content added regularly        |

**Setting Revalidation:**

```typescript
// In page.tsx
export const revalidate = 60; // Revalidate every 60 seconds
```

---

## Adding Metadata to New Pages

### Step-by-Step Guide for Static Pages

**Static pages** are pages that don't query the database for dynamic content (e.g., about, terms, privacy).

**Step 1:** Define metadata object

```typescript
// src/app/(public)/new-page/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Title | Head Shakers',
  description: 'Page description (max 155 characters for optimal display)',
  openGraph: {
    title: 'Page Title',
    description: 'Page description',
    url: 'https://headshakers.com/new-page',
    type: 'website',
    images: [
      {
        url: 'https://headshakers.com/images/og-new-page.jpg',
        width: 1200,
        height: 630,
        alt: 'Page Title - Head Shakers',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Page Title',
    description: 'Page description',
    images: ['https://headshakers.com/images/og-new-page.jpg'],
  },
  robots: 'index, follow',
};

export default function NewPage() {
  return <div>{/* Page content */}</div>;
}
```

**Step 2:** Add to sitemap (if public)

```typescript
// src/app/sitemap.ts
const staticRoutes: MetadataRoute.Sitemap = [
  // ... existing routes
  {
    url: `${baseUrl}/new-page`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.4,
  },
];
```

**Step 3:** Verify robots.txt (if authenticated)

```typescript
// src/app/robots.ts
// If page requires authentication, add to disallow list:
disallow: [
  // ... existing routes
  '/new-page',
  '/new-page/*',
],
```

### Step-by-Step Guide for Dynamic Pages

**Dynamic pages** query the database for content (e.g., bobbleheads, collections, users).

**Step 1:** Create metadata generator function

```typescript
// src/app/(app)/items/[itemId]/page.tsx
import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo/metadata.utils';
import { DEFAULT_SITE_METADATA } from '@/lib/seo/seo.constants';
import { ItemsFacade } from '@/lib/facades/items/items.facade';

export async function generateMetadata({ params }): Promise<Metadata> {
  const { itemId } = await params;

  // Fetch data for metadata
  const item = await ItemsFacade.getItemSeoMetadata(itemId);

  // Handle not found
  if (!item) {
    return {
      title: 'Item Not Found | Head Shakers',
      description: 'Item not found',
      robots: 'noindex, nofollow',
    };
  }

  // Generate canonical URL
  const canonicalUrl = `${DEFAULT_SITE_METADATA.url}/items/${itemId}`;

  // Generate metadata using utility
  return generatePageMetadata(
    'bobblehead', // or appropriate page type
    {
      title: item.name,
      description: item.description || `${item.name} on Head Shakers`,
      images: [item.imageUrl],
      url: canonicalUrl,
    },
    {
      isPublic: item.isPublic,
      shouldIncludeOpenGraph: true,
      shouldIncludeTwitterCard: true,
      shouldUseTitleTemplate: true,
    },
  );
}

export default async function ItemPage({ params }) {
  // Page implementation
}
```

**Step 2:** Implement caching in facade

```typescript
// src/lib/facades/items/items.facade.ts
import { cacheMetadata, getItemMetadataKey } from '@/lib/seo/cache.utils';
import { CacheTagGenerators } from '@/lib/utils/cache-tags.utils';

export async function getItemSeoMetadata(itemId: string) {
  const cacheKey = getItemMetadataKey(itemId);
  const tags = CacheTagGenerators.item.read(itemId);

  return cacheMetadata(
    cacheKey,
    async () => {
      // Fetch from database
      const item = await db.query.items.findFirst({
        where: eq(items.id, itemId),
        // ... columns needed for metadata
      });
      return item;
    },
    CACHE_CONFIG.TTL.LONG,
    tags,
  );
}
```

**Step 3:** Add cache invalidation to actions

```typescript
// src/lib/actions/items/items.actions.ts
import { invalidateMetadataCache } from '@/lib/seo/cache.utils';

export async function updateItem(data: UpdateItemData) {
  // ... update logic

  // Invalidate metadata cache after update
  invalidateMetadataCache('item', data.itemId);

  return { success: true };
}
```

**Step 4:** Add to sitemap (if public)

```typescript
// src/app/sitemap.ts
// Query all public items
const publicItems = await db
  .select({
    id: items.id,
    updatedAt: items.updatedAt,
  })
  .from(items)
  .where(eq(items.isPublic, true))
  .orderBy(items.createdAt);

// Generate routes
const itemRoutes: MetadataRoute.Sitemap = publicItems.map((item) => ({
  url: `${baseUrl}/items/${item.id}`,
  lastModified: item.updatedAt,
  changeFrequency: 'weekly',
  priority: 0.6,
}));
```

**Step 5:** Add JSON-LD schemas (optional but recommended)

```typescript
// In page component
import { generateProductSchema } from '@/lib/seo/jsonld.utils';
import { serializeJsonLd } from '@/lib/seo/metadata.utils';

export default async function ItemPage({ params }) {
  const item = await ItemsFacade.getItem(params.itemId);

  const productSchema = generateProductSchema({
    name: item.name,
    description: item.description,
    image: [item.imageUrl],
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(productSchema) }}
      />
      <div>{/* Page content */}</div>
    </>
  );
}
```

### Common Patterns and Best Practices

**Pattern 1: Fallback Descriptions**

```typescript
const description = item.description || `${item.name} by ${item.owner.displayName} on Head Shakers`;
```

**Pattern 2: Image Optimization**

```typescript
import { extractPublicIdFromCloudinaryUrl, generateOpenGraphImageUrl } from '@/lib/utils/cloudinary.utils';

let ogImage = FALLBACK_METADATA.imageUrl;
if (item.imageUrl) {
  const publicId = extractPublicIdFromCloudinaryUrl(item.imageUrl);
  ogImage = generateOpenGraphImageUrl(publicId); // Optimized for OG
}
```

**Pattern 3: Conditional Metadata**

```typescript
return generatePageMetadata(
  'bobblehead',
  {
    title: item.name,
    description: item.description,
    images: [item.imageUrl],
    url: canonicalUrl,
    // Only include category if available
    category: item.category || undefined,
    // Only include brand if available
    brand: item.brand || undefined,
  },
  {
    // Private items should not be indexed
    isPublic: item.isPublic,
    isIndexable: item.isPublic,
  },
);
```

**Pattern 4: Type-Safe URLs**

```typescript
import { $path } from 'next-typesafe-url';

const canonicalUrl = `${DEFAULT_SITE_METADATA.url}${$path({
  route: '/items/[itemId]',
  routeParams: { itemId },
})}`;
```

---

## Cache Management

### How Caching Works

The SEO system uses a multi-layered caching approach:

```
1. Metadata Generation Cache (Redis)
   │
   ├─ Layer 1: In-memory cache (CacheService)
   │  • Fast lookups for repeated requests
   │  • Cleared on application restart
   │
   └─ Layer 2: Redis cache (Upstash)
      • Persistent across restarts
      • Shared across instances
      • Tag-based invalidation

2. Next.js ISR Cache (File System)
   │
   ├─ Static pages: Cached until revalidation
   └─ Dynamic pages: Cached with revalidate interval

3. CDN Cache (Vercel Edge)
   │
   ├─ Sitemap: 60s cache
   ├─ Robots.txt: 3600s cache
   └─ Pages: Based on Cache-Control headers
```

### Cache Invalidation Triggers

**Automatic Invalidation (via server actions):**

```typescript
// src/lib/actions/bobbleheads/bobbleheads.actions.ts
import { invalidateMetadataCache } from '@/lib/seo/cache.utils';

// After creating bobblehead
invalidateMetadataCache('bobblehead', newBobblehead.id);

// After updating bobblehead
invalidateMetadataCache('bobblehead', bobbleheadId);

// After deleting bobblehead
invalidateMetadataCache('bobblehead', bobbleheadId);

// After updating photos (affects metadata if primary image changes)
invalidateMetadataCache('bobblehead', bobbleheadId);
```

**Manual Invalidation:**

```typescript
import { CacheService } from '@/lib/services/cache.service';
import { CACHE_CONFIG } from '@/lib/constants/cache';

// Invalidate specific content
CacheService.invalidateByTag(CACHE_CONFIG.TAGS.BOBBLEHEAD(bobbleheadId));

// Invalidate all bobblehead metadata
CacheService.invalidateByTag('bobblehead');

// Invalidate all SEO metadata
CacheService.invalidateByTag('seo');
```

### Cache Warming Strategy

**When to Warm Cache:**

1. After deployments (fresh cache)
2. After bulk data imports
3. Before high-traffic events
4. For featured/trending content

**Implementation:**

```typescript
import { warmMetadataCache } from '@/lib/seo/cache.utils';
import { BobbleheadsFacade } from '@/lib/facades/bobbleheads/bobbleheads.facade';

// Warm cache for featured bobbleheads
async function warmFeaturedContent() {
  // Get IDs of featured bobbleheads
  const featuredIds = await getFeaturedBobbleheadIds();

  // Warm metadata cache
  await warmMetadataCache('bobblehead', featuredIds, async (id) =>
    BobbleheadsFacade.getBobbleheadSeoMetadata(id),
  );

  console.log(`Warmed cache for ${featuredIds.length} featured bobbleheads`);
}

// Run on deployment or via cron job
warmFeaturedContent();
```

**Batch Warming:**

```typescript
import { batchCacheMetadata } from '@/lib/seo/cache.utils';

// Warm cache for multiple items
async function warmCollectionMetadata(collectionIds: string[]) {
  const collections = collectionIds.map((id) => ({ id }));

  await batchCacheMetadata(
    'collection',
    collections,
    async (item) => CollectionsFacade.getCollectionSeoMetadata(item.id),
    CACHE_CONFIG.TTL.EXTENDED, // 2 hours for featured content
  );
}
```

### Monitoring Cache Performance

**Get Cache Statistics:**

```typescript
import { getMetadataCacheStats } from '@/lib/seo/cache.utils';

// Get current stats
const stats = getMetadataCacheStats();

console.log(`Cache Hit Rate: ${stats.hitRate.toFixed(2)}%`);
console.log(`Total Operations: ${stats.totalOperations}`);
console.log(`Hits: ${stats.hits}`);
console.log(`Misses: ${stats.misses}`);
console.log(`Errors: ${stats.errors}`);
```

**Expected Hit Rates:**

- **Development**: 40-60% (frequent restarts)
- **Production**: 80-95% (stable cache)
- **After Deployment**: 0-20% (cache warming phase)

**Monitoring with Sentry:**

All metadata generation operations are automatically tracked in Sentry:

- Operation duration
- Cache hit/miss rates
- Error rates
- Content type distribution

### TTL Values and Rationale

| Cache Type          | TTL        | Rationale                          |
| ------------------- | ---------- | ---------------------------------- |
| Metadata (standard) | 3600s (1h) | Balances freshness and performance |
| Featured content    | 7200s (2h) | Changes infrequently, high traffic |
| User stats          | 300s (5m)  | Updates frequently (likes, views)  |
| Static content      | Indefinite | Revalidated on-demand only         |

**Adjusting TTL:**

```typescript
import { CACHE_CONFIG } from '@/lib/constants/cache';
import { cacheMetadata } from '@/lib/seo/cache.utils';

// Use shorter TTL for frequently changing content
await cacheMetadata(
  key,
  generator,
  CACHE_CONFIG.TTL.SHORT, // 5 minutes
  tags,
);

// Use longer TTL for stable content
await cacheMetadata(
  key,
  generator,
  CACHE_CONFIG.TTL.EXTENDED, // 2 hours
  tags,
);
```

---

## Testing

### Running Tests

**Unit Tests:**

```bash
# Run all SEO tests
npm test -- src/lib/seo

# Run specific test file
npm test -- src/lib/seo/metadata.utils.test.ts

# Run with coverage
npm test -- --coverage src/lib/seo
```

**Integration Tests:**

```bash
# Test metadata generation end-to-end
npm test -- tests/integration/seo

# Test sitemap generation
npm test -- tests/integration/seo/sitemap.test.ts
```

### Testing Metadata Generation

**Example Test:**

```typescript
// tests/unit/seo/metadata.utils.test.ts
import { describe, it, expect } from 'vitest';
import { generatePageMetadata } from '@/lib/seo/metadata.utils';

describe('generatePageMetadata', () => {
  it('should generate complete metadata for bobblehead page', () => {
    const metadata = generatePageMetadata(
      'bobblehead',
      {
        title: 'Test Bobblehead',
        description: 'Test description',
        images: ['https://example.com/image.jpg'],
        url: 'https://headshakers.com/bobbleheads/test',
      },
      {
        isPublic: true,
        shouldIncludeOpenGraph: true,
        shouldIncludeTwitterCard: true,
      },
    );

    expect(metadata.title).toBe('Test Bobblehead | Head Shakers');
    expect(metadata.description).toBe('Test description');
    expect(metadata.openGraph).toBeDefined();
    expect(metadata.openGraph?.type).toBe('product');
    expect(metadata.twitter).toBeDefined();
    expect(metadata.robots).toBe('index, follow');
  });

  it('should not index private content', () => {
    const metadata = generatePageMetadata(
      'bobblehead',
      {
        title: 'Private Bobblehead',
        description: 'Private',
        url: 'https://headshakers.com/bobbleheads/private',
      },
      {
        isPublic: false,
      },
    );

    expect(metadata.robots).toBe('noindex, nofollow');
  });
});
```

### Validating with External Tools

**Facebook Sharing Debugger:**

1. Visit: https://developers.facebook.com/tools/debug/
2. Enter URL: `https://headshakers.com/bobbleheads/test-slug`
3. Click "Scrape Again" to refresh cache
4. Verify:
   - Title displays correctly
   - Description appears
   - Image loads (1200x630px)
   - OG type is correct

**Twitter Card Validator:**

1. Visit: https://cards-dev.twitter.com/validator
2. Enter URL: `https://headshakers.com/bobbleheads/test-slug`
3. Click "Preview Card"
4. Verify:
   - Card type: summary_large_image
   - Title truncation (70 chars)
   - Description truncation (200 chars)
   - Image loads

**Google Rich Results Test:**

1. Visit: https://search.google.com/test/rich-results
2. Enter URL or paste HTML
3. Verify:
   - Product schema valid (for bobbleheads)
   - Person schema valid (for profiles)
   - Breadcrumb schema valid
   - No errors or warnings

**LinkedIn Post Inspector:**

1. Visit: https://www.linkedin.com/post-inspector/
2. Enter URL
3. Verify Open Graph tags display correctly

### Preview Mode Testing

**Test Preview Enablement:**

```bash
# Generate preview URL (replace SECRET with actual PREVIEW_SECRET)
curl "http://localhost:3000/api/preview?token=SECRET&slug=/bobbleheads/draft-item"

# Should redirect to /bobbleheads/draft-item with preview enabled
```

**Test Preview Disablement:**

```bash
# Disable preview mode
curl -X DELETE "http://localhost:3000/api/preview"

# Should return: { "previewMode": false, "message": "Preview mode disabled" }
```

**Test Invalid Token:**

```bash
# Try with invalid token
curl "http://localhost:3000/api/preview?token=invalid&slug=/bobbleheads/test"

# Should return 401: { "error": "Invalid or missing preview token" }
```

### Manual Testing Checklist

**Before Deploying SEO Changes:**

- [ ] Verify sitemap generates without errors (`/sitemap.xml`)
- [ ] Check robots.txt configuration (`/robots.txt`)
- [ ] Test metadata on at least 3 different page types
- [ ] Validate with Facebook Sharing Debugger
- [ ] Validate with Twitter Card Validator
- [ ] Test Google Rich Results for JSON-LD schemas
- [ ] Verify canonical URLs are correct
- [ ] Check that private pages have `noindex, nofollow`
- [ ] Test preview mode enable/disable flow
- [ ] Verify cache invalidation after content updates
- [ ] Check Sentry for metadata generation errors

---

## Troubleshooting Guide

### Common Issues and Solutions

#### Issue 1: Metadata Not Updating

**Symptoms:**

- Old metadata appears after content update
- Facebook/Twitter shows stale information
- Changes not visible in source HTML

**Possible Causes:**

1. Cache not invalidated
2. ISR not revalidating
3. CDN cache stale
4. Social platform cache

**Solutions:**

```typescript
// Step 1: Manually invalidate metadata cache
import { invalidateMetadataCache } from '@/lib/seo/cache.utils';
invalidateMetadataCache('bobblehead', bobbleheadId);

// Step 2: Trigger ISR revalidation
// Visit page with ?revalidate=1 query param (if configured)
// OR wait for revalidation interval (60s)

// Step 3: Clear CDN cache (Vercel)
// In Vercel dashboard: Deployments → ... → Redeploy

// Step 4: Clear social platform cache
// Facebook: Use Sharing Debugger "Scrape Again"
// Twitter: Wait 7 days or contact support
// LinkedIn: Use Post Inspector
```

**Prevention:**

```typescript
// Always invalidate cache in server actions
export async function updateBobblehead(data: UpdateBobbleheadData) {
  const result = await BobbleheadsFacade.updateBobblehead(data);

  // CRITICAL: Invalidate cache after update
  invalidateMetadataCache('bobblehead', data.bobbleheadId);

  return result;
}
```

#### Issue 2: Images Not Showing in Social Previews

**Symptoms:**

- Image URL is correct but doesn't display
- Social platforms show fallback/no image
- Image works in browser but not in preview

**Possible Causes:**

1. Image too large (>8MB for Facebook)
2. Incorrect dimensions
3. CORS issues
4. Image not publicly accessible
5. Cloudinary transformation errors

**Solutions:**

```typescript
// Step 1: Verify image is publicly accessible
// Visit image URL directly in browser

// Step 2: Check image dimensions
import { generateOpenGraphImageUrl } from '@/lib/utils/cloudinary.utils';

// Use Cloudinary transformations for optimal OG images
const publicId = extractPublicIdFromCloudinaryUrl(imageUrl);
const ogImage = generateOpenGraphImageUrl(publicId);
// Returns optimized 1200x630px image

// Step 3: Verify image in metadata
console.log('OG Image:', metadata.openGraph?.images);

// Step 4: Test with direct URL
const metadata = {
  openGraph: {
    images: [
      {
        url: 'https://res.cloudinary.com/your-cloud/image/upload/c_fill,w_1200,h_630/v1/bobbleheads/test.jpg',
        width: 1200,
        height: 630,
        type: 'image/jpeg',
        alt: 'Test Image',
      },
    ],
  },
};
```

**Debug Checklist:**

- [ ] Image URL returns 200 (not 404)
- [ ] Image is HTTPS (not HTTP)
- [ ] Image size < 8MB
- [ ] Image dimensions 1200x630px (or close)
- [ ] Content-Type header is correct (image/jpeg, image/png)
- [ ] No authentication required to access image
- [ ] CORS headers allow social platforms

#### Issue 3: Sitemap Not Generating

**Symptoms:**

- `/sitemap.xml` returns 404 or error
- Sitemap is empty
- Database query fails

**Possible Causes:**

1. Database connection failure
2. Query error
3. Invalid data
4. File permission issues

**Solutions:**

```typescript
// Step 1: Check Sentry for errors
// Look for 'seo.sitemap.generate' operations

// Step 2: Test database queries individually
const users = await db.select().from(users).limit(1);
const bobbleheads = await db.select().from(bobbleheads).limit(1);
const collections = await db.select().from(collections).limit(1);

// Step 3: Verify NEXT_PUBLIC_SITE_URL is set
console.log('Site URL:', process.env.NEXT_PUBLIC_SITE_URL);

// Step 4: Check fallback behavior
// Sitemap should return static routes even if DB queries fail
```

**Fallback Sitemap:**

```typescript
// src/app/sitemap.ts already includes fallback
try {
  // Generate dynamic routes
} catch (error) {
  console.error('Error generating sitemap:', error);
  // Return static routes only as fallback
  return staticRoutes;
}
```

#### Issue 4: Preview Mode Not Working

**Symptoms:**

- Preview URL returns 401
- Preview mode doesn't enable
- Draft content not visible

**Possible Causes:**

1. PREVIEW_SECRET not set or incorrect
2. Token mismatch
3. Cookie not set
4. draftMode() not checked in page

**Solutions:**

```bash
# Step 1: Verify PREVIEW_SECRET is set
echo $PREVIEW_SECRET

# Step 2: Generate correct preview URL
node -e "console.log('http://localhost:3000/api/preview?token=' + process.env.PREVIEW_SECRET + '&slug=/bobbleheads/test')"

# Step 3: Check browser console for errors
# Step 4: Verify cookie is set (Application → Cookies → __prerender_bypass)
```

**Debug in Page:**

```typescript
import { isPreviewMode } from '@/lib/seo/preview.utils';

export default async function Page() {
  const inPreview = await isPreviewMode();
  console.log('Preview mode:', inPreview);

  return <div>Preview: {inPreview ? 'ON' : 'OFF'}</div>;
}
```

#### Issue 5: Cache Issues

**Symptoms:**

- Cache hit rate very low
- High database load
- Slow metadata generation
- Cache errors in logs

**Possible Causes:**

1. Redis connection failure
2. Cache keys not consistent
3. Cache eviction due to memory limits
4. Tag-based invalidation too broad

**Solutions:**

```typescript
// Step 1: Check cache statistics
import { getMetadataCacheStats } from '@/lib/seo/cache.utils';
const stats = getMetadataCacheStats();
console.log('Cache hit rate:', stats.hitRate);

// Step 2: Verify Redis connection
// Check Upstash dashboard for connection errors

// Step 3: Monitor cache keys
import { getBobbleheadMetadataKey } from '@/lib/seo/cache.utils';
console.log('Cache key:', getBobbleheadMetadataKey('bobblehead_123'));

// Step 4: Check for over-invalidation
// Review server actions for unnecessary invalidateMetadataCache calls
```

**Expected Hit Rates:**

- Development: 40-60%
- Production (steady state): 80-95%
- Production (after deployment): 0-20% initially, rising to 80%+

#### Issue 6: Type Errors

**Symptoms:**

- TypeScript compilation errors
- Type mismatch in metadata objects
- Missing required properties

**Common Type Errors:**

```typescript
// ERROR: Type mismatch
const metadata: Metadata = {
  openGraph: {
    images: ['https://example.com/image.jpg'], // ❌ Wrong type
  },
};

// FIX: Use correct image object structure
const metadata: Metadata = {
  openGraph: {
    images: [
      {
        url: 'https://example.com/image.jpg', // ✅ Correct
        width: 1200,
        height: 630,
        alt: 'Image description',
      },
    ],
  },
};

// ERROR: Missing required fields in JSON-LD
const schema: ProductSchema = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  // ❌ Missing 'name' field
};

// FIX: Include all required fields
const schema: ProductSchema = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'Product Name', // ✅ Required field
};
```

### Debug Checklist

**When metadata isn't working:**

1. **Source HTML:**
   - [ ] View page source (Ctrl+U)
   - [ ] Search for `<meta property="og:` tags
   - [ ] Verify values are correct
   - [ ] Check for duplicate tags

2. **Network Tab:**
   - [ ] Check page response status (200 OK)
   - [ ] Verify response contains meta tags
   - [ ] Check for redirects affecting metadata

3. **Cache:**
   - [ ] Check cache stats for low hit rate
   - [ ] Manually invalidate if stale
   - [ ] Wait for ISR revalidation (60s)

4. **Database:**
   - [ ] Verify content exists
   - [ ] Check content is public (if applicable)
   - [ ] Ensure no query errors in logs

5. **Environment:**
   - [ ] Verify NEXT_PUBLIC_SITE_URL is set
   - [ ] Check PREVIEW_SECRET if using preview mode
   - [ ] Confirm Redis/Upstash is accessible

6. **External Validators:**
   - [ ] Test with Facebook Sharing Debugger
   - [ ] Test with Twitter Card Validator
   - [ ] Test with Google Rich Results
   - [ ] Check for schema validation errors

### Logging and Monitoring

**Sentry Integration:**

All metadata operations are automatically tracked in Sentry:

```typescript
// Automatic tracking via Sentry.startSpan()
Sentry.startSpan(
  {
    name: 'seo.metadata.generate',
    op: 'seo.metadata',
    attributes: {
      contentType: pageType,
      hasImages: !!(content.images && content.images.length > 0),
    },
  },
  () => {
    // Metadata generation
  },
);
```

**View in Sentry:**

1. Go to Performance → Transactions
2. Filter by: `op:seo.metadata`
3. Check:
   - Average duration (should be < 50ms with cache)
   - Error rate (should be < 1%)
   - Cache hit rate (in breadcrumbs)

**Custom Logging:**

```typescript
// Enable debug logging in development
if (process.env.NODE_ENV === 'development') {
  console.log('[SEO] Generating metadata:', {
    pageType,
    contentId,
    cacheHit: false,
    duration: '45ms',
  });
}
```

---

## Performance Optimization

### Metadata Generation Performance Targets

| Metric                           | Target   | Critical Threshold |
| -------------------------------- | -------- | ------------------ |
| **Cold Generation** (cache miss) | < 100ms  | > 500ms            |
| **Warm Generation** (cache hit)  | < 10ms   | > 50ms             |
| **Sitemap Generation**           | < 3000ms | > 10000ms          |
| **Cache Hit Rate**               | > 85%    | < 60%              |
| **Database Query Time**          | < 50ms   | > 200ms            |

### Caching Best Practices

**1. Use Appropriate TTL:**

```typescript
// Frequently changing content → Shorter TTL
await cacheMetadata(key, generator, CACHE_CONFIG.TTL.SHORT, tags); // 5 min

// Stable content → Longer TTL
await cacheMetadata(key, generator, CACHE_CONFIG.TTL.LONG, tags); // 1 hour

// Featured content → Extended TTL
await cacheMetadata(key, generator, CACHE_CONFIG.TTL.EXTENDED, tags); // 2 hours
```

**2. Warm Cache Proactively:**

```typescript
// After deployment
async function postDeploymentWarmup() {
  const featuredBobbleheads = await getFeaturedBobbleheadIds();
  await warmMetadataCache('bobblehead', featuredBobbleheads, generateMetadata);

  const trendingCollections = await getTrendingCollectionIds();
  await warmMetadataCache('collection', trendingCollections, generateMetadata);
}
```

**3. Invalidate Precisely:**

```typescript
// ✅ GOOD: Invalidate only affected content
invalidateMetadataCache('bobblehead', bobbleheadId);

// ❌ BAD: Invalidate all metadata
CacheService.invalidateByTag('seo');
```

**4. Monitor Hit Rates:**

```typescript
// Regular monitoring
setInterval(() => {
  const stats = getMetadataCacheStats();
  if (stats.hitRate < 60) {
    console.warn('Cache hit rate below target:', stats);
    // Alert team or adjust caching strategy
  }
}, 300000); // Every 5 minutes
```

### ISR Configuration Guidelines

**Static Pages:**

```typescript
// No revalidation needed (update on deployment only)
export const revalidate = false;
```

**Frequently Updated:**

```typescript
// Revalidate every minute
export const revalidate = 60;
```

**Moderate Updates:**

```typescript
// Revalidate every 5 minutes
export const revalidate = 300;
```

**Rarely Updated:**

```typescript
// Revalidate every hour
export const revalidate = 3600;
```

### Database Query Optimization

**1. Select Only Needed Columns:**

```typescript
// ✅ GOOD: Select only metadata fields
const bobblehead = await db
  .select({
    id: bobbleheads.id,
    name: bobbleheads.name,
    description: bobbleheads.description,
    primaryImage: bobbleheads.primaryImage,
    category: bobbleheads.category,
    createdAt: bobbleheads.createdAt,
  })
  .from(bobbleheads)
  .where(eq(bobbleheads.slug, slug))
  .limit(1);

// ❌ BAD: Select all columns
const bobblehead = await db.query.bobbleheads.findFirst({
  where: eq(bobbleheads.slug, slug),
});
```

**2. Use Indexes:**

```sql
-- Ensure indexes exist for metadata queries
CREATE INDEX idx_bobbleheads_slug ON bobbleheads(slug);
CREATE INDEX idx_collections_slug ON collections(slug);
CREATE INDEX idx_users_username ON users(username);
```

**3. Avoid N+1 Queries:**

```typescript
// ✅ GOOD: Join in single query
const bobblehead = await db
  .select({
    id: bobbleheads.id,
    name: bobbleheads.name,
    ownerName: users.displayName,
  })
  .from(bobbleheads)
  .innerJoin(users, eq(bobbleheads.userId, users.id))
  .where(eq(bobbleheads.slug, slug))
  .limit(1);

// ❌ BAD: Separate queries
const bobblehead = await getBobblehead(slug);
const owner = await getUser(bobblehead.userId); // N+1 query
```

### Sentry Monitoring Integration

**Automatic Performance Tracking:**

All metadata operations are wrapped in Sentry spans:

```typescript
// Metadata generation
Sentry.startSpan({ name: 'seo.metadata.generate', op: 'seo.metadata' }, () => {
  // Generation logic
});

// Open Graph generation
Sentry.startSpan({ name: 'seo.metadata.opengraph', op: 'seo.metadata.component' }, () => {
  // OG logic
});

// Sitemap generation
Sentry.startSpan({ name: 'seo.sitemap.generate', op: 'seo.sitemap' }, () => {
  // Sitemap logic
});
```

**Custom Metrics:**

```typescript
// Set custom measurements
Sentry.setMeasurement('sitemap.routes.total', allRoutes.length, 'none');
Sentry.setMeasurement('metadata.cache.hit_rate', hitRate, 'percent');
```

**Performance Alerts in Sentry:**

Configure alerts for:

- Metadata generation > 200ms (P95)
- Sitemap generation > 5s
- Cache hit rate < 60%
- Error rate > 1%

---

## Maintenance Procedures

### Regular Maintenance Tasks

**Weekly:**

- [ ] Review cache hit rates in monitoring
- [ ] Check Sentry for SEO-related errors
- [ ] Validate sitemap generates successfully
- [ ] Test metadata on 5 random pages with external validators

**Monthly:**

- [ ] Update verification tokens if rotated
- [ ] Review and update FALLBACK_METADATA if needed
- [ ] Check for new schema.org types relevant to platform
- [ ] Audit sitemap for broken or missing pages
- [ ] Review robots.txt for new routes to block/allow

**Quarterly:**

- [ ] Analyze metadata performance trends
- [ ] Update CHARACTER_LIMITS based on platform changes
- [ ] Review and optimize cache TTL values
- [ ] Conduct full SEO audit with external tools
- [ ] Update documentation for new features

**After Major Releases:**

- [ ] Warm cache for new featured content
- [ ] Verify all new page types have proper metadata
- [ ] Test preview mode if authentication changed
- [ ] Check sitemap includes new route patterns
- [ ] Update robots.txt for new authenticated routes

### Updating Metadata Defaults

**Changing Site Description:**

```typescript
// src/lib/seo/seo.constants.ts
export const DEFAULT_SITE_METADATA = {
  // ...existing fields
  description: 'New site description (max 155 characters)', // ✏️ Update here
};

export const FALLBACK_METADATA = {
  // ...existing fields
  description: 'New fallback description', // ✏️ Update here too
};
```

**Changing Site Name:**

```typescript
// src/lib/seo/seo.constants.ts
export const DEFAULT_SITE_METADATA = {
  siteName: 'New Site Name', // ✏️ Update
  title: 'New Site Name - Tagline', // ✏️ Update
  // ...
};
```

**Changing Default Image:**

1. Add new default image to `/public/images/`
2. Update constants:

```typescript
export const FALLBACK_METADATA = {
  imageUrl: `${DEFAULT_SITE_METADATA.url}/images/og-new-default.jpg`, // ✏️ Update
  imageAlt: 'New Image Alt Text', // ✏️ Update
  // ...
};
```

3. Clear CDN cache after deployment

**Changing Twitter Handle:**

```typescript
export const DEFAULT_SITE_METADATA = {
  twitterHandle: '@newhandle', // ✏️ Update
  // ...
};
```

### Adding New Content Types

**Step 1: Add to MetadataContentType**

```typescript
// src/lib/seo/cache.utils.ts
export type MetadataContentType = 'bobblehead' | 'collection' | 'subcollection' | 'user' | 'article'; // ✏️ Add new type
```

**Step 2: Create Cache Key Generator**

```typescript
// src/lib/seo/cache.utils.ts
export function getArticleMetadataKey(articleId: string): string {
  return `seo:metadata:article:${articleId}`;
}
```

**Step 3: Update batchCacheMetadata and warmMetadataCache**

```typescript
// Add case for new content type
case 'article':
  key = getArticleMetadataKey(item.id);
  tags = CacheTagGenerators.article.read(item.id);
  break;
```

**Step 4: Update invalidateMetadataCache**

```typescript
case 'article':
  CacheService.invalidateByTag(CACHE_CONFIG.TAGS.ARTICLE(contentId));
  break;
```

**Step 5: Add Cache Tags**

```typescript
// src/lib/utils/cache-tags.utils.ts
export const CacheTagGenerators = {
  // ...existing generators
  article: {
    read: (id: string) => ['article', `article:${id}`],
    list: () => ['article', 'articles:list'],
  },
};
```

**Step 6: Add to Constants (if needed)**

```typescript
// src/lib/constants/cache.ts
export const CACHE_CONFIG = {
  TAGS: {
    // ...existing tags
    ARTICLE: (id: string) => `article:${id}`,
  },
};
```

**Step 7: Implement Facade Method**

```typescript
// src/lib/facades/articles/articles.facade.ts
export async function getArticleSeoMetadata(articleId: string) {
  const cacheKey = getArticleMetadataKey(articleId);
  const tags = CacheTagGenerators.article.read(articleId);

  return cacheMetadata(
    cacheKey,
    async () => {
      const article = await db.query.articles.findFirst({
        where: eq(articles.id, articleId),
        columns: {
          id: true,
          title: true,
          description: true,
          coverImage: true,
          publishedAt: true,
        },
      });
      return article;
    },
    CACHE_CONFIG.TTL.LONG,
    tags,
  );
}
```

**Step 8: Add Invalidation to Actions**

```typescript
// src/lib/actions/articles/articles.actions.ts
import { invalidateMetadataCache } from '@/lib/seo/cache.utils';

export async function updateArticle(data: UpdateArticleData) {
  // Update logic...

  // Invalidate metadata cache
  invalidateMetadataCache('article', data.articleId);

  return { success: true };
}
```

### Cache Cleanup Procedures

**Manual Cache Clear:**

```typescript
import { CacheService } from '@/lib/services/cache.service';

// Clear all SEO metadata cache
CacheService.invalidateByTag('seo');

// Clear specific content type
CacheService.invalidateByTag('bobblehead');

// Clear all cache (use sparingly)
CacheService.clear();
```

**Scheduled Cache Cleanup:**

```typescript
// Setup cron job or QStash scheduled task
async function cleanupStaleMetadataCache() {
  // Get all cached metadata keys (implementation depends on cache provider)
  // Remove keys older than 7 days with zero hits

  console.log('Metadata cache cleanup complete');
}

// Run weekly
```

### Monitoring and Alerts

**Setup Alerts:**

1. **Sentry Alerts:**
   - Metadata generation duration > 200ms (P95)
   - Error rate > 1%
   - Cache hit rate < 60%

2. **Upstash Redis Alerts:**
   - Memory usage > 80%
   - Connection errors
   - Eviction rate increase

3. **Next.js Build Alerts:**
   - Sitemap generation failures
   - Type errors in metadata

**Dashboard Metrics:**

Track these metrics in your monitoring dashboard:

- Metadata generation duration (P50, P95, P99)
- Cache hit rate by content type
- Sitemap generation time
- SEO-related errors per hour
- Database query duration for metadata

---

## Security Considerations

### Preview Mode Security

**Token Management:**

1. **Generate Strong Tokens:**

```bash
# Use cryptographically secure random generation
openssl rand -hex 32

# OR
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

2. **Store Securely:**

```bash
# ✅ GOOD: Environment variable (never commit)
PREVIEW_SECRET=abc123...xyz789

# ❌ BAD: Hardcoded in source
const PREVIEW_SECRET = 'abc123'; // Never do this!
```

3. **Rotate Regularly:**

- Rotate preview tokens quarterly or after suspected compromise
- Update environment variables in all environments
- Test preview mode after rotation

4. **Timing-Safe Comparison:**

```typescript
// Already implemented in validatePreviewToken()
// Uses crypto.timingSafeEqual() to prevent timing attacks
import { timingSafeEqual } from 'crypto';

const expectedBuffer = Buffer.from(expectedToken);
const providedBuffer = Buffer.from(providedToken);
return timingSafeEqual(expectedBuffer, providedBuffer);
```

### Private Content Protection

**Ensure Private Content is Not Indexed:**

```typescript
// Check in generateMetadata()
export async function generateMetadata({ params }): Promise<Metadata> {
  const content = await getContent(params.id);

  // CRITICAL: Respect privacy settings
  if (!content.isPublic) {
    return {
      title: 'Private Content',
      robots: 'noindex, nofollow', // ✅ Prevent indexing
    };
  }

  // Generate public metadata...
}
```

**Exclude from Sitemap:**

```typescript
// src/app/sitemap.ts
const publicCollections = await db.select().from(collections).where(eq(collections.isPublic, true)); // ✅ Only public content
```

**Block in robots.txt:**

```typescript
// src/app/robots.ts
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        disallow: [
          '/dashboard/*', // ✅ Block authenticated routes
          '/settings/*',
          '/admin/*',
        ],
      },
    ],
  };
}
```

### robots.txt and noindex Usage

**When to Use `noindex`:**

- Private user content
- Authenticated-only pages
- Draft/preview content
- Duplicate content (use canonical instead if public)
- Paginated pages beyond page 1
- Search results pages

**When to Use `nofollow`:**

- Login/logout pages
- User-generated links (comments)
- Untrusted content
- Affiliate links

**Configuration Matrix:**

| Page Type        | index | follow | Use Case                                  |
| ---------------- | ----- | ------ | ----------------------------------------- |
| Public content   | ✅    | ✅     | Normal pages                              |
| Private content  | ❌    | ❌     | User dashboard                            |
| Search results   | ❌    | ✅     | Let bots crawl links but don't index page |
| Login page       | ❌    | ❌     | No value to index                         |
| Public duplicate | ✅    | ✅     | Use canonical tag instead                 |

### HTTPS Requirements

**Always Use HTTPS in Production:**

```typescript
// Verify NEXT_PUBLIC_SITE_URL uses HTTPS
if (process.env.NODE_ENV === 'production') {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl?.startsWith('https://')) {
    console.error('NEXT_PUBLIC_SITE_URL must use HTTPS in production');
  }
}
```

**Preview Mode Cookie Security:**

Next.js draftMode() automatically sets:

- `httpOnly: true` - Prevents XSS attacks
- `secure: true` - HTTPS only (in production)
- `sameSite: 'lax'` - CSRF protection

### Input Sanitization

**Sanitize User-Generated Content in Metadata:**

```typescript
// Use existing sanitization middleware
import { sanitizeInput } from '@/lib/middleware/sanitization.middleware';

export async function generateMetadata({ params }): Promise<Metadata> {
  const bobblehead = await getBobblehead(params.slug);

  // Sanitize user input before using in metadata
  const sanitizedName = sanitizeInput(bobblehead.name);
  const sanitizedDescription = sanitizeInput(bobblehead.description);

  return generatePageMetadata('bobblehead', {
    title: sanitizedName,
    description: sanitizedDescription,
    // ...
  });
}
```

**Prevent XSS in JSON-LD:**

```typescript
// Already handled by serializeJsonLd() using JSON.stringify()
// But be cautious with dangerouslySetInnerHTML

// ✅ GOOD: Use serializeJsonLd()
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }}
/>

// ❌ BAD: Manually construct JSON
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: `{"name": "${unsanitizedName}"}` // XSS risk!
  }}
/>
```

### Rate Limiting

**Protect Preview Endpoint:**

```typescript
// Consider adding rate limiting to /api/preview
import { rateLimit } from '@/lib/middleware/rate-limit';

export async function GET(request: Request) {
  // Rate limit preview endpoint to prevent brute force
  const rateLimitResult = await rateLimit(request, {
    limit: 10,
    window: 60000, // 10 requests per minute
  });

  if (!rateLimitResult.success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  // ... rest of preview logic
}
```

---

## Conclusion

This SEO implementation provides a comprehensive, performant, and maintainable solution for optimizing Head Shakers' presence in search engines and social media platforms. By following the guidelines in this documentation, the team can:

- **Generate** optimal metadata for all content types
- **Cache** metadata efficiently to reduce database load
- **Invalidate** caches automatically when content changes
- **Monitor** performance and hit rates
- **Troubleshoot** issues quickly using provided guides
- **Maintain** the system with minimal effort

For questions or issues not covered in this guide, consult:

- [Next.js Metadata API Documentation](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Schema.org Documentation](https://schema.org/)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Card Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)

**Last Updated:** November 13, 2025
**Version:** 1.0.0
