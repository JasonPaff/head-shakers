'use client';

import * as Sentry from '@sentry/nextjs';

import { SENTRY_BREADCRUMB_CATEGORIES, SENTRY_LEVELS } from '@/lib/constants';

type BreadcrumbData = Record<string, unknown>;
type BreadcrumbLevel = keyof typeof SENTRY_LEVELS;

/**
 * Track business logic outcomes (action success/failure, state changes)
 * Default level is INFO, use ERROR for failures
 */
export function trackBusinessLogic(message: string, data: BreadcrumbData, level: BreadcrumbLevel = 'INFO') {
  Sentry.addBreadcrumb({
    category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
    data,
    level: SENTRY_LEVELS[level],
    message,
  });
}

/**
 * Track dialog/modal interactions (open, close, confirm, cancel)
 */
export function trackDialog(
  dialogName: string,
  action: 'cancelled' | 'closed' | 'confirmed' | 'opened',
  data?: BreadcrumbData,
) {
  Sentry.addBreadcrumb({
    category: SENTRY_BREADCRUMB_CATEGORIES.USER_INTERACTION,
    data: { action, dialog: dialogName, ...data },
    level: SENTRY_LEVELS.INFO,
    message: `Dialog ${dialogName} ${action}`,
  });
}

/**
 * Track form submissions
 */
export function trackFormSubmit(formName: string, component: string, data?: BreadcrumbData) {
  Sentry.addBreadcrumb({
    category: SENTRY_BREADCRUMB_CATEGORIES.USER_INTERACTION,
    data: { component, formName, ...data },
    level: SENTRY_LEVELS.INFO,
    message: `Form ${formName} submitted`,
  });
}

/**
 * Track navigation events (route changes, tab switches, page loads)
 */
export function trackNavigation(message: string, data: BreadcrumbData) {
  Sentry.addBreadcrumb({
    category: SENTRY_BREADCRUMB_CATEGORIES.NAVIGATION,
    data,
    level: SENTRY_LEVELS.INFO,
    message,
  });
}

/**
 * Track server action execution results
 * Automatically called by useServerAction when breadcrumbContext is provided
 */
export function trackServerAction(
  actionName: string,
  result: 'error' | 'started' | 'success',
  component: string,
  data?: BreadcrumbData,
) {
  const level: BreadcrumbLevel = result === 'error' ? 'ERROR' : 'INFO';

  Sentry.addBreadcrumb({
    category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
    data: { action: actionName, component, result, ...data },
    level: SENTRY_LEVELS[level],
    message: `Server action ${actionName} ${result}`,
  });
}

/**
 * Track user interactions (button clicks, form submissions, menu selections)
 * Use for meaningful user decisions, not every keystroke
 */
export function trackUserAction(message: string, data: BreadcrumbData) {
  Sentry.addBreadcrumb({
    category: SENTRY_BREADCRUMB_CATEGORIES.USER_INTERACTION,
    data,
    level: SENTRY_LEVELS.INFO,
    message,
  });
}

/**
 * Track validation events (form validation, input validation)
 */
export function trackValidation(message: string, data: BreadcrumbData, level: BreadcrumbLevel = 'INFO') {
  Sentry.addBreadcrumb({
    category: SENTRY_BREADCRUMB_CATEGORIES.VALIDATION,
    data,
    level: SENTRY_LEVELS[level],
    message,
  });
}
