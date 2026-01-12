import 'server-only';

import { CollectionsDashboardFacade } from '@/lib/facades/collections/collections-dashboard.facade';
import { getRequiredUserIdAsync } from '@/utils/auth-utils';

import { CollectionHeaderDisplay } from '../display/collection-header-display';

type CollectionHeaderAsyncProps = {
  collectionSlug: string;
};

/**
 * Server component that fetches collection header data
 * and passes it to the client display component.
 */
export async function CollectionHeaderAsync({ collectionSlug }: CollectionHeaderAsyncProps) {
  const userId = await getRequiredUserIdAsync();

  const collection = await CollectionsDashboardFacade.getHeaderByCollectionSlugAsync(userId, collectionSlug);

  return <CollectionHeaderDisplay collection={collection} />;
}
