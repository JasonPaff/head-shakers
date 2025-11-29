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

  // Newsletter locators
  get newsletterEmailInput(): Locator {
    return this.byTestId('footer-newsletter-email');
  }

  get newsletterSection(): Locator {
    return this.byTestId('layout-app-footer-newsletter-subscribe').or(
      this.byTestId('layout-app-footer-newsletter-unsubscribe'),
    );
  }

  get newsletterStayUpdatedText(): Locator {
    return this.page.getByText(/stay updated/i);
  }

  get newsletterSubmitButton(): Locator {
    return this.byTestId('footer-newsletter-submit');
  }

  get newsletterSubscribeSection(): Locator {
    return this.byTestId('layout-app-footer-newsletter-subscribe');
  }

  get newsletterSubscribingButton(): Locator {
    return this.page.getByRole('button', { name: /subscribing/i });
  }

  get newsletterSuccessHeading(): Locator {
    return this.page.getByRole('heading', { name: /newsletter subscriber/i });
  }

  get newsletterUnsubscribeButton(): Locator {
    return this.byTestId('layout-app-footer-newsletter-unsubscribe-button');
  }

  get newsletterUnsubscribeSection(): Locator {
    return this.byTestId('layout-app-footer-newsletter-unsubscribe');
  }

  get newsletterUnsubscribingButton(): Locator {
    return this.page.getByRole('button', { name: /unsubscribing/i });
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

  // Newsletter actions
  async scrollToFooter(): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await this.newsletterSection.waitFor({ state: 'visible' });
  }

  // Home page specific actions
  async search(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
  }

  async subscribeToNewsletter(email: string): Promise<void> {
    await this.newsletterEmailInput.fill(email);
    await this.newsletterSubmitButton.click();
  }
}
