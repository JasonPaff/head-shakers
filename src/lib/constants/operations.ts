/**
 * operation names used in error handling and logging throughout the application
 * centralized for consistency and maintainability
 */
export const OPERATIONS = {
  BOBBLEHEADS: {
    CREATE: 'create_bobblehead',
    CREATE_WITH_PHOTOS: 'create_bobblehead_with_photos',
    DELETE: 'delete_bobblehead',
    DELETE_PHOTO: 'delete_bobblehead_photo',
    REORDER_PHOTOS: 'reorder_bobblehead_photos',
    UPDATE: 'update_bobblehead',
    UPLOAD_PHOTO: 'upload_bobblehead_photo',
  },
  COLLECTIONS: {
    CREATE: 'create_collection',
    DELETE: 'delete_collection',
    GET_BY_USER: 'get_collections_by_user',
    UPDATE: 'update_collection',
  },
  FEATURED_CONTENT: {
    CREATE: 'create_featured_content',
    DELETE: 'delete_featured_content',
    GET_BY_ID: 'get_featured_content_by_id',
    TOGGLE_ACTIVE: 'toggle_featured_content_active',
    TOGGLE_STATUS: 'toggle_featured_content_status',
    UPDATE: 'update_featured_content',
  },
  SEARCH: {
    BOBBLEHEADS: 'search_bobbleheads',
    COLLECTIONS: 'search_collections',
    USERS: 'search_users',
  },
  SUBCOLLECTIONS: {
    CREATE: 'create_subcollection',
    CREATE_ALT: 'create_sub_collection',
    DELETE: 'delete_subcollection',
    GET: 'get_sub_collections',
    UPDATE: 'update_subcollection',
  },
  TAGS: {
    ADD: 'add_tag',
    CREATE: 'create_tag',
    DELETE: 'delete_tag',
    REMOVE: 'remove_tag',
  },
  USERS: {
    DELETE_ACCOUNT: 'delete_user_account',
    UPDATE_PROFILE: 'update_user_profile',
    UPDATE_SETTINGS: 'update_user_settings',
  },
} as const;

export type Operation =
  (typeof OPERATIONS)[keyof typeof OPERATIONS][keyof (typeof OPERATIONS)[keyof typeof OPERATIONS]];

export const getOperationName = <T extends keyof typeof OPERATIONS>(
  category: T,
  operation: keyof (typeof OPERATIONS)[T],
): string => {
  return OPERATIONS[category][operation] as string;
};
