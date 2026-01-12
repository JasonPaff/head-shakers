'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

type CollectionUrlSyncProps = {
  collectionSlug: string;
};

/**
 * Client component that silently updates the URL to include the collection slug
 * when the page was loaded without one (default collection auto-selection).
 * Uses router.replace to avoid adding to browser history.
 */
export function CollectionUrlSync({ collectionSlug }: CollectionUrlSyncProps) {
  const router = useRouter();

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('collectionSlug', collectionSlug);
    router.replace(url.pathname + url.search, { scroll: false });
  }, [collectionSlug, router]);

  return null;
}
