import { format, isValid } from 'date-fns';

/**
 * Safely converts a value to a Date object.
 * Handles Date objects, ISO strings, and timestamps from server components.
 */
export const toDate = (value: Date | number | string): Date => {
  if (value instanceof Date) return value;
  return new Date(value);
};

/**
 * Formats a date as "Jan 10, 2025"
 * Used for: collection headers, featured content, reports, profile pages
 */
export const formatShortDate = (value: Date | null | string | undefined): null | string => {
  if (value === null || value === undefined) return null;
  const date = toDate(value);
  if (!isValid(date)) return null;
  return format(date, 'MMM d, yyyy');
};

/**
 * Formats a date with time as "Jan 10, 2025 at 2:30 PM"
 * Used for: report detail dialogs, timestamps
 */
export const formatDateTime = (value: Date | null | string | undefined): null | string => {
  if (value === null || value === undefined) return null;
  const date = toDate(value);
  if (!isValid(date)) return null;
  return format(date, "MMM d, yyyy 'at' h:mm a");
};

/**
 * Formats just the date portion as "1/10/2025"
 * Used for: tables, simple date displays
 */
export const formatDateOnly = (value: Date | null | string | undefined): null | string => {
  if (value === null || value === undefined) return null;
  const date = toDate(value);
  if (!isValid(date)) return null;
  return format(date, 'M/d/yyyy');
};

/**
 * Formats just the time portion as "2:30 PM"
 * Used for: tables, time displays
 */
export const formatTimeOnly = (value: Date | null | string | undefined): null | string => {
  if (value === null || value === undefined) return null;
  const date = toDate(value);
  if (!isValid(date)) return null;
  return format(date, 'h:mm a');
};

/**
 * Formats a date as "Nov 28" (month and day only, no year)
 * Used for: comment timestamps, recent activity
 */
export const formatMonthDay = (value: Date | null | string | undefined): null | string => {
  if (value === null || value === undefined) return null;
  const date = toDate(value);
  if (!isValid(date)) return null;
  return format(date, 'MMM d');
};

/**
 * Formats a date as "January 10, 2025" (full month name)
 * Used for: profile pages, member since dates
 */
export const formatLongDate = (value: Date | null | string | undefined): null | string => {
  if (value === null || value === undefined) return null;
  const date = toDate(value);
  if (!isValid(date)) return null;
  return format(date, 'MMMM d, yyyy');
};
