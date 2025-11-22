import type { Locator, Page } from '@playwright/test';

import { BasePage } from './base.page';

export class DashboardPage extends BasePage {
  get collectionCards(): Locator {
    return this.finder.feature('collection-card');
  }

  // Dashboard specific locators using valid test IDs
  get collectionGrid(): Locator {
    return this.finder.feature('collection-grid');
  }

  get emptyState(): Locator {
    return this.finder.feature('empty-state');
  }

  get url(): string {
    return '/dashboard/collection';
  }

  constructor(page: Page) {
    super(page);
  }

  // Dashboard specific actions
  async getCollectionCount(): Promise<number> {
    return await this.collectionCards.count();
  }

  async hasCollections(): Promise<boolean> {
    const count = await this.getCollectionCount();
    return count > 0;
  }

  async selectCollection(name: string): Promise<void> {
    await this.page.getByRole('link', { name }).click();
  }
}
