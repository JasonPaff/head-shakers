import type { Locator, Page } from '@playwright/test';

import { BasePage } from './base.page';

export class HomePage extends BasePage {
  get getStartedButton(): Locator {
    return this.page.getByRole('link', { name: /get started/i });
  }

  // Home page specific locators using role-based and semantic selectors
  get heroSection(): Locator {
    return this.page.getByRole('region', { name: /hero/i }).or(this.byTestId('hero'));
  }

  get searchInput(): Locator {
    return this.finder.ui('input').or(this.page.getByRole('searchbox'));
  }

  get url(): string {
    return '/';
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
