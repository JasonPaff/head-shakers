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
