import * as ClerkNextjs from '@clerk/nextjs';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { LikeTargetType } from '@/lib/constants';

// Mock the useOptimisticServerAction hook
vi.mock('@/hooks/use-optimistic-server-action', () => ({
  useOptimisticServerAction: vi.fn(),
}));

// Mock the toggleLikeAction
vi.mock('@/lib/actions/social/social.actions', () => ({
  toggleLikeAction: vi.fn(),
}));

import { useLike } from '@/hooks/use-like';
import { useOptimisticServerAction } from '@/hooks/use-optimistic-server-action';

type LikeState = {
  isLiked: boolean;
  likeCount: number;
  likeId: null | string;
};

type UseAuthReturn = ReturnType<typeof ClerkNextjs.useAuth>;

// Helper functions to mock different auth states
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

describe('useLike', () => {
  const defaultOptions = {
    initialLikeCount: 10,
    isInitiallyLiked: false,
    targetId: 'test-target-id',
    targetType: 'collection' as LikeTargetType,
  };

  // Shared optimistic state object that can be mutated
  let optimisticState: LikeState;

  beforeEach(() => {
    // Reset optimistic state
    optimisticState = {
      isLiked: false,
      likeCount: 10,
      likeId: null,
    };

    vi.clearAllMocks();
    mockSignedInUser();

    // Default mock implementation for useOptimisticServerAction
    vi.mocked(useOptimisticServerAction).mockReturnValue({
      execute: vi.fn(),
      executeAsync: vi.fn(),
      hasErrored: false,
      hasNavigated: false,
      hasSucceeded: false,
      input: undefined,
      isExecuting: false,
      isIdle: true,
      isPending: false,
      isTransitioning: false,
      optimisticState,
      reset: vi.fn(),
      result: {},
      status: 'idle',
    });
  });

  describe('initialization', () => {
    it('should initialize with provided like count and isLiked state', () => {
      const { result } = renderHook(() => useLike(defaultOptions));

      expect(result.current.likeCount).toBe(10);
      expect(result.current.isLiked).toBe(false);
      expect(result.current.isSignedIn).toBe(true);
    });

    it('should initialize with liked state when isInitiallyLiked is true', () => {
      optimisticState.isLiked = true;

      const { result } = renderHook(() =>
        useLike({
          ...defaultOptions,
          isInitiallyLiked: true,
        }),
      );

      expect(result.current.isLiked).toBe(true);
      expect(result.current.likeCount).toBe(10);
    });
  });

  describe('toggleLike', () => {
    it('should toggle like state optimistically when toggleLike is called', () => {
      const mockExecute = vi.fn(() => {
        // Simulate optimistic update
        const currentState = {
          isLiked: optimisticState.isLiked,
          likeCount: optimisticState.likeCount,
          likeId: optimisticState.likeId,
        };
        const isNewLiked = !currentState.isLiked;
        const newLikeCount =
          isNewLiked ? currentState.likeCount + 1 : Math.max(0, currentState.likeCount - 1);

        optimisticState.isLiked = isNewLiked;
        optimisticState.likeCount = newLikeCount;
      });

      vi.mocked(useOptimisticServerAction).mockReturnValue({
        execute: mockExecute,
        executeAsync: vi.fn(),
        hasErrored: false,
        hasNavigated: false,
        hasSucceeded: false,
        input: undefined,
        isExecuting: false,
        isIdle: true,
        isPending: false,
        isTransitioning: false,
        optimisticState,
        reset: vi.fn(),
        result: {},
        status: 'idle',
      });

      const { rerender, result } = renderHook(() => useLike(defaultOptions));

      expect(result.current.isLiked).toBe(false);
      expect(result.current.likeCount).toBe(10);

      result.current.toggleLike();

      // Force re-render to pick up optimistic state changes
      rerender();

      expect(result.current.isLiked).toBe(true);
      expect(result.current.likeCount).toBe(11);
      expect(mockExecute).toHaveBeenCalledWith({
        targetId: 'test-target-id',
        targetType: 'collection',
      });
    });

    it('should not toggle like when user is not signed in', () => {
      mockSignedOutUser();

      const mockExecute = vi.fn();

      vi.mocked(useOptimisticServerAction).mockReturnValue({
        execute: mockExecute,
        executeAsync: vi.fn(),
        hasErrored: false,
        hasNavigated: false,
        hasSucceeded: false,
        input: undefined,
        isExecuting: false,
        isIdle: true,
        isPending: false,
        isTransitioning: false,
        optimisticState,
        reset: vi.fn(),
        result: {},
        status: 'idle',
      });

      const { result } = renderHook(() => useLike(defaultOptions));

      expect(result.current.isSignedIn).toBe(false);

      result.current.toggleLike();

      expect(mockExecute).not.toHaveBeenCalled();
      expect(result.current.isLiked).toBe(false);
      expect(result.current.likeCount).toBe(10);
    });

    it('should call onLikeChange callback with new values on toggle', () => {
      const onLikeChange = vi.fn();

      const mockExecute = vi.fn(() => {
        // Simulate optimistic update
        const currentState = {
          isLiked: optimisticState.isLiked,
          likeCount: optimisticState.likeCount,
          likeId: optimisticState.likeId,
        };
        const isNewLiked = !currentState.isLiked;
        const newLikeCount =
          isNewLiked ? currentState.likeCount + 1 : Math.max(0, currentState.likeCount - 1);

        optimisticState.isLiked = isNewLiked;
        optimisticState.likeCount = newLikeCount;
      });

      vi.mocked(useOptimisticServerAction).mockReturnValue({
        execute: mockExecute,
        executeAsync: vi.fn(),
        hasErrored: false,
        hasNavigated: false,
        hasSucceeded: false,
        input: undefined,
        isExecuting: false,
        isIdle: true,
        isPending: false,
        isTransitioning: false,
        optimisticState,
        reset: vi.fn(),
        result: {},
        status: 'idle',
      });

      const { result } = renderHook(() =>
        useLike({
          ...defaultOptions,
          onLikeChange,
        }),
      );

      result.current.toggleLike();

      expect(onLikeChange).toHaveBeenCalledWith(true, 11);
      expect(onLikeChange).toHaveBeenCalledTimes(1);
    });

    it('should not toggle like when isPending is true', () => {
      const mockExecute = vi.fn();

      vi.mocked(useOptimisticServerAction).mockReturnValue({
        execute: mockExecute,
        executeAsync: vi.fn(),
        hasErrored: false,
        hasNavigated: false,
        hasSucceeded: false,
        input: undefined,
        isExecuting: true,
        isIdle: false,
        isPending: true,
        isTransitioning: false,
        optimisticState,
        reset: vi.fn(),
        result: {},
        status: 'executing',
      });

      const { result } = renderHook(() => useLike(defaultOptions));

      result.current.toggleLike();

      expect(mockExecute).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle unliking when count is already zero', () => {
      optimisticState.isLiked = true;
      optimisticState.likeCount = 0;

      const mockExecute = vi.fn(() => {
        const currentState = {
          isLiked: optimisticState.isLiked,
          likeCount: optimisticState.likeCount,
          likeId: optimisticState.likeId,
        };
        const isNewLiked = !currentState.isLiked;
        const newLikeCount =
          isNewLiked ? currentState.likeCount + 1 : Math.max(0, currentState.likeCount - 1);

        optimisticState.isLiked = isNewLiked;
        optimisticState.likeCount = newLikeCount;
      });

      vi.mocked(useOptimisticServerAction).mockReturnValue({
        execute: mockExecute,
        executeAsync: vi.fn(),
        hasErrored: false,
        hasNavigated: false,
        hasSucceeded: false,
        input: undefined,
        isExecuting: false,
        isIdle: true,
        isPending: false,
        isTransitioning: false,
        optimisticState,
        reset: vi.fn(),
        result: {},
        status: 'idle',
      });

      const { rerender, result } = renderHook(() =>
        useLike({
          ...defaultOptions,
          initialLikeCount: 0,
          isInitiallyLiked: true,
        }),
      );

      result.current.toggleLike();

      rerender();

      // Should not go below zero
      expect(result.current.likeCount).toBe(0);
      expect(result.current.isLiked).toBe(false);
    });
  });
});
