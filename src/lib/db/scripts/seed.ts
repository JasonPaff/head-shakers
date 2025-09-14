import { sql } from 'drizzle-orm';
import 'dotenv/config';

import { db } from '@/lib/db';
import {
  bobbleheadPhotos,
  bobbleheads,
  bobbleheadTags,
  collections,
  comments,
  follows,
  likes,
  notificationSettings,
  subCollections,
  tags,
  users,
  userSettings,
} from '@/lib/db/schema';

const IS_RESET_DATABASE = process.env.RESET_DB === 'true';

const sampleUsers = [
  {
    bio: 'Collecting bobbleheads since 1995. Over 500 items in my collection!',
    clerkId: 'user_seed_admin',
    displayName: 'The Ultimate Collector',
    email: 'admin@headshakers.com',
    isVerified: true,
    location: 'San Francisco, CA',
    username: 'bobblehead_collector',
  },
  {
    bio: 'Love collecting sports bobbleheads, especially baseball and football players.',
    clerkId: 'user_seed_collector1',
    displayName: 'Sports Fan Mike',
    email: 'mike@example.com',
    isVerified: false,
    location: 'Chicago, IL',
    username: 'sports_fan_mike',
  },
  {
    bio: 'Movie, TV, and comic book bobbleheads are my passion!',
    clerkId: 'user_seed_collector2',
    displayName: 'Pop Culture Sarah',
    email: 'sarah@example.com',
    isVerified: true,
    location: 'Los Angeles, CA',
    username: 'pop_culture_sarah',
  },
  {
    bio: 'Specializing in rare and vintage bobbleheads from the 60s and 70s.',
    clerkId: 'user_seed_collector3',
    displayName: 'Vintage Hunter',
    email: 'hunter@example.com',
    isVerified: false,
    location: 'New York, NY',
    username: 'vintage_hunter',
  },
  {
    bio: 'College and professional team bobbleheads only!',
    clerkId: 'user_seed_collector4',
    displayName: 'Team Spirit',
    email: 'team@example.com',
    isVerified: false,
    location: 'Austin, TX',
    username: 'team_collector',
  },
];

// System tags organized by category as specified in the plan
const systemTags = [
  // Sports Category (Green - #10B981)
  { color: '#10B981', name: 'Baseball' },
  { color: '#10B981', name: 'Football' },
  { color: '#10B981', name: 'Basketball' },
  { color: '#10B981', name: 'Hockey' },
  { color: '#10B981', name: 'Soccer' },
  { color: '#10B981', name: 'Golf' },
  { color: '#10B981', name: 'Tennis' },
  { color: '#10B981', name: 'Boxing' },
  { color: '#10B981', name: 'NASCAR' },
  { color: '#10B981', name: 'Olympics' },

  // Era Category (Amber - #F59E0B)
  { color: '#F59E0B', name: 'Vintage' },
  { color: '#F59E0B', name: '1960s' },
  { color: '#F59E0B', name: '1970s' },
  { color: '#F59E0B', name: '1980s' },
  { color: '#F59E0B', name: '1990s' },
  { color: '#F59E0B', name: '2000s' },
  { color: '#F59E0B', name: '2010s' },
  { color: '#F59E0B', name: '2020s' },
  { color: '#F59E0B', name: 'Modern' },
  { color: '#F59E0B', name: 'Retro' },

  // Type Category (Blue - #3B82F6)
  { color: '#3B82F6', name: 'Player' },
  { color: '#3B82F6', name: 'Mascot' },
  { color: '#3B82F6', name: 'Coach' },
  { color: '#3B82F6', name: 'Legend' },
  { color: '#3B82F6', name: 'Hall of Fame' },
  { color: '#3B82F6', name: 'Rookie' },
  { color: '#3B82F6', name: 'All-Star' },
  { color: '#3B82F6', name: 'MVP' },
  { color: '#3B82F6', name: 'Championship' },

  // League Category (Red - #EF4444)
  { color: '#EF4444', name: 'MLB' },
  { color: '#EF4444', name: 'NFL' },
  { color: '#EF4444', name: 'NBA' },
  { color: '#EF4444', name: 'NHL' },
  { color: '#EF4444', name: 'MLS' },
  { color: '#EF4444', name: 'NCAA' },
  { color: '#EF4444', name: 'Minor League' },
  { color: '#EF4444', name: 'International' },

  // Special Category (Pink - #EC4899)
  { color: '#EC4899', name: 'Limited Edition' },
  { color: '#EC4899', name: 'Signed' },
  { color: '#EC4899', name: 'Game Day Giveaway' },
  { color: '#EC4899', name: 'Stadium Exclusive' },
  { color: '#EC4899', name: 'Commemorative' },
  { color: '#EC4899', name: 'Anniversary' },
  { color: '#EC4899', name: 'Promotional' },
  { color: '#EC4899', name: 'Bobblehead Night' },

  // Condition Category (Purple - #8B5CF6)
  { color: '#8B5CF6', name: 'Mint' },
  { color: '#8B5CF6', name: 'Near Mint' },
  { color: '#8B5CF6', name: 'Excellent' },
  { color: '#8B5CF6', name: 'Good' },
  { color: '#8B5CF6', name: 'Fair' },
  { color: '#8B5CF6', name: 'Restored' },
  { color: '#8B5CF6', name: 'Customized' },

  // Material Category (Gray - #6B7280)
  { color: '#6B7280', name: 'Ceramic' },
  { color: '#6B7280', name: 'Resin' },
  { color: '#6B7280', name: 'Plastic' },
  { color: '#6B7280', name: 'Wood' },
  { color: '#6B7280', name: 'Metal' },
  { color: '#6B7280', name: 'Composite' },

  // Size Category (Teal - #14B8A6)
  { color: '#14B8A6', name: 'Mini' },
  { color: '#14B8A6', name: 'Standard' },
  { color: '#14B8A6', name: 'Oversized' },
  { color: '#14B8A6', name: 'Life-Size' },
];

// Sample user tags for testing (these will have userId assigned)
const sampleUserTags = [
  { color: '#22C55E', name: 'My Favorites' },
  { color: '#F97316', name: 'Personal Collection' },
  { color: '#A855F7', name: 'Wish List' },
  { color: '#1E40AF', name: 'Star Wars' },
  { color: '#DC2626', name: 'Marvel' },
  { color: '#1E40AF', name: 'DC Comics' },
  { color: '#7C3AED', name: 'Anime' },
  { color: '#059669', name: 'Gaming' },
];

const sampleCollections = [
  {
    description: 'My collection of Hall of Fame baseball players bobbleheads.',
    isPublic: true,
    name: 'MLB Hall of Fame',
    totalItems: 0,
    totalValue: '0.00',
  },
  {
    description: 'Complete collection of Star Wars character bobbleheads.',
    isPublic: true,
    name: 'Star Wars Universe',
    totalItems: 0,
    totalValue: '0.00',
  },
  {
    description: 'Superhero bobbleheads from the Marvel universe.',
    isPublic: true,
    name: 'Marvel Heroes',
    totalItems: 0,
    totalValue: '0.00',
  },
  {
    description: 'Famous NFL quarterbacks throughout history.',
    isPublic: true,
    name: 'NFL Quarterbacks',
    totalItems: 0,
    totalValue: '0.00',
  },
  {
    description: 'Rare and vintage bobbleheads from the 1960s-1980s.',
    isPublic: false,
    name: 'Vintage Collection',
    totalItems: 0,
    totalValue: '0.00',
  },
  {
    description: 'Iconic movie characters in bobblehead form.',
    isPublic: true,
    name: 'Movie Characters',
    totalItems: 0,
    totalValue: '0.00',
  },
  {
    description: 'Basketball legends and current superstars.',
    isPublic: true,
    name: 'NBA Legends',
    totalItems: 0,
    totalValue: '0.00',
  },
  {
    description: 'Classic and modern Disney character bobbleheads.',
    isPublic: true,
    name: 'Disney Characters',
    totalItems: 0,
    totalValue: '0.00',
  },
];

const sampleBobbleheads = [
  {
    acquisitionMethod: 'purchase',
    category: 'Sports',
    characterName: 'Babe Ruth',
    currentCondition: 'excellent' as const,
    description: 'Classic Babe Ruth bobblehead in Yankees pinstripes.',
    height: 7.5,
    isFeatured: true,
    isPublic: true,
    manufacturer: 'Forever Collectibles',
    material: 'Resin',
    name: 'Babe Ruth Yankees',
    purchaseLocation: 'eBay',
    purchasePrice: 24.99,
    series: 'MLB Legends',
    status: 'owned' as const,
    year: 2020,
  },
  {
    acquisitionMethod: 'purchase',
    category: 'Movies',
    characterName: 'Darth Vader',
    currentCondition: 'mint' as const,
    description: 'Iconic Darth Vader bobblehead with lightsaber.',
    height: 6.0,
    isFeatured: true,
    isPublic: true,
    manufacturer: 'Funko',
    material: 'Vinyl',
    name: 'Darth Vader',
    purchaseLocation: 'Target',
    purchasePrice: 15.99,
    series: 'Star Wars',
    status: 'owned' as const,
    year: 2019,
  },
  {
    acquisitionMethod: 'purchase',
    category: 'Comic Books',
    characterName: 'Spider-Man',
    currentCondition: 'excellent' as const,
    description: 'Classic Spider-Man in red and blue suit.',
    height: 8.0,
    isFeatured: false,
    isPublic: true,
    manufacturer: 'Royal Bobbles',
    material: 'Polyresin',
    name: 'Spider-Man Classic',
    purchaseLocation: 'Comic Con',
    purchasePrice: 29.99,
    series: 'Marvel Heroes',
    status: 'owned' as const,
    year: 2021,
  },
  {
    acquisitionMethod: 'purchase',
    category: 'Sports',
    characterName: 'Tom Brady',
    currentCondition: 'good' as const,
    description: 'Tom Brady in New England Patriots uniform.',
    height: 8.0,
    isFeatured: false,
    isPublic: true,
    manufacturer: 'FOCO',
    material: 'Resin',
    name: 'Tom Brady Patriots',
    purchaseLocation: 'NFL Shop',
    purchasePrice: 34.99,
    series: 'NFL Stars',
    status: 'owned' as const,
    year: 2018,
  },
  {
    acquisitionMethod: 'purchase',
    category: 'Disney',
    characterName: 'Mickey Mouse',
    currentCondition: 'fair' as const,
    description: 'Rare vintage Mickey Mouse bobblehead from 1970s.',
    height: 5.5,
    isFeatured: false,
    isPublic: false,
    manufacturer: 'Unknown',
    material: 'Ceramic',
    name: 'Mickey Mouse Vintage',
    purchaseLocation: 'Antique Shop',
    purchasePrice: 85.0,
    series: 'Vintage Disney',
    status: 'owned' as const,
    year: 1975,
  },
  {
    acquisitionMethod: 'purchase',
    category: 'Movies',
    characterName: 'Luke Skywalker',
    currentCondition: 'excellent' as const,
    description: 'Luke Skywalker with lightsaber raised.',
    height: 6.0,
    isFeatured: false,
    isPublic: true,
    manufacturer: 'Funko',
    material: 'Vinyl',
    name: 'Luke Skywalker',
    purchaseLocation: 'GameStop',
    purchasePrice: 15.99,
    series: 'Star Wars',
    status: 'owned' as const,
    year: 2019,
  },
  {
    acquisitionMethod: 'purchase',
    category: 'Sports',
    characterName: 'LeBron James',
    currentCondition: 'mint' as const,
    description: 'LeBron James in Los Angeles Lakers jersey.',
    height: 8.0,
    isFeatured: true,
    isPublic: true,
    manufacturer: 'FOCO',
    material: 'Resin',
    name: 'LeBron James Lakers',
    purchaseLocation: 'NBA Store',
    purchasePrice: 39.99,
    series: 'NBA Superstars',
    status: 'owned' as const,
    year: 2020,
  },
  {
    acquisitionMethod: 'purchase',
    category: 'Comic Books',
    characterName: 'Wonder Woman',
    currentCondition: 'excellent' as const,
    description: 'Wonder Woman with lasso and shield.',
    height: 7.0,
    isFeatured: false,
    isPublic: true,
    manufacturer: 'Royal Bobbles',
    material: 'Polyresin',
    name: 'Wonder Woman',
    purchaseLocation: 'Amazon',
    purchasePrice: 27.99,
    series: 'DC Heroes',
    status: 'owned' as const,
    year: 2021,
  },
];

const sampleComments = [
  {
    content: 'Amazing collection! That Babe Ruth bobblehead is incredible.',
    targetType: 'bobblehead' as const,
  },
  {
    content: 'Love your Star Wars collection. Do you have any Mandalorian figures?',
    targetType: 'collection' as const,
  },
  {
    content: 'That vintage Mickey Mouse is so rare! Great find.',
    targetType: 'bobblehead' as const,
  },
  {
    content: 'Your sports collection is impressive. Any plans to add hockey players?',
    targetType: 'collection' as const,
  },
  {
    content: 'The condition on that Tom Brady bobblehead looks great!',
    targetType: 'bobblehead' as const,
  },
];

async function main() {
  console.log('🌱 Starting database seeding...\n');

  try {
    await resetDatabase();

    const insertedUsers = await seedUsers();
    const insertedTags = await seedTags(insertedUsers);
    const collectionsData = await seedCollections(insertedUsers);
    const insertedBobbleheads = await seedBobbleheads(insertedUsers, collectionsData, insertedTags);
    await seedSocialData(insertedUsers, insertedBobbleheads, collectionsData);
    await updateAggregates();

    console.log('\n🎉 Database seeding completed successfully!');
    console.log(`
📊 Seeding Summary:
   👥 Users: ${insertedUsers.length}
   🏷️  Tags: ${insertedTags.length}
   📚 Collections: ${collectionsData.collections.length}
   📂 Sub-collections: ${collectionsData.subCollections.length}
   🪆 Bobbleheads: ${insertedBobbleheads.length}
   📸 Photos: 3
   💬 Social interactions: Various likes, follows, and comments
    `);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

async function resetDatabase() {
  if (!IS_RESET_DATABASE) return;

  console.log('🗑️  Resetting database...');

  // Delete all data in reverse dependency order
  await db.delete(comments);
  await db.delete(likes);
  await db.delete(follows);
  await db.delete(bobbleheadTags);
  await db.delete(bobbleheadPhotos);
  await db.delete(bobbleheads);
  await db.delete(subCollections);
  await db.delete(collections);
  await db.delete(tags);
  await db.delete(notificationSettings);
  await db.delete(userSettings);
  await db.delete(users);

  console.log('✅ Database reset complete');
}

async function seedBobbleheads(
  insertedUsers: (typeof users.$inferSelect)[],
  collectionsData: {
    collections: (typeof collections.$inferSelect)[];
    subCollections: (typeof subCollections.$inferSelect)[];
  },
  insertedTags: (typeof tags.$inferSelect)[],
) {
  console.log('🪆 Seeding bobbleheads...');

  const bobbleheadsWithCollections = sampleBobbleheads.map((bobblehead, index) => {
    const collection = collectionsData.collections[index % collectionsData.collections.length];
    const user = insertedUsers.find((u) => u.id === collection?.userId)!;

    // Assign sub-collection based on bobblehead type
    let subcollectionId = null;
    if (bobblehead.characterName === 'Babe Ruth') {
      subcollectionId = collectionsData.subCollections.find((sc) => sc.name === 'Yankees Legends')?.id;
    } else if (bobblehead.characterName === 'Luke Skywalker' || bobblehead.characterName === 'Darth Vader') {
      subcollectionId = collectionsData.subCollections.find((sc) => sc.name === 'Original Trilogy')?.id;
    } else if (bobblehead.characterName === 'Spider-Man') {
      subcollectionId = collectionsData.subCollections.find((sc) => sc.name === 'Spider-Verse')?.id;
    }

    return {
      ...bobblehead,
      acquisitionDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
      collectionId: collection!.id,
      commentCount: Math.floor(Math.random() * 10),
      likeCount: Math.floor(Math.random() * 25),
      subcollectionId,
      userId: user.id,
      viewCount: Math.floor(Math.random() * 100),
    };
  });

  const insertedBobbleheads = await db.insert(bobbleheads).values(bobbleheadsWithCollections).returning();
  console.log(`✅ Created ${insertedBobbleheads.length} bobbleheads`);

  // Add some sample photos
  const photoData = [
    {
      altText: 'Babe Ruth bobblehead front view',
      bobbleheadId: insertedBobbleheads.find((b) => b.name === 'Babe Ruth Yankees')!.id,
      isPrimary: true,
      sortOrder: 0,
      url: 'https://images.example.com/babe-ruth-front.jpg',
    },
    {
      altText: 'Darth Vader bobblehead front view',
      bobbleheadId: insertedBobbleheads.find((b) => b.name === 'Darth Vader')!.id,
      isPrimary: true,
      sortOrder: 0,
      url: 'https://images.example.com/darth-vader-front.jpg',
    },
    {
      altText: 'Spider-Man bobblehead front view',
      bobbleheadId: insertedBobbleheads.find((b) => b.name === 'Spider-Man Classic')!.id,
      isPrimary: true,
      sortOrder: 0,
      url: 'https://images.example.com/spiderman-front.jpg',
    },
  ];

  await db.insert(bobbleheadPhotos).values(photoData);
  console.log(`✅ Created ${photoData.length} bobblehead photos`);

  // Add tags to bobbleheads
  const bobbleheadTagsData = [];
  for (const bobblehead of insertedBobbleheads) {
    const relevantTags = insertedTags.filter((tag) => {
      if (
        bobblehead.category === 'Sports' &&
        ['Baseball', 'Basketball', 'Football', 'Sports'].includes(tag.name)
      ) {
        return true;
      }
      if (bobblehead.category === 'Movies' && ['Movies', 'Star Wars'].includes(tag.name)) {
        return true;
      }
      if (
        bobblehead.category === 'Comic Books' &&
        ['Comic Books', 'DC Comics', 'Marvel'].includes(tag.name)
      ) {
        return true;
      }
      if (bobblehead.year && bobblehead.year < 1990 && tag.name === 'Vintage') {
        return true;
      }
      return bobblehead.isFeatured && tag.name === 'Limited Edition';
    });

    // Add 1-3 random relevant tags
    const tagsToAdd = relevantTags.slice(0, Math.floor(Math.random() * 3) + 1);
    for (const tag of tagsToAdd) {
      bobbleheadTagsData.push({
        bobbleheadId: bobblehead.id,
        tagId: tag.id,
      });
    }
  }

  if (bobbleheadTagsData.length > 0) {
    await db.insert(bobbleheadTags).values(bobbleheadTagsData);
    console.log(`✅ Created ${bobbleheadTagsData.length} bobblehead tags`);
  }

  return insertedBobbleheads;
}

async function seedCollections(insertedUsers: (typeof users.$inferSelect)[]) {
  console.log('📚 Seeding collections...');

  const collectionsWithUsers = sampleCollections.map((collection, index) => ({
    ...collection,
    userId: insertedUsers[index % insertedUsers.length]!.id,
  }));

  const insertedCollections = await db.insert(collections).values(collectionsWithUsers).returning();
  console.log(`✅ Created ${insertedCollections.length} collections`);

  // Create some sub-collections
  const subCollectionsData = [
    {
      collectionId: insertedCollections.find((c) => c.name === 'MLB Hall of Fame')!.id,
      description: 'Hall of Fame Yankees players',
      name: 'Yankees Legends',
      sortOrder: 1,
    },
    {
      collectionId: insertedCollections.find((c) => c.name === 'Star Wars Universe')!.id,
      description: 'Characters from Episodes IV-VI',
      name: 'Original Trilogy',
      sortOrder: 1,
    },
    {
      collectionId: insertedCollections.find((c) => c.name === 'Marvel Heroes')!.id,
      description: 'All Spider-Man related characters',
      name: 'Spider-Verse',
      sortOrder: 1,
    },
  ];

  const insertedSubCollections = await db.insert(subCollections).values(subCollectionsData).returning();
  console.log(`✅ Created ${insertedSubCollections.length} sub-collections`);

  return { collections: insertedCollections, subCollections: insertedSubCollections };
}

async function seedSocialData(
  insertedUsers: (typeof users.$inferSelect)[],
  insertedBobbleheads: (typeof bobbleheads.$inferSelect)[],
  collectionsData: { collections: (typeof collections.$inferSelect)[] },
) {
  console.log('💬 Seeding social data...');

  // Create some follows between users
  const followsData = [];
  for (let i = 0; i < insertedUsers.length; i++) {
    for (let j = 0; j < insertedUsers.length; j++) {
      if (i !== j && Math.random() < 0.4) {
        // 40% chance of following
        followsData.push({
          followerId: insertedUsers[i]!.id,
          followingId: insertedUsers[j]!.id,
          followType: 'user' as const,
        });
      }
    }
  }

  if (followsData.length > 0) {
    await db.insert(follows).values(followsData);
    console.log(`✅ Created ${followsData.length} follows`);
  }

  // Create some likes
  const likesData = [];
  for (const user of insertedUsers) {
    // Like some bobbleheads
    const bobbleheadsToLike = insertedBobbleheads
      .filter((b) => b.userId !== user.id)
      .slice(0, Math.floor(Math.random() * 4) + 1);

    for (const bobblehead of bobbleheadsToLike) {
      likesData.push({
        targetId: bobblehead.id,
        targetType: 'bobblehead' as const,
        userId: user.id,
      });
    }

    // Like some collections
    const collectionsToLike = collectionsData.collections
      .filter((c) => c.userId !== user.id)
      .slice(0, Math.floor(Math.random() * 3) + 1);

    for (const collection of collectionsToLike) {
      likesData.push({
        targetId: collection.id,
        targetType: 'collection' as const,
        userId: user.id,
      });
    }
  }

  if (likesData.length > 0) {
    await db.insert(likes).values(likesData);
    console.log(`✅ Created ${likesData.length} likes`);
  }

  // Create some comments
  const commentsData = [];
  for (let i = 0; i < sampleComments.length; i++) {
    const comment = sampleComments[i];
    const user = insertedUsers[i % insertedUsers.length];

    let targetId: string;
    if (comment?.targetType === 'bobblehead') {
      const availableBobbleheads = insertedBobbleheads.filter((b) => b.userId !== user?.id);
      targetId = availableBobbleheads[Math.floor(Math.random() * availableBobbleheads.length)]!.id;
    } else {
      const availableCollections = collectionsData.collections.filter((c) => c.userId !== user?.id);
      targetId = availableCollections[Math.floor(Math.random() * availableCollections.length)]!.id;
    }

    commentsData.push({
      content: comment!.content,
      likeCount: Math.floor(Math.random() * 5),
      targetId,
      targetType: comment!.targetType,
      userId: user!.id,
    });
  }

  if (commentsData.length > 0) {
    await db.insert(comments).values(commentsData);
    console.log(`✅ Created ${commentsData.length} comments`);
  }
}

async function seedTags(insertedUsers: (typeof users.$inferSelect)[]) {
  console.log('🏷️  Seeding tags...');

  // Create system tags (userId = null)
  const systemTagsData = systemTags.map((tag) => ({
    ...tag,
    usageCount: 0, // system tags start with 0 usage
    userId: null, // system tags have no user owner
  }));

  // Create sample user tags (assigned to random users)
  const userTagsData = sampleUserTags.map((tag) => ({
    ...tag,
    usageCount: Math.floor(Math.random() * 5),
    userId: insertedUsers[Math.floor(Math.random() * insertedUsers.length)]!.id,
  }));

  // Insert all tags
  const allTagsData = [...systemTagsData, ...userTagsData];
  const insertedTags = await db.insert(tags).values(allTagsData).returning();

  console.log(`✅ Created ${systemTagsData.length} system tags and ${userTagsData.length} user tags`);
  console.log(`✅ Total tags created: ${insertedTags.length}`);

  return insertedTags;
}

async function seedUsers() {
  console.log('👥 Seeding users...');

  // Check for existing users to avoid duplicates
  const existingUsers = await db.select().from(users);
  const existingClerkIds = new Set(existingUsers.map((u) => u.clerkId));

  // Filter out users that already exist
  const newUsers = sampleUsers.filter((user) => !existingClerkIds.has(user.clerkId));

  let insertedUsers: (typeof users.$inferSelect)[] = [];

  if (newUsers.length > 0) {
    insertedUsers = await db.insert(users).values(newUsers).returning();
    console.log(`✅ Created ${insertedUsers.length} new users`);
  } else {
    console.log('✅ All users already exist, skipping insertion');
  }

  // Return all users (existing + newly inserted)
  const allUsers = await db.select().from(users);
  console.log(`✅ Total users in database: ${allUsers.length}`);

  // Create user settings for new users only
  if (insertedUsers.length > 0) {
    const userSettingsData = insertedUsers.map((user) => ({
      userId: user.id,
    }));

    await db.insert(userSettings).values(userSettingsData);
    console.log(`✅ Created user settings for ${userSettingsData.length} new users`);

    // Create notification settings for new users only
    const notificationSettingsData = insertedUsers.map((user) => ({
      userId: user.id,
    }));

    await db.insert(notificationSettings).values(notificationSettingsData);
    console.log(`✅ Created notification settings for ${notificationSettingsData.length} new users`);
  }

  return allUsers;
}

async function updateAggregates() {
  console.log('🔄 Updating aggregates...');

  // Update collection totals
  await db.execute(sql`
    UPDATE collections 
    SET 
      total_items = (
        SELECT COUNT(*) 
        FROM bobbleheads 
        WHERE bobbleheads.collection_id = collections.id 
        AND is_deleted = false
      ),
      total_value = (
        SELECT COALESCE(SUM(purchase_price::decimal), 0) 
        FROM bobbleheads 
        WHERE bobbleheads.collection_id = collections.id 
        AND is_deleted = false
        AND purchase_price IS NOT NULL
      ),
      last_item_added_at = (
        SELECT MAX(created_at) 
        FROM bobbleheads 
        WHERE bobbleheads.collection_id = collections.id
      )
  `);

  // Update sub-collection item counts
  await db.execute(sql`
    UPDATE sub_collections 
    SET item_count = (
      SELECT COUNT(*) 
      FROM bobbleheads 
      WHERE bobbleheads.sub_collection_id = sub_collections.id 
      AND is_deleted = false
    )
  `);

  // Update tag usage counts
  await db.execute(sql`
    UPDATE tags 
    SET usage_count = (
      SELECT COUNT(*) 
      FROM bobblehead_tags 
      WHERE bobblehead_tags.tag_id = tags.id
    )
  `);

  console.log('✅ Aggregates updated');
}

void main();
