import type { Locator, Page } from '@playwright/test';

import { BasePage } from './base.page';

export class HomePage extends BasePage {
  readonly url = '/';

  get browseCollectionsLink(): Locator {
    return this.page.getByRole('link', { name: /browse collections/i });
  }

  get exploreBobblesLink(): Locator {
    return this.page.getByRole('link', { name: /explore bobbleheads/i });
  }

  get featuredCollectionsSection(): Locator {
    return this.byTestId('layout-featured-collections-section');
  }

  // Legacy locators (kept for backwards compatibility)
  get getStartedButton(): Locator {
    return this.page.getByRole('link', { name: /get started/i });
  }

  // Section locators
  get heroSection(): Locator {
    return this.byTestId('layout-hero-section');
  }

  get joinCommunitySection(): Locator {
    return this.byTestId('layout-join-community-section');
  }

  get myCollectionLink(): Locator {
    return this.page.getByRole('link', { name: /my collection/i });
  }

  // Stats
  get platformStats(): Locator {
    return this.byTestId('feature-platform-stats-display');
  }

  get searchInput(): Locator {
    return this.finder.ui('input').or(this.page.getByRole('searchbox'));
  }

  // CTAs
  get startCollectionButton(): Locator {
    return this.page.getByRole('button', { name: /start your collection/i });
  }

  get trendingBobbleheadsSection(): Locator {
    return this.byTestId('layout-trending-bobbleheads-section');
  }

  constructor(page: Page) {
    super(page);
  }

  async clickGetStarted(): Promise<void> {
    await this.getStartedButton.click();
  }

  // Home page specific actions
  async search(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
  }
}
