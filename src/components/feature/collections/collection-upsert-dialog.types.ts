import type { CollectionCreatedResult } from '@/components/feature/collections/hooks/use-collection-upsert-form';
import type { ComponentTestIdProps } from '@/lib/test-ids';

/**
 * Minimal collection shape required for edit mode.
 * Intentionally narrow to decouple from database types.
 */
export interface CollectionForUpsert {
  coverImageUrl?: null | string;
  description: null | string;
  id: string;
  isPublic: boolean;
  name: string;
}

export interface CollectionUpsertDialogProps extends ComponentTestIdProps {
  /**
   * When provided, dialog is in edit mode.
   * When undefined, dialog is in create mode.
   */
  collection?: CollectionForUpsert;
  isOpen: boolean;
  onClose: () => void;
  /**
   * Called on successful create (with new collection) or edit (with updated collection).
   */
  onSuccess?: (collection: CollectionCreatedResult) => void;
}
