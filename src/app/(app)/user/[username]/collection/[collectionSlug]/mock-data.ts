/**
 * Mock data for the collection view page mockup.
 * This data matches the shapes expected from the real backend.
 */

export interface MockBobblehead {
  category: null | string;
  condition: null | string;
  description: null | string;
  featurePhoto: null | string;
  id: string;
  isLiked: boolean;
  likeCount: number;
  manufacturer: null | string;
  name: string;
  photos: Array<string>;
  slug: string;
  year: null | number;
}

export interface MockCollection {
  coverImageUrl: null | string;
  createdAt: Date;
  description: null | string;
  lastUpdatedAt: Date;
  likeCount: number;
  name: string;
  slug: string;
  totalBobbleheadCount: number;
  viewCount: number;
}

export interface MockCollector {
  avatarUrl: null | string;
  displayName: null | string;
  username: string;
}

export const mockCollection: MockCollection = {
  coverImageUrl: 'https://placehold.co/1200x300/1a1a2e/ffffff?text=Orioles+Collection',
  createdAt: new Date('2024-03-15'),
  description:
    'A curated collection of bobbleheads featuring the greatest players in Baltimore Orioles history. From the Iron Man to Hall of Fame pitchers, this collection celebrates the orange and black.',
  lastUpdatedAt: new Date('2024-12-01'),
  likeCount: 142,
  name: 'Baltimore Orioles Legends',
  slug: 'baltimore-orioles-legends',
  totalBobbleheadCount: 24,
  viewCount: 1893,
};

export const mockCollector: MockCollector = {
  avatarUrl: 'https://placehold.co/48x48/f97316/ffffff?text=JP',
  displayName: 'Jason P.',
  username: 'orioles_fan_42',
};

export const mockBobbleheads: Array<MockBobblehead> = [
  {
    category: 'Sports',
    condition: 'Mint',
    description: 'The Iron Man - commemorating his 2,632 consecutive games streak. A true Baltimore legend.',
    featurePhoto: 'https://placehold.co/300x400/f97316/ffffff?text=Cal+Ripken',
    id: '1',
    isLiked: false,
    likeCount: 28,
    manufacturer: 'FOCO',
    name: 'Cal Ripken Jr.',
    photos: [
      'https://placehold.co/300x400/f97316/ffffff?text=Cal+Ripken+1',
      'https://placehold.co/300x400/ea580c/ffffff?text=Cal+Ripken+2',
      'https://placehold.co/300x400/c2410c/ffffff?text=Cal+Ripken+3',
    ],
    slug: 'cal-ripken-jr',
    year: 2001,
  },
  {
    category: 'Sports',
    condition: 'Mint',
    description: 'The Human Vacuum Cleaner - 16x Gold Glove winner and Orioles legend at third base.',
    featurePhoto: 'https://placehold.co/300x400/2563eb/ffffff?text=Brooks+Robinson',
    id: '2',
    isLiked: false,
    likeCount: 22,
    manufacturer: 'FOCO',
    name: 'Brooks Robinson',
    photos: [
      'https://placehold.co/300x400/2563eb/ffffff?text=Brooks+1',
      'https://placehold.co/300x400/1d4ed8/ffffff?text=Brooks+2',
    ],
    slug: 'brooks-robinson',
    year: 2015,
  },
  {
    category: 'Sports',
    condition: 'Near Mint',
    description:
      'Hall of Fame pitcher with 3 Cy Young Awards. One of the greatest pitchers in Orioles history.',
    featurePhoto: 'https://placehold.co/300x400/16a34a/ffffff?text=Jim+Palmer',
    id: '3',
    isLiked: false,
    likeCount: 19,
    manufacturer: 'Forever Collectibles',
    name: 'Jim Palmer',
    photos: [
      'https://placehold.co/300x400/16a34a/ffffff?text=Palmer+1',
      'https://placehold.co/300x400/15803d/ffffff?text=Palmer+2',
    ],
    slug: 'jim-palmer',
    year: 2018,
  },
  {
    category: 'Sports',
    condition: 'Mint',
    description: 'Steady Eddie - switch-hitting first baseman and member of the 500 home run club.',
    featurePhoto: 'https://placehold.co/300x400/7c3aed/ffffff?text=Eddie+Murray',
    id: '4',
    isLiked: false,
    likeCount: 17,
    manufacturer: 'FOCO',
    name: 'Eddie Murray',
    photos: [
      'https://placehold.co/300x400/7c3aed/ffffff?text=Murray+1',
      'https://placehold.co/300x400/6d28d9/ffffff?text=Murray+2',
      'https://placehold.co/300x400/5b21b6/ffffff?text=Murray+3',
    ],
    slug: 'eddie-murray',
    year: 2012,
  },
  {
    category: 'Sports',
    condition: 'Good',
    description: 'Triple Crown winner in 1966 and first African American manager in MLB history.',
    featurePhoto: 'https://placehold.co/300x400/dc2626/ffffff?text=Frank+Robinson',
    id: '5',
    isLiked: false,
    likeCount: 24,
    manufacturer: 'SGA',
    name: 'Frank Robinson',
    photos: [
      'https://placehold.co/300x400/dc2626/ffffff?text=Frank+1',
      'https://placehold.co/300x400/b91c1c/ffffff?text=Frank+2',
    ],
    slug: 'frank-robinson',
    year: 2016,
  },
  {
    category: 'Sports',
    condition: 'Mint',
    description: 'Five-time All-Star and beloved center fielder. The heart and soul of the modern Orioles.',
    featurePhoto: 'https://placehold.co/300x400/0891b2/ffffff?text=Adam+Jones',
    id: '6',
    isLiked: false,
    likeCount: 31,
    manufacturer: 'FOCO',
    name: 'Adam Jones',
    photos: [
      'https://placehold.co/300x400/0891b2/ffffff?text=Jones+1',
      'https://placehold.co/300x400/0e7490/ffffff?text=Jones+2',
    ],
    slug: 'adam-jones',
    year: 2019,
  },
  {
    category: 'Sports',
    condition: 'Near Mint',
    description: 'Two-time Gold Glove winner at third base during his time with the Orioles.',
    featurePhoto: 'https://placehold.co/300x400/ca8a04/ffffff?text=Manny+Machado',
    id: '7',
    isLiked: false,
    likeCount: 15,
    manufacturer: 'Forever Collectibles',
    name: 'Manny Machado',
    photos: [
      'https://placehold.co/300x400/ca8a04/ffffff?text=Machado+1',
      'https://placehold.co/300x400/a16207/ffffff?text=Machado+2',
    ],
    slug: 'manny-machado',
    year: 2017,
  },
  {
    category: 'Mascots',
    condition: 'Mint',
    description: 'The beloved team mascot since 1979. A fan favorite at Camden Yards.',
    featurePhoto: 'https://placehold.co/300x400/ea580c/ffffff?text=Oriole+Bird',
    id: '8',
    isLiked: false,
    likeCount: 45,
    manufacturer: 'SGA',
    name: 'The Oriole Bird',
    photos: [
      'https://placehold.co/300x400/ea580c/ffffff?text=Bird+1',
      'https://placehold.co/300x400/c2410c/ffffff?text=Bird+2',
      'https://placehold.co/300x400/9a3412/ffffff?text=Bird+3',
    ],
    slug: 'oriole-bird-mascot',
    year: 2020,
  },
];

export type SortOption = 'name_asc' | 'name_desc' | 'newest' | 'oldest';

export const sortOptions: Array<{ label: string; value: SortOption }> = [
  { label: 'Date Added - Newest First', value: 'newest' },
  { label: 'Date Added - Oldest First', value: 'oldest' },
  { label: 'Name A-Z', value: 'name_asc' },
  { label: 'Name Z-A', value: 'name_desc' },
];
