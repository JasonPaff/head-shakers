import 'server-only';

import { CollectionsFacade } from '@/lib/facades/collections/collections.facade';
import { getRequiredUserIdAsync } from '@/utils/auth-utils';

import { SidebarDisplay } from '../display/sidebar-display';

/**
 * Server component that fetches the collection data
 * and passes it to the client display component.
 */
export async function SidebarAsync() {
  const userId = await getRequiredUserIdAsync();
  const collections = await CollectionsFacade.getDashboardListByUserId(userId);

  return <SidebarDisplay collections={collections} />;
}
