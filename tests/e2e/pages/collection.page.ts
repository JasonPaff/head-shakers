import type { Locator, Page } from '@playwright/test';

import { BasePage } from './base.page';

export class CollectionPage extends BasePage {
  get bobbleheadCards(): Locator {
    return this.finder.feature('bobblehead-card');
  }

  get bobbleheadGallery(): Locator {
    return this.finder.feature('bobblehead-gallery');
  }

  // Collection page specific locators using valid test IDs
  get collectionCard(): Locator {
    return this.finder.feature('collection-card');
  }

  get url(): string {
    if (this.collectionId) {
      return `/dashboard/collection/${this.collectionId}`;
    }
    return '/dashboard/collection';
  }

  constructor(
    page: Page,
    private collectionId?: string,
  ) {
    super(page);
  }

  // Collection page specific actions
  async getBobbleheadCount(): Promise<number> {
    return await this.bobbleheadCards.count();
  }

  async selectBobblehead(name: string): Promise<void> {
    await this.page.getByRole('link', { name }).click();
  }

  setCollectionId(id: string): void {
    this.collectionId = id;
  }
}
