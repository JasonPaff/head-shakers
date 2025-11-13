import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

import {
  bobbleheadPhotos,
  bobbleheads,
  collections,
  notificationSettings,
  tags,
  users,
  userSettings,
} from '@/lib/db/schema';

import { testDb } from './test-db.helpers';

// factory definitions
export const userFactory = Factory.define<typeof users.$inferInsert>(({ sequence }) => ({
  bio: faker.lorem.paragraph(),
  clerkId: `clerk_${faker.string.uuid()}`,
  displayName: faker.person.fullName(),
  email: faker.internet.email(),
  isVerified: faker.datatype.boolean({ probability: 0.3 }),
  location: faker.location.city(),
  username: `${faker.internet.username().toLowerCase()}_${sequence}`,
}));

export const collectionFactory = Factory.define<typeof collections.$inferInsert>(({ sequence }) => {
  const name = `${faker.word.adjective()} ${faker.word.noun()} Collection ${sequence}`;
  return {
    description: faker.lorem.paragraph(),
    isPublic: faker.datatype.boolean({ probability: 0.7 }),
    name,
    slug: `${name.toLowerCase().replace(/\s+/g, '-')}-${sequence}`,
    totalItems: 0,
    totalValue: '0.00',
    userId: faker.string.uuid(),
  };
});

export const bobbleheadFactory = Factory.define<typeof bobbleheads.$inferInsert>(({ sequence }) => {
  const name = `${faker.person.firstName()} ${faker.person.lastName()} Bobblehead`;
  return {
    acquisitionDate: faker.date.past({ years: 5 }),
    acquisitionMethod: faker.helpers.arrayElement(['purchase', 'gift', 'trade', 'found']),
    category: faker.helpers.arrayElement(['Sports', 'Movies', 'TV Shows', 'Comics', 'Gaming']),
    characterName: faker.person.fullName(),
    collectionId: faker.string.uuid(),
    currentCondition: faker.helpers.arrayElement(['mint', 'excellent', 'good', 'fair', 'poor']),
    customFields: [
      {
        edition: faker.airline.airline().name,
      },
      { rarity: faker.airline.airline().name },
      { serialNumber: faker.airline.airline().name },
    ] as const,
    description: faker.lorem.paragraph(),
    height: faker.number.float({ fractionDigits: 1, max: 12, min: 3 }),
    isFeatured: faker.datatype.boolean({ probability: 0.1 }),
    isPublic: faker.datatype.boolean({ probability: 0.8 }),
    manufacturer: faker.company.name(),
    material: faker.helpers.arrayElement(['Resin', 'Vinyl', 'Ceramic', 'Plastic', 'Polyresin']),
    name,
    purchaseLocation: faker.helpers.arrayElement([
      'eBay',
      'Amazon',
      'Local Store',
      'Comic Con',
      'Antique Shop',
    ]),
    purchasePrice: Number(faker.commerce.price({ max: 500, min: 5 })),
    series: faker.commerce.productName(),
    slug: `${name.toLowerCase().replace(/\s+/g, '-')}-${sequence}`,
    status: faker.helpers.arrayElement(['owned', 'for_trade', 'for_sale', 'sold', 'wishlist']),
    userId: faker.string.uuid(),
    weight: faker.number.float({ fractionDigits: 1, max: 5, min: 0.5 }),
    year: faker.date.past({ years: 30 }).getFullYear(),
  };
});

export const bobbleheadPhotoFactory = Factory.define<typeof bobbleheadPhotos.$inferInsert>(
  ({ sequence }) => ({
    altText: `Photo ${sequence} of ${faker.word.noun()} bobblehead`,
    bobbleheadId: faker.string.uuid(), // Will be overridden when used
    caption: faker.lorem.sentence(),
    fileSize: faker.number.int({ max: 2000000, min: 50000 }),
    height: 600,
    isPrimary: faker.datatype.boolean({ probability: 0.2 }),
    sortOrder: sequence,
    url: faker.image.url({ height: 600, width: 800 }),
    width: 800,
  }),
);

export const tagFactory = Factory.define<typeof tags.$inferInsert>(({ sequence }) => ({
  color: `#${Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, '0')}`,
  name: `${faker.word.noun()}_${sequence}`,
  usageCount: faker.number.int({ max: 100, min: 0 }),
  userId: faker.string.uuid(),
}));

export async function createBobblehead(
  collectionId?: string,
  overrides: Partial<typeof bobbleheads.$inferInsert> = {},
) {
  const { collection, user } =
    collectionId ?
      { collection: { id: collectionId }, user: { id: 'existing-user' } }
    : await createCollection();

  const bobbleheadData = bobbleheadFactory.build({
    collectionId: collection.id,
    userId: user.id,
    ...overrides,
  });

  const [bobblehead] = await testDb.insert(bobbleheads).values(bobbleheadData).returning();
  if (!bobblehead) throw new Error('Failed to create bobblehead');

  return { bobblehead, collection, user };
}

export async function createBobbleheadPhoto(
  bobbleheadId?: string,
  overrides: Partial<typeof bobbleheadPhotos.$inferInsert> = {},
) {
  const { bobblehead } = bobbleheadId ? { bobblehead: { id: bobbleheadId } } : await createBobblehead();

  const photoData = bobbleheadPhotoFactory.build({
    bobbleheadId: bobblehead.id,
    ...overrides,
  });

  const [photo] = await testDb.insert(bobbleheadPhotos).values(photoData).returning();
  if (!photo) throw new Error('Failed to create photo');

  return { bobblehead, photo };
}

export async function createCollection(
  userId?: string,
  overrides: Partial<typeof collections.$inferInsert> = {},
) {
  const user = userId ? { id: userId } : await createUser();

  const collectionData = collectionFactory.build({
    userId: user.id,
    ...overrides,
  });

  const [collection] = await testDb.insert(collections).values(collectionData).returning();
  if (!collection) throw new Error('Failed to create collection');

  return { collection, user };
}

export async function createTag(userId?: string, overrides: Partial<typeof tags.$inferInsert> = {}) {
  const user = userId ? { id: userId } : await createUser();

  const tagData = tagFactory.build({
    userId: user.id,
    ...overrides,
  });

  const [tag] = await testDb.insert(tags).values(tagData).returning();
  if (!tag) throw new Error('Failed to create tag');

  return { tag, user };
}

// convenience function for creating test datasets
export async function createTestDataSet() {
  const sportsUser = await createUser({ displayName: 'Sports Collector', username: 'collector1' });
  const movieUser = await createUser({ displayName: 'Movie Fan', username: 'collector2' });
  const comicUser = await createUser({ displayName: 'Comic Enthusiast', username: 'collector3' });

  const { collection: mlbCollection } = await createCollection(sportsUser.id, { name: 'MLB Hall of Fame' });
  const { collection: starWarsCollection } = await createCollection(movieUser.id, {
    name: 'Star Wars Universe',
  });
  const { collection: marvelCollection } = await createCollection(comicUser.id, { name: 'Marvel Heroes' });

  const { bobblehead: babeRuth } = await createBobblehead(mlbCollection.id, {
    category: 'Sports',
    characterName: 'Babe Ruth',
  });
  const { bobblehead: darthVader } = await createBobblehead(starWarsCollection.id, {
    category: 'Movies',
    characterName: 'Darth Vader',
  });
  const { bobblehead: spiderMan } = await createBobblehead(marvelCollection.id, {
    category: 'Comics',
    characterName: 'Spider-Man',
  });

  return {
    bobbleheads: [babeRuth, darthVader, spiderMan],
    collections: [mlbCollection, starWarsCollection, marvelCollection],
    users: [sportsUser, movieUser, comicUser],
  };
}

// database helpers that create and persist entities with relationships
export async function createUser(overrides: Partial<typeof users.$inferInsert> = {}) {
  const userData = userFactory.build(overrides);
  const [user] = await testDb.insert(users).values(userData).returning();

  if (!user) throw new Error('Failed to create user');

  // create associated settings
  await testDb.insert(userSettings).values({ userId: user.id });
  await testDb.insert(notificationSettings).values({ userId: user.id });

  return user;
}
