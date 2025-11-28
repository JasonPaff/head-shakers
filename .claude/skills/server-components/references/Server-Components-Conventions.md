# Server Components Conventions

## Overview

Server components in Head Shakers handle async data fetching, caching, streaming, and SEO. This document covers patterns UNIQUE to server components. For shared React conventions, see React-Coding-Conventions.md.

## Prerequisites

Before using this document, ensure you have loaded:

1. react-coding-conventions - Base React patterns
2. ui-components - UI component patterns
3. caching - Cache service patterns

---

## Async Component Patterns

### Async Arrow Function (Preferred for Feature Components)

```tsx
import 'server-only';

import type { ComponentTestIdProps } from '@/lib/test-ids';

interface MyComponentAsyncProps extends ComponentTestIdProps {
  entityId: string;
}

export const MyComponentAsync = async ({ entityId, testId }: MyComponentAsyncProps) => {
  const currentUserId = await getRequiredUserIdAsync();
  const data = await MyFacade.getByIdAsync(entityId, currentUserId);

  if (!data) {
    notFound();
  }

  return <MyComponent data={data} testId={testId} />;
};
```

### Async Function Declaration (Preferred for Pages)

```tsx
import type { PageProps } from '@/app/(app)/my-page/route-type';

import { Route } from '@/app/(app)/my-page/route-type';

async function MyPage({ routeParams, searchParams }: PageProps) {
  const { slug } = await routeParams;
  const resolvedSearchParams = await searchParams;

  // Data fetching logic
  return <PageContent />;
}

export default withParamValidation(MyPage, Route);
```

---

## Server-Only Guard

### Protect Server-Only Code

```tsx
import 'server-only';

// This file can only be imported from server components
// Will throw error if imported in client component
```

**When to use**:

- Async components that fetch data
- Files with direct database/facade calls
- Files with server-only utilities (auth, etc.)

---

## Data Fetching Patterns

### Single Fetch

```tsx
const data = await BobbleheadsFacade.getBobbleheadByIdAsync(bobbleheadId, viewerUserId);
```

### Parallel Fetching with Promise.all

```tsx
const [collection, likeData, comments] = await Promise.all([
  CollectionsFacade.getCollectionForPublicViewAsync(collectionId, userId),
  SocialFacade.getContentLikeDataAsync(collectionId, 'collection', userId),
  CommentsFacade.getCommentsAsync(collectionId, 'collection'),
]);
```

### With Caching (Always Preferred)

Always fetch through facades that integrate with CacheService:

```tsx
// Facade internally uses CacheService.collections.byId()
const collection = await CollectionsFacade.getCollectionByIdAsync(collectionId);
```

**Important**: Do NOT use `CacheRevalidationService` in server components. Cache invalidation happens in server actions after mutations.

---

## Authentication Utilities

### Optional Authentication

```tsx
import { getOptionalUserIdAsync } from '@/utils/optional-auth-utils';

const currentUserId = await getOptionalUserIdAsync();
// Returns string | null
```

### Required Authentication

```tsx
import { getUserIdAsync } from '@/utils/user-utils';

const userId = await getUserIdAsync();
// Redirects to sign-in if not authenticated
```

### Ownership Check

```tsx
import { checkIsOwnerAsync } from '@/utils/optional-auth-utils';

const isOwner = await checkIsOwnerAsync(resource.userId);
// Returns boolean
```

### Admin/Moderator Check

```tsx
import { checkIsModeratorAsync } from '@/lib/utils/admin.utils';

const isModerator = await checkIsModeratorAsync();
// Returns boolean
```

---

## Streaming with Suspense

### Pattern: Async Component with Skeleton

```tsx
import { Suspense } from 'react';

// In page.tsx
<Suspense fallback={<CollectionBobbleheadsSkeleton />}>
  <CollectionBobbleheadsAsync collectionId={collectionId} />
</Suspense>;
```

### Create Async Wrapper Components

```tsx
// components/async/my-section-async.tsx
import 'server-only';

export const MySectionAsync = async ({ id }: MySectionAsyncProps) => {
  const data = await MyFacade.getDataAsync(id);
  return <MySection data={data} />;
};
```

### Create Corresponding Skeleton

```tsx
// components/skeletons/my-section-skeleton.tsx
import { Skeleton } from '@/components/ui/skeleton';

export const MySectionSkeleton = () => {
  return (
    <div className={'space-y-4'} data-slot={'my-section-skeleton'}>
      <Skeleton className={'h-8 w-48'} />
      <Skeleton className={'h-32 w-full'} />
    </div>
  );
};
```

### Error Boundary Pattern

```tsx
import { MyErrorBoundary } from './my-error-boundary';

<MyErrorBoundary section={'header'}>
  <Suspense fallback={<HeaderSkeleton />}>
    <HeaderAsync />
  </Suspense>
</MyErrorBoundary>;
```

---

## Error Handling

### Not Found Pattern

```tsx
import { notFound } from 'next/navigation';

const data = await MyFacade.getByIdAsync(id);

if (!data) {
  notFound();
}
```

### Redirect Pattern

```tsx
import { redirect } from 'next/navigation';
import { $path } from 'next-typesafe-url';

// Redirect if not authenticated
const userId = await getOptionalUserIdAsync();
if (!userId) {
  redirect($path({ route: '/sign-in' }));
}
```

---

## Metadata Generation

### Page Metadata

```tsx
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;

  const data = await MyFacade.getSeoDataAsync(slug);

  if (!data) {
    return {
      description: 'Not found',
      robots: 'noindex, nofollow',
      title: 'Not Found | Head Shakers',
    };
  }

  const canonicalUrl = `${DEFAULT_SITE_METADATA.url}${$path({
    route: '/my-page/[slug]',
    routeParams: { slug },
  })}`;

  return generatePageMetadata(
    'collection',
    {
      description: data.description,
      images: [data.coverImage],
      title: data.name,
      url: canonicalUrl,
    },
    {
      isIndexable: data.isPublic,
      shouldIncludeOpenGraph: true,
      shouldIncludeTwitterCard: true,
    },
  );
}
```

### JSON-LD Structured Data

```tsx
import { Fragment } from 'react';

import { generateCollectionPageSchema, generateBreadcrumbSchema } from '@/lib/seo/jsonld.utils';
import { serializeJsonLd } from '@/lib/seo/metadata.utils';

// Generate schemas
const collectionSchema = generateCollectionPageSchema({
  description: collection.description,
  itemsCount: collection.itemCount,
  name: collection.name,
  url: canonicalUrl,
});

const breadcrumbSchema = generateBreadcrumbSchema([
  { name: 'Home', url: DEFAULT_SITE_METADATA.url },
  { name: 'Collections', url: `${DEFAULT_SITE_METADATA.url}/collections` },
  { name: collection.name },
]);

return (
  <Fragment>
    {/* JSON-LD structured data */}
    <script
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(collectionSchema) }}
      type={'application/ld+json'}
    />
    <script
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbSchema) }}
      type={'application/ld+json'}
    />

    {/* Page content */}
    <PageContent />
  </Fragment>
);
```

---

## ISR Configuration

### Enable Incremental Static Regeneration

```tsx
// At the top of page.tsx, after imports
export const revalidate = 600; // Revalidate every 10 minutes
```

### Common Revalidation Values

| Value | Duration   | Use Case         |
| ----- | ---------- | ---------------- |
| 60    | 1 minute   | Trending content |
| 300   | 5 minutes  | Search results   |
| 600   | 10 minutes | Browse pages     |
| 3600  | 1 hour     | Static content   |

---

## Route Type Safety

### Import Route Types

```tsx
import type { PageProps } from '@/app/(app)/my-page/route-type';

import { Route } from '@/app/(app)/my-page/route-type';
```

### Use Validation HOC

```tsx
async function MyPage({ routeParams, searchParams }: PageProps) {
  // Page implementation
}

export default withParamValidation(MyPage, Route);
```

### Access Route Parameters

```tsx
async function MyPage({ routeParams, searchParams }: PageProps) {
  // Await the promises
  const { slug, id } = await routeParams;
  const resolvedSearchParams = await searchParams;

  // Use params
  const page = resolvedSearchParams.page ?? '1';
}
```

---

## Component Naming Conventions

| Suffix      | Purpose                       | Example                    |
| ----------- | ----------------------------- | -------------------------- |
| `*Async`    | Async data-fetching component | `CollectionHeaderAsync`    |
| `*Server`   | Server-only orchestration     | `FeaturedContentServer`    |
| `*Skeleton` | Loading state placeholder     | `CollectionHeaderSkeleton` |

---

## Import Order for Server Components

```tsx
// 1. Type imports
import type { Metadata } from 'next';

import type { PageProps } from '@/app/(app)/my-page/route-type';

// 2. Server-only guard (if needed)
import 'server-only';

// 3. External libraries
import { eq } from 'drizzle-orm';
import { $path } from 'next-typesafe-url';
import { withParamValidation } from 'next-typesafe-url/app/hoc';
import { notFound } from 'next/navigation';
import { Fragment, Suspense } from 'react';

// 4. Route type
import { Route } from '@/app/(app)/my-page/route-type';

// 5. Async components
import { MyComponentAsync } from './components/async/my-component-async';

// 6. Skeletons
import { MyComponentSkeleton } from './components/skeletons/my-component-skeleton';

// 7. Error boundaries
import { MyErrorBoundary } from './components/my-error-boundary';

// 8. Other internal components
import { ContentLayout } from '@/components/layout/content-layout';

// 9. Database/facades
import { db } from '@/lib/db';
import { MyFacade } from '@/lib/facades/my-domain/my.facade';

// 10. SEO utilities
import { generatePageSchema } from '@/lib/seo/jsonld.utils';
import { generatePageMetadata, serializeJsonLd } from '@/lib/seo/metadata.utils';

// 11. Auth utilities
import { getOptionalUserIdAsync, checkIsOwnerAsync } from '@/utils/optional-auth-utils';
```

---

## Anti-Patterns to Avoid

1. **Never use hooks in server components** - No useState, useEffect, useCallback, useMemo, useRef, etc.
2. **Never use event handlers** - No onClick, onChange, onSubmit, etc.
3. **Never use 'use client' directive** - Server components are the default
4. **Never import client libraries directly** - No Radix UI primitives, TanStack Form, etc.
5. **Never skip 'server-only' for async components** - Add the import guard
6. **Never fetch data without facades** - Use facade layer for consistency and caching
7. **Never skip Suspense for async children** - Always wrap with boundaries
8. **Never hardcode revalidate times** - Use standard values
9. **Never skip metadata for public pages** - SEO is important
10. **Never use CacheRevalidationService** - That's for server actions only
11. **Never use unstable_cache directly** - Use CacheService helpers
12. **Never skip error handling** - Use notFound() or error boundaries

---

## Complete Page Example

```tsx
import type { Metadata } from 'next';

import { $path } from 'next-typesafe-url';
import { withParamValidation } from 'next-typesafe-url/app/hoc';
import { notFound } from 'next/navigation';
import { Fragment, Suspense } from 'react';

import type { PageProps } from '@/app/(app)/my-page/[slug]/route-type';

import { MyContentAsync } from '@/app/(app)/my-page/[slug]/components/async/my-content-async';
import { MyContentSkeleton } from '@/app/(app)/my-page/[slug]/components/skeletons/my-content-skeleton';
import { MyErrorBoundary } from '@/app/(app)/my-page/[slug]/components/my-error-boundary';
import { Route } from '@/app/(app)/my-page/[slug]/route-type';
import { ContentLayout } from '@/components/layout/content-layout';
import { MyFacade } from '@/lib/facades/my-domain/my.facade';
import { generateMyPageSchema, generateBreadcrumbSchema } from '@/lib/seo/jsonld.utils';
import { generatePageMetadata, serializeJsonLd } from '@/lib/seo/metadata.utils';
import { DEFAULT_SITE_METADATA } from '@/lib/seo/seo.constants';
import { checkIsOwnerAsync, getOptionalUserIdAsync } from '@/utils/optional-auth-utils';

export const revalidate = 600;

export default withParamValidation(MyPage, Route);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await MyFacade.getSeoDataAsync(slug);

  if (!data) {
    return {
      description: 'Not found',
      robots: 'noindex, nofollow',
      title: 'Not Found | Head Shakers',
    };
  }

  const canonicalUrl = `${DEFAULT_SITE_METADATA.url}${$path({
    route: '/my-page/[slug]',
    routeParams: { slug },
  })}`;

  return generatePageMetadata(
    'page',
    {
      description: data.description,
      title: data.name,
      url: canonicalUrl,
    },
    {
      isIndexable: data.isPublic,
      shouldIncludeOpenGraph: true,
      shouldIncludeTwitterCard: true,
    },
  );
}

async function MyPage({ routeParams, searchParams }: PageProps) {
  const { slug } = await routeParams;
  const resolvedSearchParams = await searchParams;

  const currentUserId = await getOptionalUserIdAsync();
  const data = await MyFacade.getBySlugAsync(slug, currentUserId);

  if (!data) {
    notFound();
  }

  const isOwner = await checkIsOwnerAsync(data.userId);

  // Generate JSON-LD schemas
  const pageSchema = generateMyPageSchema({
    description: data.description,
    name: data.name,
    url: `${DEFAULT_SITE_METADATA.url}${$path({
      route: '/my-page/[slug]',
      routeParams: { slug },
    })}`,
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: DEFAULT_SITE_METADATA.url },
    { name: 'My Pages', url: `${DEFAULT_SITE_METADATA.url}/my-page` },
    { name: data.name },
  ]);

  return (
    <Fragment>
      {/* JSON-LD structured data */}
      <script
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(pageSchema) }}
        type={'application/ld+json'}
      />
      <script
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbSchema) }}
        type={'application/ld+json'}
      />

      {/* Page Content */}
      <ContentLayout>
        <MyErrorBoundary section={'content'}>
          <Suspense fallback={<MyContentSkeleton />}>
            <MyContentAsync dataId={data.id} isOwner={isOwner} searchParams={resolvedSearchParams} />
          </Suspense>
        </MyErrorBoundary>
      </ContentLayout>
    </Fragment>
  );
}
```
