import 'server-only';

import { BobbleheadGridDisplay } from '../display/bobblehead-grid-display';

// Type for bobblehead data from the server
export type BobbleheadData = {
  characterName?: string;
  commentCount: number;
  condition: string;
  height?: number;
  id: string;
  imageUrl?: string;
  isFeatured: boolean;
  likeCount: number;
  manufacturer?: string;
  material?: string;
  name: string;
  purchasePrice?: number;
  series?: string;
  viewCount: number;
  year?: number;
};

// TODO: Add collectionId prop when implementing real data fetching
// type BobbleheadGridAsyncProps = {
//   collectionId?: string;
// };

/**
 * Server component that fetches bobbleheads for a collection
 * and passes them to the client display component.
 */
export async function BobbleheadGridAsync() {
  // TODO: Replace with real facade calls:
  // const userId = await getUserIdAsync();
  // const bobbleheads = await BobbleheadsFacade.getBobbleheadsByCollectionAsync(collectionId, userId);

  // Placeholder await - remove when adding real data fetching
  await Promise.resolve();

  // For now, pass empty data - replace with real facade calls
  const bobbleheads: Array<BobbleheadData> = [];
  const categories: Array<string> = [];
  const conditions: Array<string> = [];

  return <BobbleheadGridDisplay bobbleheads={bobbleheads} categories={categories} conditions={conditions} />;
}
