import type { JSX } from 'react';

import * as ClerkNextjs from '@clerk/nextjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { JoinCommunitySection } from '@/app/(app)/(home)/components/sections/join-community-section';

import { render, screen } from '../../../setup/test-utils';

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

describe('JoinCommunitySection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render section heading', () => {
      mockSignedOutUser();
      render(<JoinCommunitySection />);

      expect(screen.getByRole('heading', { name: /Join the Community/i })).toBeInTheDocument();
    });

    it('should render section description', () => {
      mockSignedOutUser();
      render(<JoinCommunitySection />);

      expect(
        screen.getByText(
          /Connect with fellow collectors, share your finds, and discover new additions to your collection/i,
        ),
      ).toBeInTheDocument();
    });
  });

  describe('Feature Cards', () => {
    it('should render connect card with heading and description', () => {
      mockSignedOutUser();
      render(<JoinCommunitySection />);

      expect(screen.getByRole('heading', { name: /^Connect$/i })).toBeInTheDocument();
      expect(screen.getByText(/Follow other collectors and build your network/i)).toBeInTheDocument();
    });

    it('should render discover card with heading and description', () => {
      mockSignedOutUser();
      render(<JoinCommunitySection />);

      expect(screen.getByRole('heading', { name: /^Discover$/i })).toBeInTheDocument();
      expect(screen.getByText(/Find trending bobbleheads and rare collectibles/i)).toBeInTheDocument();
    });

    it('should render share card with heading and description', () => {
      mockSignedOutUser();
      render(<JoinCommunitySection />);

      expect(screen.getByRole('heading', { name: /^Share$/i })).toBeInTheDocument();
      expect(screen.getByText(/Showcase your collection and get feedback/i)).toBeInTheDocument();
    });
  });

  describe('Auth-Aware CTAs - Signed Out', () => {
    it('should render sign up button for unauthenticated users', () => {
      mockSignedOutUser();
      render(<JoinCommunitySection />);

      expect(screen.getByText(/Get Started Free/i)).toBeInTheDocument();
    });

    it('should render explore collections link for unauthenticated users', () => {
      mockSignedOutUser();
      render(<JoinCommunitySection />);

      const links = screen.getAllByRole('link', { name: /Explore Collections/i });
      expect(links.length).toBeGreaterThan(0);
      expect(links[0]).toHaveAttribute('href', '/browse');
    });

    it('should show create account badge for unauthenticated users', () => {
      mockSignedOutUser();
      render(<JoinCommunitySection />);

      expect(screen.getByText(/Create your free account today/i)).toBeInTheDocument();
    });
  });

  describe('Auth-Aware CTAs - Signed In', () => {
    it('should render my collection button for authenticated users', () => {
      mockSignedInUser();
      render(<JoinCommunitySection />);

      expect(screen.getByRole('link', { name: /My Collection/i })).toBeInTheDocument();
    });

    it('should render explore collections link for authenticated users', () => {
      mockSignedInUser();
      render(<JoinCommunitySection />);

      const links = screen.getAllByRole('link', { name: /Explore Collections/i });
      expect(links.length).toBeGreaterThan(0);
      expect(links[0]).toHaveAttribute('href', '/browse');
    });

    it('should not show sign up badge for authenticated users', () => {
      mockSignedInUser();
      render(<JoinCommunitySection />);

      expect(screen.queryByText(/Create your free account today/i)).not.toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should render section when auth is loading', () => {
      mockLoadingAuth();
      render(<JoinCommunitySection />);

      // When auth is loading, the section still renders but AuthContent shows a loading skeleton
      expect(screen.getByRole('heading', { name: /Join the Community/i })).toBeInTheDocument();
    });
  });
});
