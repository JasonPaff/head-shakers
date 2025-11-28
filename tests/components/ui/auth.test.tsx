import * as ClerkNextjs from '@clerk/nextjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthContent } from '@/components/ui/auth';

import { render, screen } from '../../setup/test-utils';

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

describe('AuthContent', () => {
  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loading state', () => {
    it('renders loading skeleton when auth is loading', () => {
      mockLoadingAuth();

      render(
        <AuthContent loadingSkeleton={<div data-testid={'loading'}>Loading...</div>}>
          <div data-testid={'content'}>Authenticated Content</div>
        </AuthContent>,
      );

      expect(screen.getByTestId('loading')).toBeInTheDocument();
      expect(screen.queryByTestId('content')).not.toBeInTheDocument();
    });

    it('does not render children or fallback when loading', () => {
      mockLoadingAuth();

      render(
        <AuthContent
          fallback={<div data-testid={'fallback'}>Sign In</div>}
          loadingSkeleton={<div data-testid={'loading'}>Loading...</div>}
        >
          <div data-testid={'content'}>Authenticated Content</div>
        </AuthContent>,
      );

      expect(screen.getByTestId('loading')).toBeInTheDocument();
      expect(screen.queryByTestId('content')).not.toBeInTheDocument();
      expect(screen.queryByTestId('fallback')).not.toBeInTheDocument();
    });

    it('renders nothing when loading and no skeleton provided', () => {
      mockLoadingAuth();

      render(
        <AuthContent>
          <div data-testid={'content'}>Authenticated Content</div>
        </AuthContent>,
      );

      expect(screen.queryByTestId('content')).not.toBeInTheDocument();
    });
  });

  describe('signed in state', () => {
    it('renders children when user is signed in', () => {
      mockSignedInUser();

      render(
        <AuthContent>
          <div data-testid={'content'}>Authenticated Content</div>
        </AuthContent>,
      );

      expect(screen.getByTestId('content')).toBeInTheDocument();
      expect(screen.getByText('Authenticated Content')).toBeInTheDocument();
    });

    it('does not render fallback or skeleton when signed in', () => {
      mockSignedInUser();

      render(
        <AuthContent
          fallback={<div data-testid={'fallback'}>Sign In</div>}
          loadingSkeleton={<div data-testid={'loading'}>Loading...</div>}
        >
          <div data-testid={'content'}>Authenticated Content</div>
        </AuthContent>,
      );

      expect(screen.getByTestId('content')).toBeInTheDocument();
      expect(screen.queryByTestId('fallback')).not.toBeInTheDocument();
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    it('renders complex children when signed in', () => {
      mockSignedInUser();

      render(
        <AuthContent>
          <div>
            <h1>Dashboard</h1>
            <button>Action</button>
          </div>
        </AuthContent>,
      );

      expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
    });
  });

  describe('signed out state', () => {
    it('renders fallback when user is signed out', () => {
      mockSignedOutUser();

      render(
        <AuthContent fallback={<div data-testid={'fallback'}>Please Sign In</div>}>
          <div data-testid={'content'}>Authenticated Content</div>
        </AuthContent>,
      );

      expect(screen.getByTestId('fallback')).toBeInTheDocument();
      expect(screen.getByText('Please Sign In')).toBeInTheDocument();
      expect(screen.queryByTestId('content')).not.toBeInTheDocument();
    });

    it('does not render children or skeleton when signed out', () => {
      mockSignedOutUser();

      render(
        <AuthContent
          fallback={<div data-testid={'fallback'}>Please Sign In</div>}
          loadingSkeleton={<div data-testid={'loading'}>Loading...</div>}
        >
          <div data-testid={'content'}>Authenticated Content</div>
        </AuthContent>,
      );

      expect(screen.getByTestId('fallback')).toBeInTheDocument();
      expect(screen.queryByTestId('content')).not.toBeInTheDocument();
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    it('renders nothing when signed out and no fallback provided', () => {
      mockSignedOutUser();

      render(
        <AuthContent>
          <div data-testid={'content'}>Authenticated Content</div>
        </AuthContent>,
      );

      expect(screen.queryByTestId('content')).not.toBeInTheDocument();
    });

    it('renders complex fallback when signed out', () => {
      mockSignedOutUser();

      render(
        <AuthContent
          fallback={
            <div>
              <h2>Welcome</h2>
              <button>Sign In</button>
            </div>
          }
        >
          <div data-testid={'content'}>Authenticated Content</div>
        </AuthContent>,
      );

      expect(screen.getByRole('heading', { name: 'Welcome' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
      expect(screen.queryByTestId('content')).not.toBeInTheDocument();
    });
  });

  describe('fragment wrapper', () => {
    it('uses fragment wrapper that does not add semantic elements', () => {
      mockSignedInUser();

      render(
        <AuthContent>
          <div data-testid={'content'}>Content</div>
        </AuthContent>,
      );

      // Fragment wrapper should render content
      expect(screen.getByTestId('content')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('maintains proper DOM structure with multiple children', () => {
      mockSignedInUser();

      render(
        <AuthContent>
          <div data-testid={'first'}>First</div>
          <div data-testid={'second'}>Second</div>
        </AuthContent>,
      );

      expect(screen.getByTestId('first')).toBeInTheDocument();
      expect(screen.getByTestId('second')).toBeInTheDocument();
    });
  });

  describe('Clerk useAuth integration', () => {
    it('responds to changes in auth state from loading to signed in', () => {
      mockLoadingAuth();

      const { rerender } = render(
        <AuthContent loadingSkeleton={<div data-testid={'loading'}>Loading...</div>}>
          <div data-testid={'content'}>Authenticated Content</div>
        </AuthContent>,
      );

      expect(screen.getByTestId('loading')).toBeInTheDocument();

      // Simulate auth loading complete and user signed in
      mockSignedInUser();
      rerender(
        <AuthContent loadingSkeleton={<div data-testid={'loading'}>Loading...</div>}>
          <div data-testid={'content'}>Authenticated Content</div>
        </AuthContent>,
      );

      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('responds to changes from loading to signed out', () => {
      mockLoadingAuth();

      const { rerender } = render(
        <AuthContent
          fallback={<div data-testid={'fallback'}>Sign In</div>}
          loadingSkeleton={<div data-testid={'loading'}>Loading...</div>}
        >
          <div data-testid={'content'}>Authenticated Content</div>
        </AuthContent>,
      );

      expect(screen.getByTestId('loading')).toBeInTheDocument();

      // Simulate auth loading complete and user signed out
      mockSignedOutUser();
      rerender(
        <AuthContent
          fallback={<div data-testid={'fallback'}>Sign In</div>}
          loadingSkeleton={<div data-testid={'loading'}>Loading...</div>}
        >
          <div data-testid={'content'}>Authenticated Content</div>
        </AuthContent>,
      );

      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      expect(screen.getByTestId('fallback')).toBeInTheDocument();
    });

    it('uses isLoaded and isSignedIn from useAuth hook', () => {
      // This test verifies the component correctly reads from useAuth
      mockSignedInUser();

      render(
        <AuthContent>
          <div data-testid={'content'}>Content</div>
        </AuthContent>,
      );

      // If useAuth integration works, content should render
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });
  });
});
