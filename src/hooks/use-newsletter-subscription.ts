'use client';

import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { useOptimisticServerAction } from '@/hooks/use-optimistic-server-action';
import {
  subscribeToNewsletterAction,
  unsubscribeFromNewsletterAction,
} from '@/lib/actions/newsletter/newsletter.actions';

type SubscriptionState = {
  email: null | string;
  isSubscribed: boolean;
};

interface UseNewsletterSubscriptionOptions {
  /** Initial subscription status from server */
  isInitiallySubscribed: boolean;
  /** User's email if authenticated and subscribed */
  userEmail: null | string;
}

/**
 * Hook for managing newsletter subscription with optimistic updates.
 *
 * Uses useOptimisticServerAction for both subscribe and unsubscribe operations,
 * providing instant UI feedback with automatic rollback on errors.
 *
 * @example
 * const { isSubscribed, email, subscribe, unsubscribe, isPending } = useNewsletterSubscription({
 *   isInitiallySubscribed: true,
 *   userEmail: 'user@example.com',
 * });
 *
 * // UI renders from optimistic state
 * {isSubscribed ? <UnsubscribeView /> : <SubscribeForm onSubmit={subscribe} />}
 */
export const useNewsletterSubscription = ({
  isInitiallySubscribed,
  userEmail,
}: UseNewsletterSubscriptionOptions) => {
  // Persisted state - the "confirmed" server state that optimistic updates derive from
  const [persistedState, setPersistedState] = useState<SubscriptionState>({
    email: userEmail,
    isSubscribed: isInitiallySubscribed,
  });

  // The subscribe action with optimistic updates
  const {
    execute: executeSubscribe,
    isPending: isSubscribing,
    optimisticState: subscribeOptimisticState,
  } = useOptimisticServerAction(subscribeToNewsletterAction, {
    breadcrumbContext: {
      action: 'newsletter-subscribe',
      component: 'use-newsletter-subscription',
    },
    currentState: persistedState,
    onAfterSuccess: (_, newState) => {
      // Persist the confirmed state so future optimistic updates use it as baseline
      setPersistedState(newState);
      toast.success("Thanks for subscribing! You'll receive our latest updates.");
    },
    onUpdate: (_, input: { email: string }): SubscriptionState => ({
      email: input.email,
      isSubscribed: true,
    }),
  });

  // Unsubscribe action with optimistic updates
  const {
    execute: executeUnsubscribe,
    isPending: isUnsubscribing,
    optimisticState: unsubscribeOptimisticState,
  } = useOptimisticServerAction(unsubscribeFromNewsletterAction, {
    breadcrumbContext: {
      action: 'newsletter-unsubscribe',
      component: 'use-newsletter-subscription',
    },
    currentState: persistedState,
    onAfterSuccess: (_, newState) => {
      // Persist the confirmed state
      setPersistedState(newState);
      toast.success('You have been unsubscribed from the newsletter.');
    },
    onUpdate: (): SubscriptionState => ({
      email: null,
      isSubscribed: false,
    }),
  });

  // Determine current state based on which operation is active
  // Only one can be pending at a time, so we check in order
  const currentState = useMemo(() => {
    if (isSubscribing) return subscribeOptimisticState;
    if (isUnsubscribing) return unsubscribeOptimisticState;
    return persistedState;
  }, [isSubscribing, isUnsubscribing, subscribeOptimisticState, unsubscribeOptimisticState, persistedState]);

  const subscribe = useCallback(
    (email: string) => {
      if (isSubscribing || isUnsubscribing) return;
      executeSubscribe({ email });
    },
    [executeSubscribe, isSubscribing, isUnsubscribing],
  );

  const unsubscribe = useCallback(() => {
    if (isSubscribing || isUnsubscribing || !persistedState.email) return;
    executeUnsubscribe({ email: persistedState.email });
  }, [executeUnsubscribe, isSubscribing, isUnsubscribing, persistedState.email]);

  return useMemo(
    () => ({
      /** Current email (optimistic during transitions) */
      email: currentState.email,
      /** Whether any operation is in progress */
      isPending: isSubscribing || isUnsubscribing,
      /** Whether user is subscribed (optimistic during transitions) */
      isSubscribed: currentState.isSubscribed,
      /** Whether subscribe is in progress */
      isSubscribing,
      /** Whether unsubscribe is in progress */
      isUnsubscribing,
      /** Subscribe with the given email */
      subscribe,
      /** Unsubscribe the current email */
      unsubscribe,
    }),
    [currentState, isSubscribing, isUnsubscribing, subscribe, unsubscribe],
  );
};
