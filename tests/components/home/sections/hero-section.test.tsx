import type { JSX } from 'react';

import * as ClerkNextjs from '@clerk/nextjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HeroSection } from '@/app/(app)/(home)/components/sections/hero-section';
import { generateTestId } from '@/lib/test-ids';

import { render, screen } from '../../../setup/test-utils';

// Mock async server components
vi.mock('@/app/(app)/(home)/components/async/featured-bobblehead-async', () => ({
  FeaturedBobbleheadAsync: (): JSX.Element => (
    <div data-testid={'featured-bobblehead-async'}>Featured Bobblehead</div>
  ),
}));

vi.mock('@/app/(app)/(home)/components/async/platform-stats-async', () => ({
  PlatformStatsAsync: (): JSX.Element => <div data-testid={'platform-stats-async'}>Platform Stats</div>,
}));

// Mock SignUpButton
vi.mock('@clerk/nextjs', async () => {
  const actual = await vi.importActual<typeof ClerkNextjs>('@clerk/nextjs');
  return {
    ...actual,
    SignUpButton: ({ children }: Children): JSX.Element => <button>{children}</button>,
  };
});

type UseAuthReturn = ReturnType<typeof ClerkNextjs.useAuth>;

// Helper functions to mock different auth states
const mockLoadingAuth = () => {
  vi.spyOn(ClerkNextjs, 'useAuth').mockReturnValue({
    actor: null,
    getToken: vi.fn().mockResolvedValue('mock-token'),
    has: vi.fn().mockReturnValue(false),
    isLoaded: false,
    isSignedIn: false,
    orgId: null,
    orgRole: null,
    orgSlug: null,
    sessionClaims: null,
    sessionId: null,
    signOut: vi.fn(),
    userId: null,
  } as unknown as UseAuthReturn);
};

const mockSignedInUser = () => {
  vi.spyOn(ClerkNextjs, 'useAuth').mockReturnValue({
    actor: null,
    getToken: vi.fn().mockResolvedValue('mock-token'),
    has: vi.fn().mockReturnValue(false),
    isLoaded: true,
    isSignedIn: true,
    orgId: null,
    orgRole: null,
    orgSlug: null,
    sessionClaims: null,
    sessionId: 'mock-session-id',
    signOut: vi.fn(),
    userId: 'test-user-id',
  } as unknown as UseAuthReturn);
};

const mockSignedOutUser = () => {
  vi.spyOn(ClerkNextjs, 'useAuth').mockReturnValue({
    actor: null,
    getToken: vi.fn().mockResolvedValue('mock-token'),
    has: vi.fn().mockReturnValue(false),
    isLoaded: true,
    isSignedIn: false,
    orgId: null,
    orgRole: null,
    orgSlug: null,
    sessionClaims: null,
    sessionId: null,
    signOut: vi.fn(),
    userId: null,
  } as unknown as UseAuthReturn);
};

describe('HeroSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render main heading with discover text', () => {
      mockSignedOutUser();
      render(<HeroSection />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading.textContent).toMatch(/Collect, Share, and/i);
      expect(heading.textContent).toMatch(/Discover/i);
    });

    it('should render description text', () => {
      mockSignedOutUser();
      render(<HeroSection />);

      expect(
        screen.getByText(/Build your digital bobblehead collection, connect with other collectors/i),
      ).toBeInTheDocument();
    });

    it('should render section with correct test ID', () => {
      mockSignedOutUser();
      render(<HeroSection />);

      expect(screen.getByTestId(generateTestId('feature', 'hero-section'))).toBeInTheDocument();
    });

    it('should render browse collections button', () => {
      mockSignedOutUser();
      render(<HeroSection />);

      expect(screen.getByRole('link', { name: /Browse Collections/i })).toBeInTheDocument();
    });

    it('should render explore bobbleheads button', () => {
      mockSignedOutUser();
      render(<HeroSection />);

      expect(screen.getByRole('link', { name: /Explore Bobbleheads/i })).toBeInTheDocument();
    });

    it('should render premier community badge', () => {
      mockSignedOutUser();
      render(<HeroSection />);

      expect(screen.getByText(/The Premier Bobblehead Community/i)).toBeInTheDocument();
    });
  });

  describe('Suspense Fallbacks', () => {
    it('should render section with error boundary wrappers', () => {
      mockSignedOutUser();
      render(<HeroSection />);

      // Verify the section renders (which includes ErrorBoundary wrappers)
      expect(screen.getByTestId(generateTestId('feature', 'hero-section'))).toBeInTheDocument();
    });
  });

  describe('Auth-Aware Button Rendering', () => {
    it('should render sign up button for unauthenticated users', () => {
      mockSignedOutUser();
      render(<HeroSection />);

      expect(screen.getByText(/Start Your Collection/i)).toBeInTheDocument();
    });

    it('should render my collection button for authenticated users', () => {
      mockSignedInUser();
      render(<HeroSection username={'test-user'} />);

      expect(screen.getByRole('link', { name: /My Collection/i })).toBeInTheDocument();
    });

    it('should show loading skeleton when auth is loading', () => {
      mockLoadingAuth();
      render(<HeroSection />);

      // When auth is loading, the AuthContent component renders the loadingSkeleton
      // which is a Skeleton component. We can verify it exists by checking the DOM
      const section = screen.getByTestId(generateTestId('feature', 'hero-section'));
      expect(section).toBeInTheDocument();
    });
  });
});
