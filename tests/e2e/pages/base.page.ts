import type { Locator, Page } from '@playwright/test';

import { type ComponentFinder, createComponentFinder } from '../helpers/test-helpers';

export abstract class BasePage {
  // Common layout locators using valid test IDs
  get appHeader(): Locator {
    return this.finder.layout('app-header');
  }

  get appSidebar(): Locator {
    return this.finder.layout('app-sidebar');
  }

  get mainNav(): Locator {
    return this.finder.layout('main-nav');
  }

  abstract get url(): string;

  get userAvatar(): Locator {
    return this.finder.layout('user-avatar', 'button');
  }

  get userNav(): Locator {
    return this.finder.layout('user-nav');
  }

  protected readonly finder: ComponentFinder;

  constructor(protected readonly page: Page) {
    this.finder = createComponentFinder(page);
  }

  // Generic locator by data-testid for custom IDs
  byTestId(testId: string): Locator {
    return this.page.locator(`[data-testid="${testId}"]`);
  }

  // Common actions
  async goto(): Promise<void> {
    await this.page.goto(this.url);
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      await this.userAvatar.waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  async openUserMenu(): Promise<void> {
    await this.userAvatar.click();
  }

  async signOut(): Promise<void> {
    await this.openUserMenu();
    await this.page.getByRole('menuitem', { name: /sign out/i }).click();
  }

  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }
}
