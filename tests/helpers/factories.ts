import { faker } from '@faker-js/faker';

import type { InsertBobblehead, InsertBobbleheadPhoto } from '@/lib/validations/bobbleheads.validation';
import type { InsertCollection } from '@/lib/validations/collections.validation';
import type { InsertTag } from '@/lib/validations/tags.validation';
import type { InsertUser } from '@/lib/validations/users.validation';

import {
  bobbleheadPhotos,
  bobbleheads,
  collections,
  notificationSettings,
  tags,
  users,
  userSettings,
} from '@/lib/db/schema';

import { testDb } from './test-db';

export class TestDataFactory {
  static async createBobblehead(collectionId?: string, overrides: Partial<InsertBobblehead> = {}) {
    const { collection, user } =
      collectionId ?
        { collection: { id: collectionId }, user: { id: 'existing-user' } }
      : await this.createCollection();

    const bobbleheadData = {
      acquisitionDate: faker.date.past({ years: 5 }),
      acquisitionMethod: faker.helpers.arrayElement(['purchase', 'gift', 'trade', 'found']),
      category: faker.helpers.arrayElement(['Sports', 'Movies', 'TV Shows', 'Comics', 'Gaming']),
      characterName: faker.person.fullName(),
      collectionId: collection?.id,
      currentCondition: faker.helpers.arrayElement(['mint', 'excellent', 'good', 'fair', 'poor']),
      customFields: {
        edition: faker.helpers.arrayElement(['standard', 'limited', 'special', 'exclusive']),
        rarity: faker.helpers.arrayElement(['common', 'uncommon', 'rare', 'legendary']),
        serialNumber: faker.datatype.boolean() ? faker.number.int({ max: 10000, min: 1 }) : null,
      },
      description: faker.lorem.paragraph(),
      height: faker.number.float({ fractionDigits: 1, max: 12, min: 3 }).toString(),
      isFeatured: faker.datatype.boolean({ probability: 0.1 }),
      isPublic: faker.datatype.boolean({ probability: 0.8 }),
      manufacturer: faker.company.name(),
      material: faker.helpers.arrayElement(['Resin', 'Vinyl', 'Ceramic', 'Plastic', 'Polyresin']),
      name: `${faker.person.firstName()} ${faker.person.lastName()} Bobblehead`,
      purchaseLocation: faker.helpers.arrayElement([
        'eBay',
        'Amazon',
        'Local Store',
        'Comic Con',
        'Antique Shop',
      ]),
      purchasePrice: faker.commerce.price({ max: 500, min: 5 }),
      series: faker.commerce.productName(),
      status: faker.helpers.arrayElement(['owned', 'for_trade', 'for_sale', 'sold', 'wishlist']),
      userId: user?.id,
      weight: faker.number.float({ fractionDigits: 1, max: 5, min: 0.5 }).toString(),
      year: faker.date.past({ years: 30 }).getFullYear(),
      ...overrides,
    };

    // @ts-expect-error ignoring type issue with partial insert
    const [bobblehead] = await testDb.insert(bobbleheads).values(bobbleheadData).returning();
    return { bobblehead, collection, user };
  }

  static async createBobbleheadPhoto(bobbleheadId?: string, overrides: Partial<InsertBobbleheadPhoto> = {}) {
    const { bobblehead } =
      bobbleheadId ? { bobblehead: { id: bobbleheadId } } : await this.createBobblehead();

    const photoData = {
      altText: `Photo of ${faker.word.noun()} bobblehead`,
      bobbleheadId: bobblehead?.id,
      caption: faker.lorem.sentence(),
      fileSize: faker.number.int({ max: 2000000, min: 50000 }),
      height: 600,
      isPrimary: faker.datatype.boolean({ probability: 0.2 }),
      sortOrder: faker.number.int({ max: 10, min: 0 }),
      url: faker.image.url({ height: 600, width: 800 }),
      width: 800,
      ...overrides,
    };

    // @ts-expect-error ignoring type issue with partial insert
    const [photo] = await testDb.insert(bobbleheadPhotos).values(photoData).returning();
    return { bobblehead, photo };
  }

  static async createCollection(userId?: string, overrides: Partial<InsertCollection> = {}) {
    const user = userId ? { id: userId } : await this.createUser();

    const collectionData = {
      description: faker.lorem.paragraph(),
      isPublic: faker.datatype.boolean({ probability: 0.7 }),
      name: `${faker.word.adjective()} ${faker.word.noun()} Collection`,
      totalItems: 0,
      totalValue: '0.00',
      userId: user?.id,
      ...overrides,
    };

    // @ts-expect-error ignoring type issue with partial insert
    const [collection] = await testDb.insert(collections).values(collectionData).returning();
    return { collection, user };
  }

  static async createTag(userId?: string, overrides: Partial<InsertTag> = {}) {
    const user = userId ? { id: userId } : await this.createUser();

    const tagData = {
      color: faker.color.human(),
      name: faker.word.noun(),
      usageCount: faker.number.int({ max: 100, min: 0 }),
      userId: user?.id,
      ...overrides,
    };

    // @ts-expect-error ignoring type issue with partial insert
    const [tag] = await testDb.insert(tags).values(tagData).returning();
    return { tag, user };
  }

  // bulk creation methods
  static async createTestDataSet() {
    const users = await Promise.all([
      this.createUser({ displayName: 'Sports Collector', username: 'collector1' }),
      this.createUser({ displayName: 'Movie Fan', username: 'collector2' }),
      this.createUser({ displayName: 'Comic Enthusiast', username: 'collector3' }),
    ]);

    const collections = await Promise.all([
      this.createCollection(users[0]?.id, { name: 'MLB Hall of Fame' }),
      this.createCollection(users[1]?.id, { name: 'Star Wars Universe' }),
      this.createCollection(users[2]?.id, { name: 'Marvel Heroes' }),
    ]);

    const bobbleheads = await Promise.all([
      this.createBobblehead(collections[0]?.collection?.id, {
        category: 'Sports',
        characterName: 'Babe Ruth',
      }),
      this.createBobblehead(collections[1]?.collection?.id, {
        category: 'Movies',
        characterName: 'Darth Vader',
      }),
      this.createBobblehead(collections[2]?.collection?.id, {
        category: 'Comics',
        characterName: 'Spider-Man',
      }),
    ]);

    return { bobbleheads, collections, users };
  }

  static async createUser(overrides: Partial<InsertUser> = {}) {
    const userData = {
      bio: faker.lorem.paragraph(),
      clerkId: `clerk_${faker.string.uuid()}`,
      displayName: faker.person.fullName(),
      email: faker.internet.email(),
      isVerified: faker.datatype.boolean({ probability: 0.3 }),
      location: faker.location.city(),
      username: faker.internet.username().toLowerCase(),
      ...overrides,
    };

    const [user] = await testDb.insert(users).values(userData).returning();

    // create associated settings
    await testDb.insert(userSettings).values({ userId: user!.id });
    await testDb.insert(notificationSettings).values({ userId: user!.id });

    return user;
  }
}
