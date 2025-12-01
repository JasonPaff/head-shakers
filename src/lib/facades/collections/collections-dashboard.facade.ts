import type { CollectionDashboardHeaderRecord } from '@/lib/queries/collections/collections-dashboard.query';
import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';

import { OPERATIONS } from '@/lib/constants';
import { db } from '@/lib/db';
import { BaseFacade } from '@/lib/facades/base/base-facade';
import { CollectionsDashboardQuery } from '@/lib/queries/collections/collections-dashboard.query';
import { executeFacadeOperation } from '@/lib/utils/facade-helpers';

const facade = 'COLLECTIONS_DASHBOARD_FACADE';

export class CollectionsDashboardFacade extends BaseFacade {
  static async getCollectionHeaderForUserBySlug(
    userId: string,
    slug: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<CollectionDashboardHeaderRecord> {
    return await executeFacadeOperation(
      {
        data: { slug, userId },
        facade,
        method: 'getCollectionHeaderForUserBySlug',
        operation: OPERATIONS.COLLECTIONS.GET_COLLECTION_HEADER_FOR_USER_BY_SLUG,
      },
      async () => {
        // TODO: add caching
        const context = this.getUserContext(userId, dbInstance);
        return await CollectionsDashboardQuery.getCollectionHeaderForUserBySlugAsync(slug, context);
      },
    );
  }
}
