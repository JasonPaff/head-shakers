import type { RefObject } from 'react';

/**
 * Props for field components that support focus management
 */
export interface FieldFocusProps {
  /**
   * Optional ref to the focusable element for focus management
   */
  focusRef?: RefObject<FocusableElement>;
}

/**
 * Represents an element that can receive focus
 */
export type FocusableElement = HTMLButtonElement | HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

/**
 * Focus management context value
 */
export interface FocusManagementContext {
  /** Focus the first field with an error */
  focusFirstError: () => void;

  /** Current focus management options */
  options: FocusManagementOptions;

  /** Register a field for focus management */
  registerField: (registration: FocusRegistration) => void;

  /** Unregister a field from focus management */
  unregisterField: (fieldName: string) => void;
}

/**
 * Configuration options for focus management
 */
export interface FocusManagementOptions {
  /**
   * Delay in milliseconds before focusing the first errored field
   * @default 100
   */
  focusDelay?: number;

  /**
   * Whether to enable automatic focus management on form submission errors
   * @default true
   */
  isEnabled?: boolean;

  /**
   * Whether to scroll the focused element into view
   * @default true
   */
  shouldScrollIntoView?: boolean;
}

/**
 * Registration data for a field that can receive focus
 */
export interface FocusRegistration {
  /** The DOM order index for proper focus sequence */
  domOrder: number;

  /** Reference to the focusable element */
  elementRef: RefObject<FocusableElement>;

  /** The field name as used in the form */
  fieldName: string;
}