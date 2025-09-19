/**
 * Main export file for testid system
 * Provides unified interface for all testid functionality
 */

// Export generator functions
export {
  createFormFieldTestId,
  createTableCellTestId,
  createTestId,
  extractComponent,
  extractNamespace,
  generateFormFieldTestId,
  generateTableCellTestId,
  generateTestId,
  testIdBuilder,
  validateTestId,
} from './generator';

// Re-export commonly used functions with shorter names
export {
  generateFormFieldTestId as formFieldTestId,
  generateTableCellTestId as tableCellTestId,
  generateTestId as testId,
} from './generator';

// Export types
export type {
  ComponentTestId,
  ComponentTestIdProps,
  FormFieldTestIdPattern,
  TableCellTestIdPattern,
  TestIdBuilder,
  TestIdNamespace,
  TestIdPattern,
} from './types';