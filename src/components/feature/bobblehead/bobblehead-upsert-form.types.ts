import type { z } from 'zod';

import type { BobbleheadForEdit } from '@/lib/facades/bobbleheads/bobbleheads-dashboard.facade';
import type { CollectionSelectorRecord } from '@/lib/queries/collections/collections-dashboard.query';
import type {
  createBobbleheadWithPhotosSchema,
  customFieldsSchema,
  updateBobbleheadWithPhotosSchema,
} from '@/lib/validations/bobbleheads.validation';
import type { CloudinaryPhoto } from '@/lib/validations/photo-upload.validation';

/**
 * Re-export BobbleheadForEdit for convenience.
 * This type represents a bobblehead with tags for edit mode.
 */
export type { BobbleheadForEdit };

/**
 * Re-export CollectionSelectorRecord for form dropdown usage.
 * Minimal collection data: { id, name, slug }.
 */
export type { CollectionSelectorRecord };

/**
 * Union type representing form values for both create and update modes.
 * The form uses this to handle both cases with a single component.
 */
export type BobbleheadFormValues = CreateBobbleheadFormValues | UpdateBobbleheadFormValues;

/**
 * Bobblehead data shape required for populating the edit form.
 * Extends base bobblehead data with tags.
 * Photos are loaded separately for better UX.
 */
export type BobbleheadForUpsert = BobbleheadForEdit;

/**
 * Form input type for creating a new bobblehead.
 * Uses z.input to get pre-transform types for form fields.
 */
export type CreateBobbleheadFormValues = z.input<typeof createBobbleheadWithPhotosSchema>;

/**
 * Single custom field key-value pair.
 */
export type CustomFieldEntry = z.infer<typeof customFieldsSchema>;

/**
 * Array of custom field entries for the form.
 */
export type CustomFieldsArray = Array<CustomFieldEntry>;

/**
 * Photos array type for form state.
 * Uses CloudinaryPhoto for uploaded photos.
 */
export type FormPhotos = Array<CloudinaryPhoto>;

/**
 * Tag item shape for the tag field component.
 */
export interface TagItem {
  id: string;
  name: string;
}

/**
 * Form input type for updating an existing bobblehead.
 * Uses z.input to get pre-transform types for form fields.
 */
export type UpdateBobbleheadFormValues = z.input<typeof updateBobbleheadWithPhotosSchema>;
