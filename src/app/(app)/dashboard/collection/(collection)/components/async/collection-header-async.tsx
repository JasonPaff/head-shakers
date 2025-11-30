import 'server-only';

import { CollectionHeaderDisplay } from '../display/collection-header-display';

export type CollectionHeaderData = {
  bobbleheadCount: number;
  coverImageUrl: string;
  description: string;
  featuredCount: number;
  id: string;
  likeCount: number;
  name: string;
  totalValue: number;
  viewCount: number;
};

// TODO: Add collectionId prop when implementing real data fetching
// type CollectionHeaderAsyncProps = {
//   collectionId?: string;
// };

/**
 * Server component that fetches collection header data
 * and passes it to the client display component.
 */
export async function CollectionHeaderAsync() {
  // TODO: Replace with real facade calls:
  // const userId = await getUserIdAsync();
  // const collection = await CollectionsFacade.getCollectionByIdAsync(collectionId, userId);

  // Placeholder await - remove when adding real data fetching
  await Promise.resolve();

  // For now, pass null - replace with real facade calls
  const collection: CollectionHeaderData | null = null;

  return <CollectionHeaderDisplay collection={collection} />;
}
