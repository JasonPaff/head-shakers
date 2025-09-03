import { beforeAll, describe, expect, it } from 'vitest';

import type { InsertBobblehead, InsertBobbleheadPhoto } from '@/lib/validations/bobbleheads.validation';

import { DEFAULTS } from '@/lib/constants';
import { collections, users } from '@/lib/db/schema';
import { BobbleheadService } from '@/lib/services/bobbleheads.service';

import { withTestIsolation } from '../../../helpers/database.helpers';

// helper to create test photo data
const createMockPhotoData = (overrides: Partial<InsertBobbleheadPhoto> = {}): InsertBobbleheadPhoto => ({
  altText: 'Test photo',
  bobbleheadId: '',
  caption: 'A test photo',
  fileSize: 1024,
  height: 600,
  isPrimary: false,
  sortOrder: 0,
  url: 'https://cloudinary.com/test-photo.jpg',
  width: 800,
  ...overrides,
});

describe('BobbleheadService.createWithPhotosAsync - Basic Success Cases', () => {
  beforeAll(() => {
    const testDbUrl = process.env.DATABASE_URL_TEST;
    if (!testDbUrl) {
      console.warn('No test database URL configured, skipping database-dependent tests');
    }
  });

  describe('Should create bobblehead without photos', () => {
    it.skipIf(!process.env.DATABASE_URL_TEST)(
      'should successfully create bobblehead when photos array is empty',
      async () => {
        await withTestIsolation(async (db) => {
          const userResult = await db
            .insert(users)
            .values({
              clerkId: 'test_clerk_no_photos',
              displayName: 'Test User No Photos',
              email: 'nophotos@example.com',
              username: 'test_user_no_photos',
            })
            .returning();
          const user = userResult[0]!;

          const collectionResult = await db
            .insert(collections)
            .values({
              name: 'Test Collection No Photos',
              userId: user.id,
            })
            .returning();
          const collection = collectionResult[0]!;

          const bobbleheadData: InsertBobblehead = {
            collectionId: collection.id,
            currentCondition: DEFAULTS.BOBBLEHEAD.CONDITION,
            isFeatured: DEFAULTS.BOBBLEHEAD.IS_FEATURED,
            isPublic: DEFAULTS.BOBBLEHEAD.IS_PUBLIC,
            name: 'Bobblehead Without Photos',
            status: DEFAULTS.BOBBLEHEAD.STATUS,
          };

          const result = await BobbleheadService.createWithPhotosAsync(bobbleheadData, user.id, [], db);

          expect(result).toBeDefined();
          expect(result!.name).toBe('Bobblehead Without Photos');
          expect(result!.collectionId).toBe(collection.id);
          expect(result!.userId).toBe(user.id);

          expect(result!.currentCondition).toBe(DEFAULTS.BOBBLEHEAD.CONDITION);
          expect(result!.status).toBe(DEFAULTS.BOBBLEHEAD.STATUS);
          expect(result!.isPublic).toBe(DEFAULTS.BOBBLEHEAD.IS_PUBLIC);
          expect(result!.isFeatured).toBe(DEFAULTS.BOBBLEHEAD.IS_FEATURED);

          const photos = await BobbleheadService.getPhotosAsync(result!.id, db);
          expect(photos).toHaveLength(0);
        });
      },
    );

    it.skipIf(!process.env.DATABASE_URL_TEST)(
      'should create bobblehead with only required fields and no photos',
      async () => {
        await withTestIsolation(async (db) => {
          const userResult = await db
            .insert(users)
            .values({
              clerkId: 'test_clerk_minimal',
              displayName: 'Test User Minimal',
              email: 'minimal@example.com',
              username: 'test_user_minimal',
            })
            .returning();
          const user = userResult[0]!;

          const collectionResult = await db
            .insert(collections)
            .values({
              name: 'Test Collection Minimal',
              userId: user.id,
            })
            .returning();
          const collection = collectionResult[0]!;

          const bobbleheadData: InsertBobblehead = {
            collectionId: collection.id,
            currentCondition: DEFAULTS.BOBBLEHEAD.CONDITION,
            isFeatured: DEFAULTS.BOBBLEHEAD.IS_FEATURED,
            isPublic: DEFAULTS.BOBBLEHEAD.IS_PUBLIC,
            name: 'Minimal Bobblehead',
            status: DEFAULTS.BOBBLEHEAD.STATUS,
          };

          const result = await BobbleheadService.createWithPhotosAsync(bobbleheadData, user.id, [], db);

          expect(result).toBeDefined();
          expect(result!.name).toBe('Minimal Bobblehead');
          expect(result!.collectionId).toBe(collection.id);
          expect(result!.userId).toBe(user.id);

          expect(result!.currentCondition).toBe(DEFAULTS.BOBBLEHEAD.CONDITION);
          expect(result!.status).toBe(DEFAULTS.BOBBLEHEAD.STATUS);
          expect(result!.isPublic).toBe(DEFAULTS.BOBBLEHEAD.IS_PUBLIC);
          expect(result!.isFeatured).toBe(DEFAULTS.BOBBLEHEAD.IS_FEATURED);
          expect(result!.likeCount).toBe(DEFAULTS.BOBBLEHEAD.LIKE_COUNT);
          expect(result!.commentCount).toBe(DEFAULTS.BOBBLEHEAD.COMMENT_COUNT);
          expect(result!.viewCount).toBe(DEFAULTS.BOBBLEHEAD.VIEW_COUNT);
        });
      },
    );
  });

  describe('Should create bobblehead with single photo', () => {
    it.skipIf(!process.env.DATABASE_URL_TEST)(
      'should successfully create bobblehead with one photo',
      async () => {
        await withTestIsolation(async (db) => {
          const userResult = await db
            .insert(users)
            .values({
              clerkId: 'test_clerk_single_photo',
              displayName: 'Test User Single Photo',
              email: 'singlephoto@example.com',
              username: 'test_user_single_photo',
            })
            .returning();
          const user = userResult[0]!;

          const collectionResult = await db
            .insert(collections)
            .values({
              name: 'Test Collection Single Photo',
              userId: user.id,
            })
            .returning();
          const collection = collectionResult[0]!;

          const bobbleheadData: InsertBobblehead = {
            collectionId: collection.id,
            currentCondition: 'mint',
            isFeatured: false,
            isPublic: false,
            name: 'Bobblehead With Single Photo',
            status: 'owned',
          };

          const photoData = [
            createMockPhotoData({
              altText: 'Test Photo 1',
              caption: 'A test photo',
              isPrimary: true,
              sortOrder: 0,
              url: 'https://cloudinary.com/test-photo-1.jpg',
            }),
          ];

          const result = await BobbleheadService.createWithPhotosAsync(
            bobbleheadData,
            user.id,
            photoData,
            db,
          );

          expect(result).toBeDefined();
          expect(result!.name).toBe('Bobblehead With Single Photo');
          expect(result!.collectionId).toBe(collection.id);
          expect(result!.userId).toBe(user.id);

          // verify photo was created
          const photos = await BobbleheadService.getPhotosAsync(result!.id, db);
          expect(photos).toHaveLength(1);
          expect(photos[0]).toMatchObject({
            altText: 'Test Photo 1',
            bobbleheadId: result!.id,
            caption: 'A test photo',
            isPrimary: true,
            sortOrder: 0,
            url: 'https://cloudinary.com/test-photo-1.jpg',
          });
        });
      },
    );
  });

  describe('Should create bobblehead with multiple photos', () => {
    it.skipIf(!process.env.DATABASE_URL_TEST)(
      'should successfully create bobblehead with three photos',
      async () => {
        await withTestIsolation(async (db) => {
          const userResult = await db
            .insert(users)
            .values({
              clerkId: 'test_clerk_multiple_photos',
              displayName: 'Test User Multiple Photos',
              email: 'multiplephotos@example.com',
              username: 'test_user_multiple_photos',
            })
            .returning();
          const user = userResult[0]!;

          const collectionResult = await db
            .insert(collections)
            .values({
              name: 'Test Collection Multiple Photos',
              userId: user.id,
            })
            .returning();
          const collection = collectionResult[0]!;

          const bobbleheadData: InsertBobblehead = {
            collectionId: collection.id,
            currentCondition: 'mint',
            isFeatured: false,
            isPublic: false,
            name: 'Bobblehead With Multiple Photos',
            status: 'owned',
          };

          const photoData = [
            createMockPhotoData({
              altText: 'Photo 1',
              caption: 'First photo',
              isPrimary: true,
              sortOrder: 0,
              url: 'https://cloudinary.com/test-photo-1.jpg',
            }),
            createMockPhotoData({
              altText: 'Photo 2',
              caption: 'Second photo',
              isPrimary: false,
              sortOrder: 1,
              url: 'https://cloudinary.com/test-photo-2.jpg',
            }),
            createMockPhotoData({
              altText: 'Photo 3',
              caption: 'Third photo',
              isPrimary: false,
              sortOrder: 2,
              url: 'https://cloudinary.com/test-photo-3.jpg',
            }),
          ];

          const result = await BobbleheadService.createWithPhotosAsync(
            bobbleheadData,
            user.id,
            photoData,
            db,
          );

          expect(result).toBeDefined();
          expect(result!.name).toBe('Bobblehead With Multiple Photos');
          expect(result!.collectionId).toBe(collection.id);
          expect(result!.userId).toBe(user.id);

          const photos = await BobbleheadService.getPhotosAsync(result!.id, db);
          expect(photos).toHaveLength(3);

          const sortedPhotos = photos.sort((a, b) => a.sortOrder - b.sortOrder);

          expect(sortedPhotos[0]).toMatchObject({
            altText: 'Photo 1',
            bobbleheadId: result!.id,
            caption: 'First photo',
            isPrimary: true,
            sortOrder: 0,
            url: 'https://cloudinary.com/test-photo-1.jpg',
          });

          expect(sortedPhotos[1]).toMatchObject({
            altText: 'Photo 2',
            bobbleheadId: result!.id,
            caption: 'Second photo',
            isPrimary: false,
            sortOrder: 1,
            url: 'https://cloudinary.com/test-photo-2.jpg',
          });

          expect(sortedPhotos[2]).toMatchObject({
            altText: 'Photo 3',
            bobbleheadId: result!.id,
            caption: 'Third photo',
            isPrimary: false,
            sortOrder: 2,
            url: 'https://cloudinary.com/test-photo-3.jpg',
          });
        });
      },
    );
  });

  describe('Should create bobblehead with complete metadata', () => {
    it.skipIf(!process.env.DATABASE_URL_TEST)(
      'should successfully create bobblehead with complete bobblehead and photo metadata',
      async () => {
        await withTestIsolation(async (db) => {
          // Setup: Create user and collection
          const userResult = await db
            .insert(users)
            .values({
              clerkId: 'test_clerk_complete_metadata',
              displayName: 'Test User Complete Metadata',
              email: 'completemetadata@example.com',
              username: 'test_user_complete_metadata',
            })
            .returning();
          const user = userResult[0]!;

          const collectionResult = await db
            .insert(collections)
            .values({
              name: 'Test Collection Complete Metadata',
              userId: user.id,
            })
            .returning();
          const collection = collectionResult[0]!;

          const bobbleheadData: InsertBobblehead = {
            category: 'Sports',
            characterName: 'Mickey Mantle',
            collectionId: collection.id,
            currentCondition: 'excellent',
            description: 'A rare 1960s baseball player bobblehead in excellent condition',
            height: 7.5,
            isFeatured: true,
            isPublic: true,
            manufacturer: 'Hartland Plastics',
            material: 'Plastic',
            name: 'Vintage Baseball Bobblehead',
            status: 'owned',
            weight: 0.5,
            year: 1960,
          };

          const photoData = [
            createMockPhotoData({
              altText: 'Primary bobblehead photo with detailed description',
              caption: 'This is the primary view of the vintage baseball bobblehead from 1960',
              fileSize: 4096,
              height: 1536,
              isPrimary: true,
              sortOrder: 0,
              url: 'https://cloudinary.com/complete-photo-1.jpg',
              width: 2048,
            }),
            createMockPhotoData({
              altText: 'Side view of the bobblehead showing signature',
              caption: 'The signature on the base authenticates this as an original piece',
              fileSize: 3584,
              height: 1440,
              isPrimary: false,
              sortOrder: 5,
              url: 'https://cloudinary.com/complete-photo-2.jpg',
              width: 1920,
            }),
          ];

          const result = await BobbleheadService.createWithPhotosAsync(
            bobbleheadData,
            user.id,
            photoData,
            db,
          );

          expect(result).toBeDefined();
          expect(result).toMatchObject({
            category: 'Sports',
            characterName: 'Mickey Mantle',
            collectionId: collection.id,
            currentCondition: 'excellent',
            description: 'A rare 1960s baseball player bobblehead in excellent condition',
            height: 7.5, // Database stores as number
            isFeatured: true,
            isPublic: true,
            manufacturer: 'Hartland Plastics',
            material: 'Plastic',
            name: 'Vintage Baseball Bobblehead',
            status: 'owned',
            userId: user.id,
            weight: 0.5, // Database stores as number
            year: 1960, // Database stores as number
          });

          const photos = await BobbleheadService.getPhotosAsync(result!.id, db);
          expect(photos).toHaveLength(2);

          const sortedPhotos = photos.sort((a, b) => a.sortOrder - b.sortOrder);

          expect(sortedPhotos[0]).toMatchObject({
            altText: 'Primary bobblehead photo with detailed description',
            bobbleheadId: result!.id,
            caption: 'This is the primary view of the vintage baseball bobblehead from 1960',
            fileSize: 4096,
            height: 1536,
            isPrimary: true,
            sortOrder: 0,
            url: 'https://cloudinary.com/complete-photo-1.jpg',
            width: 2048,
          });

          expect(sortedPhotos[1]).toMatchObject({
            altText: 'Side view of the bobblehead showing signature',
            bobbleheadId: result!.id,
            caption: 'The signature on the base authenticates this as an original piece',
            fileSize: 3584,
            height: 1440,
            isPrimary: false,
            sortOrder: 5,
            url: 'https://cloudinary.com/complete-photo-2.jpg',
            width: 1920,
          });
        });
      },
    );
  });
});
