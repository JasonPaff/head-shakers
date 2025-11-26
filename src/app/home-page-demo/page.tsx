'use client';

import {
  ArrowRight,
  Award,
  Crown,
  Eye,
  Flame,
  Heart,
  Layers,
  MessageCircle,
  Search,
  Sparkles,
  Star,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// ============================================================================
// MOCK DATA - Based on actual app data structures
// ============================================================================

const MOCK_FEATURED_COLLECTIONS = [
  {
    commentCount: 89,
    coverImageUrl: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800&q=80',
    description:
      'Iconic sports legends immortalized in bobblehead form. Featuring rare stadium exclusives and signed pieces.',
    id: '1',
    isTrending: true,
    likeCount: 342,
    name: 'Hall of Fame Legends',
    ownerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
    ownerUsername: 'collector_mike',
    slug: 'hall-of-fame-legends',
    totalItems: 47,
    totalValue: 12500,
    viewCount: 8750,
  },
  {
    commentCount: 45,
    coverImageUrl: 'https://images.unsplash.com/photo-1508344928928-7165b0a59708?w=800&q=80',
    description: 'Rare finds from the golden era of baseball. 1960s-1980s classics in pristine condition.',
    id: '2',
    isTrending: false,
    likeCount: 218,
    name: 'Vintage Baseball Collection',
    ownerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
    ownerUsername: 'vintage_finds',
    slug: 'vintage-baseball-collection',
    totalItems: 28,
    totalValue: 8900,
    viewCount: 5420,
  },
  {
    commentCount: 156,
    coverImageUrl: 'https://images.unsplash.com/photo-1471295253337-3ceaaedca402?w=800&q=80',
    description: 'World Series, Super Bowl, and NBA Finals commemorative bobbleheads from historic wins.',
    id: '3',
    isTrending: true,
    likeCount: 567,
    name: 'Championship Winners',
    ownerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
    ownerUsername: 'sports_fanatic',
    slug: 'championship-winners',
    totalItems: 63,
    totalValue: 15800,
    viewCount: 12340,
  },
];

const MOCK_TRENDING_BOBBLEHEADS = [
  {
    badge: 'trending',
    category: 'Baseball',
    characterName: 'Derek Jeter',
    condition: 'Mint',
    id: '1',
    imageUrl: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=600&q=80',
    isFeatured: true,
    likeCount: 892,
    name: 'Derek Jeter Farewell Series',
    ownerUsername: 'yankees_fan_1',
    slug: 'derek-jeter-farewell',
    viewCount: 4521,
    year: 2014,
  },
  {
    badge: 'editor_pick',
    category: 'Basketball',
    characterName: 'Kobe Bryant',
    condition: 'Excellent',
    id: '2',
    imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&q=80',
    isFeatured: true,
    likeCount: 1247,
    name: 'Kobe Bryant Gold Edition',
    ownerUsername: 'lakers_legend',
    slug: 'kobe-bryant-gold',
    viewCount: 6890,
    year: 2016,
  },
  {
    badge: 'trending',
    category: 'Football',
    characterName: 'Tom Brady',
    condition: 'Mint',
    id: '3',
    imageUrl: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=600&q=80',
    isFeatured: false,
    likeCount: 756,
    name: 'Tom Brady SB LI MVP',
    ownerUsername: 'pats_nation',
    slug: 'tom-brady-sb-51',
    viewCount: 3245,
    year: 2017,
  },
  {
    badge: 'new',
    category: 'Baseball',
    characterName: 'Mike Trout',
    condition: 'Excellent',
    id: '4',
    imageUrl: 'https://images.unsplash.com/photo-1508344928928-7165b0a59708?w=600&q=80',
    isFeatured: true,
    likeCount: 445,
    name: 'Mike Trout All-Star',
    ownerUsername: 'angels_collector',
    slug: 'mike-trout-allstar',
    viewCount: 2156,
    year: 2019,
  },
  {
    badge: 'popular',
    category: 'Baseball',
    characterName: 'Shohei Ohtani',
    condition: 'Mint',
    id: '5',
    imageUrl: 'https://images.unsplash.com/photo-1471295253337-3ceaaedca402?w=600&q=80',
    isFeatured: true,
    likeCount: 1589,
    name: 'Shohei Ohtani Two-Way',
    ownerUsername: 'japanese_imports',
    slug: 'shohei-ohtani-twoway',
    viewCount: 8934,
    year: 2023,
  },
  {
    badge: 'trending',
    category: 'Hockey',
    characterName: 'Wayne Gretzky',
    condition: 'Good',
    id: '6',
    imageUrl: 'https://images.unsplash.com/photo-1515703407324-5f753afd8be8?w=600&q=80',
    isFeatured: false,
    likeCount: 678,
    name: 'Wayne Gretzky Oilers',
    ownerUsername: 'hockey_history',
    slug: 'wayne-gretzky-oilers',
    viewCount: 3567,
    year: 1985,
  },
];

const MOCK_COLLECTOR_SPOTLIGHT = {
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
  bio: 'Collecting bobbleheads for over 20 years. Specializing in vintage sports and limited editions. Always looking to connect with fellow collectors!',
  featuredCollection: {
    coverUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&q=80',
    itemCount: 34,
    name: 'Lakers Legends',
  },
  followers: 2340,
  following: 189,
  location: 'Los Angeles, CA',
  totalCollections: 12,
  totalItems: 847,
  username: 'BobbleKing_Steve',
};

const MOCK_CATEGORIES = [
  { color: 'from-red-500 to-red-700', count: 12450, icon: '⚾', name: 'Baseball' },
  { color: 'from-orange-500 to-orange-700', count: 8920, icon: '🏀', name: 'Basketball' },
  { color: 'from-amber-600 to-amber-800', count: 7840, icon: '🏈', name: 'Football' },
  { color: 'from-blue-500 to-blue-700', count: 4560, icon: '🏒', name: 'Hockey' },
  { color: 'from-green-500 to-green-700', count: 3890, icon: '⚽', name: 'Soccer' },
  { color: 'from-purple-500 to-purple-700', count: 6780, icon: '🎬', name: 'Entertainment' },
];

const MOCK_STATS = {
  itemsAddedThisMonth: 3456,
  totalBobbleheads: 127450,
  totalCollections: 24680,
  totalCollectors: 8940,
};

// ============================================================================
// BADGE COMPONENT
// ============================================================================

export default function HomePageDemo() {
  return (
    <main className={'min-h-screen'}>
      <HeroSection />
      <FeaturedCollectionsSection />
      <TrendingBobbleheadsSection />
      <CollectorSpotlightSection />
      <CategoriesSection />
      <CTASection />
    </main>
  );
}

// ============================================================================
// HERO SECTION
// ============================================================================

function Badge({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant: 'editor_pick' | 'new' | 'popular' | 'trending';
}) {
  const variants = {
    editor_pick: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black',
    new: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white',
    popular: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
    trending: 'bg-gradient-to-r from-orange-500 to-red-500 text-white',
  };

  const icons = {
    editor_pick: <Crown className={'size-3'} />,
    new: <Sparkles className={'size-3'} />,
    popular: <Heart className={'size-3'} />,
    trending: <Flame className={'size-3'} />,
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold shadow-lg ${variants[variant]}`}
    >
      {icons[variant]}
      {children}
    </span>
  );
}

// ============================================================================
// FEATURED COLLECTIONS SECTION
// ============================================================================

function CategoriesSection() {
  return (
    <section className={'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-20'}>
      <div className={'container mx-auto px-6'}>
        {/* Section Header */}
        <div className={'mb-12 flex flex-col items-center text-center'}>
          <div
            className={
              'mb-4 flex size-16 items-center justify-center rounded-full bg-slate-700/50 backdrop-blur-sm'
            }
          >
            <Search className={'size-8 text-white'} />
          </div>
          <h2 className={'text-4xl font-bold tracking-tight text-white md:text-5xl'}>Browse by Category</h2>
          <p className={'mt-4 max-w-2xl text-lg text-slate-400'}>
            Find exactly what you&apos;re looking for across our diverse categories
          </p>
        </div>

        {/* Categories Grid */}
        <div className={'grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6'}>
          {MOCK_CATEGORIES.map((category) => (
            <Link
              className={
                'group relative overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-600 hover:bg-slate-700/50'
              }
              href={'#'}
              key={category.name}
            >
              {/* Gradient Background */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 transition-opacity group-hover:opacity-20`}
              />

              <div className={'relative text-center'}>
                <div className={'text-4xl'}>{category.icon}</div>
                <h3 className={'mt-3 font-semibold text-white'}>{category.name}</h3>
                <p className={'mt-1 text-sm text-slate-400'}>{category.count.toLocaleString()} items</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// TRENDING BOBBLEHEADS SECTION
// ============================================================================

function CollectorSpotlightSection() {
  const collector = MOCK_COLLECTOR_SPOTLIGHT;

  return (
    <section className={'bg-white py-20 dark:bg-slate-950'}>
      <div className={'container mx-auto px-6'}>
        {/* Section Header */}
        <div className={'mb-12 flex flex-col items-center text-center'}>
          <div
            className={
              'mb-4 flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30'
            }
          >
            <Star className={'size-8 text-purple-600 dark:text-purple-400'} />
          </div>
          <h2 className={'text-4xl font-bold tracking-tight text-slate-900 md:text-5xl dark:text-white'}>
            Collector Spotlight
          </h2>
          <p className={'mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-400'}>
            Meet the passionate collectors who make our community special
          </p>
        </div>

        {/* Spotlight Card */}
        <Card
          className={
            'mx-auto max-w-4xl overflow-hidden border-0 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 shadow-xl dark:from-slate-800 dark:via-slate-800 dark:to-slate-800'
          }
        >
          <CardContent className={'p-0'}>
            <div className={'grid gap-8 p-8 md:grid-cols-2 md:p-10'}>
              {/* Left - Profile */}
              <div className={'flex flex-col items-center text-center md:items-start md:text-left'}>
                <div className={'relative'}>
                  {}
                  <img
                    alt={collector.username}
                    className={
                      'size-[120px] rounded-full object-cover shadow-lg ring-4 ring-white dark:ring-slate-700'
                    }
                    src={collector.avatar}
                  />
                  <div
                    className={
                      'absolute -right-2 -bottom-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-2 shadow-lg'
                    }
                  >
                    <Award className={'size-5 text-white'} />
                  </div>
                </div>

                <h3 className={'mt-6 text-2xl font-bold text-slate-900 dark:text-white'}>
                  @{collector.username}
                </h3>
                <p className={'mt-1 text-sm text-slate-500'}>{collector.location}</p>

                <p className={'mt-4 text-slate-600 dark:text-slate-400'}>{collector.bio}</p>

                {/* Stats Grid */}
                <div className={'mt-6 grid w-full grid-cols-2 gap-4'}>
                  <div className={'rounded-xl bg-white/80 p-4 text-center dark:bg-slate-700/50'}>
                    <div className={'text-2xl font-bold text-purple-600 dark:text-purple-400'}>
                      {collector.totalItems.toLocaleString()}
                    </div>
                    <div className={'text-xs text-slate-500'}>Bobbleheads</div>
                  </div>
                  <div className={'rounded-xl bg-white/80 p-4 text-center dark:bg-slate-700/50'}>
                    <div className={'text-2xl font-bold text-purple-600 dark:text-purple-400'}>
                      {collector.followers.toLocaleString()}
                    </div>
                    <div className={'text-xs text-slate-500'}>Followers</div>
                  </div>
                </div>

                <Button
                  className={
                    'mt-6 w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                  }
                >
                  <Users className={'mr-2 size-4'} />
                  Follow Collector
                </Button>
              </div>

              {/* Right - Featured Collection */}
              <div className={'flex flex-col'}>
                <div className={'mb-4 flex items-center gap-2'}>
                  <Trophy className={'size-5 text-amber-500'} />
                  <span className={'font-semibold text-slate-900 dark:text-white'}>Featured Collection</span>
                </div>

                <Link className={'group relative flex-1 overflow-hidden rounded-2xl shadow-lg'} href={'#'}>
                  <div className={'relative aspect-[4/3] md:aspect-auto md:h-full'}>
                    {}
                    <img
                      alt={collector.featuredCollection.name}
                      className={
                        'absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-110'
                      }
                      src={collector.featuredCollection.coverUrl}
                    />
                    <div
                      className={
                        'absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent'
                      }
                    />

                    <div className={'absolute right-0 bottom-0 left-0 p-6'}>
                      <h4 className={'text-xl font-bold text-white'}>{collector.featuredCollection.name}</h4>
                      <p className={'mt-1 text-white/80'}>{collector.featuredCollection.itemCount} items</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

// ============================================================================
// COLLECTOR SPOTLIGHT SECTION
// ============================================================================

function CTASection() {
  return (
    <section
      className={
        'relative overflow-hidden bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 py-20'
      }
    >
      {/* Background Pattern */}
      <div aria-hidden={'true'} className={'absolute inset-0'}>
        <div className={'absolute -top-20 -right-20 size-[400px] rounded-full bg-white/10 blur-3xl'} />
        <div className={'absolute -bottom-20 -left-20 size-[400px] rounded-full bg-white/10 blur-3xl'} />
        <div
          className={'absolute inset-0 opacity-10'}
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className={'relative container mx-auto px-6'}>
        <div className={'mx-auto max-w-3xl text-center'}>
          <h2 className={'text-4xl font-extrabold tracking-tight text-white md:text-5xl lg:text-6xl'}>
            Ready to Start Your Collection?
          </h2>
          <p className={'mt-6 text-xl text-white/90'}>
            Join thousands of collectors and start cataloging your bobbleheads today. It&apos;s free to get
            started!
          </p>

          <div className={'mt-10 flex flex-wrap justify-center gap-4'}>
            <Button
              className={'bg-white px-8 text-lg font-semibold text-orange-600 shadow-lg hover:bg-slate-100'}
              size={'lg'}
            >
              Create Free Account
              <Zap className={'ml-2 size-5'} />
            </Button>
            <Button
              className={
                'border-2 border-white bg-transparent px-8 text-lg font-semibold text-white hover:bg-white/10'
              }
              size={'lg'}
              variant={'outline'}
            >
              Learn More
            </Button>
          </div>

          {/* Trust Badges */}
          <div className={'mt-12 flex flex-wrap items-center justify-center gap-8 text-white/80'}>
            <div className={'flex items-center gap-2'}>
              <Users className={'size-5'} />
              <span>8,900+ Collectors</span>
            </div>
            <div className={'flex items-center gap-2'}>
              <Award className={'size-5'} />
              <span>Top Rated Platform</span>
            </div>
            <div className={'flex items-center gap-2'}>
              <Heart className={'size-5'} />
              <span>100% Free to Start</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// CATEGORIES SECTION
// ============================================================================

function FeaturedCollectionsSection() {
  return (
    <section className={'bg-white py-20 dark:bg-slate-950'}>
      <div className={'container mx-auto px-6'}>
        {/* Section Header */}
        <div className={'mb-12 flex flex-col items-center text-center'}>
          <div
            className={
              'mb-4 flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30'
            }
          >
            <Layers className={'size-8 text-orange-600 dark:text-orange-400'} />
          </div>
          <h2 className={'text-4xl font-bold tracking-tight text-slate-900 md:text-5xl dark:text-white'}>
            Featured Collections
          </h2>
          <p className={'mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-400'}>
            Explore curated collections from our most passionate collectors
          </p>
        </div>

        {/* Collections Grid */}
        <div className={'grid gap-8 md:grid-cols-2 lg:grid-cols-3'}>
          {MOCK_FEATURED_COLLECTIONS.map((collection) => (
            <Link
              className={
                'group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl dark:border-slate-800 dark:bg-slate-900'
              }
              href={'#'}
              key={collection.id}
            >
              {/* Image */}
              <div className={'relative aspect-[4/3] overflow-hidden'}>
                {}
                <img
                  alt={collection.name}
                  className={
                    'absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-110'
                  }
                  src={collection.coverImageUrl}
                />
                <div
                  className={'absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent'}
                />

                {/* Trending Badge */}
                {collection.isTrending && (
                  <div className={'absolute top-4 right-4'}>
                    <Badge variant={'trending'}>Trending</Badge>
                  </div>
                )}

                {/* Collection Info Overlay */}
                <div className={'absolute right-0 bottom-0 left-0 p-6'}>
                  <h3 className={'text-xl font-bold text-white drop-shadow-lg'}>{collection.name}</h3>
                  <p className={'mt-2 line-clamp-2 text-sm text-white/80'}>{collection.description}</p>
                </div>
              </div>

              {/* Footer */}
              <div className={'p-5'}>
                <div className={'flex items-center justify-between'}>
                  <div className={'flex items-center gap-3'}>
                    {}
                    <img
                      alt={collection.ownerUsername}
                      className={'size-9 rounded-full object-cover ring-2 ring-orange-500/20'}
                      src={collection.ownerAvatar}
                    />
                    <div>
                      <div className={'text-sm font-medium text-slate-900 dark:text-white'}>
                        @{collection.ownerUsername}
                      </div>
                      <div className={'text-xs text-slate-500'}>{collection.totalItems} items</div>
                    </div>
                  </div>
                  <div className={'text-right'}>
                    <div className={'text-sm font-semibold text-orange-600 dark:text-orange-400'}>
                      ${collection.totalValue.toLocaleString()}
                    </div>
                    <div className={'text-xs text-slate-500'}>Est. Value</div>
                  </div>
                </div>

                {/* Stats */}
                <div
                  className={
                    'mt-4 flex items-center gap-4 border-t border-slate-100 pt-4 text-sm text-slate-500 dark:border-slate-800'
                  }
                >
                  <span className={'flex items-center gap-1'}>
                    <Heart className={'size-4 text-red-400'} />
                    {collection.likeCount.toLocaleString()}
                  </span>
                  <span className={'flex items-center gap-1'}>
                    <Eye className={'size-4'} />
                    {collection.viewCount.toLocaleString()}
                  </span>
                  <span className={'flex items-center gap-1'}>
                    <MessageCircle className={'size-4'} />
                    {collection.commentCount}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className={'mt-12 text-center'}>
          <Button
            className={
              'group border-orange-500/30 text-orange-600 hover:bg-orange-50 hover:text-orange-700 dark:text-orange-400 dark:hover:bg-orange-950/50'
            }
            size={'lg'}
            variant={'outline'}
          >
            View All Collections
            <ArrowRight className={'ml-2 size-5 transition-transform group-hover:translate-x-1'} />
          </Button>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// CTA SECTION
// ============================================================================

function HeroSection() {
  return (
    <section
      className={
        'relative min-h-[90vh] overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950'
      }
    >
      {/* Animated Background Elements */}
      <div aria-hidden={'true'} className={'absolute inset-0 overflow-hidden'}>
        {/* Gradient Orbs */}
        <div
          className={
            'absolute top-20 -left-40 size-[500px] animate-pulse rounded-full bg-orange-500/20 blur-[100px]'
          }
        />
        <div
          className={
            'absolute top-40 -right-40 size-[400px] animate-pulse rounded-full bg-amber-500/15 blur-[100px]'
          }
          style={{ animationDelay: '1s' }}
        />
        <div
          className={
            'absolute bottom-20 left-1/3 size-[600px] animate-pulse rounded-full bg-red-500/10 blur-[120px]'
          }
          style={{ animationDelay: '2s' }}
        />

        {/* Grid Pattern */}
        <div
          className={'absolute inset-0 opacity-[0.03]'}
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className={'relative container mx-auto px-6 py-20 lg:py-32'}>
        <div className={'grid items-center gap-12 lg:grid-cols-2 lg:gap-16'}>
          {/* Left Content */}
          <div className={'space-y-8'}>
            {/* Badge */}
            <div
              className={
                'inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 backdrop-blur-sm'
              }
            >
              <Sparkles className={'size-4 text-orange-400'} />
              <span className={'text-sm font-medium text-orange-300'}>The #1 Platform for Collectors</span>
            </div>

            {/* Main Heading */}
            <h1
              className={
                'text-5xl leading-tight font-extrabold tracking-tight text-white md:text-6xl lg:text-7xl'
              }
            >
              Discover{' '}
              <span
                className={
                  'bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent'
                }
              >
                Legendary
              </span>
              <br />
              Bobbleheads
            </h1>

            {/* Description */}
            <p className={'max-w-xl text-lg text-slate-300 md:text-xl'}>
              Join thousands of collectors showcasing their prized bobbleheads. Catalog your collection,
              connect with enthusiasts, and discover rare finds.
            </p>

            {/* CTA Buttons */}
            <div className={'flex flex-wrap gap-4'}>
              <Button
                className={
                  'group bg-gradient-to-r from-orange-500 to-amber-500 px-8 text-lg font-semibold shadow-lg shadow-orange-500/25 hover:from-orange-600 hover:to-amber-600'
                }
                size={'lg'}
              >
                Start Your Collection
                <ArrowRight className={'ml-2 size-5 transition-transform group-hover:translate-x-1'} />
              </Button>
              <Button
                className={
                  'border-slate-600 bg-slate-800/50 px-8 text-lg text-white backdrop-blur-sm hover:bg-slate-700/50'
                }
                size={'lg'}
                variant={'outline'}
              >
                <Search className={'mr-2 size-5'} />
                Explore Collections
              </Button>
            </div>

            {/* Stats Row */}
            <div className={'flex flex-wrap gap-8 border-t border-slate-700/50 pt-8'}>
              <div>
                <div className={'text-3xl font-bold text-white'}>
                  {MOCK_STATS.totalBobbleheads.toLocaleString()}+
                </div>
                <div className={'text-sm text-slate-400'}>Bobbleheads</div>
              </div>
              <div>
                <div className={'text-3xl font-bold text-white'}>
                  {MOCK_STATS.totalCollectors.toLocaleString()}+
                </div>
                <div className={'text-sm text-slate-400'}>Collectors</div>
              </div>
              <div>
                <div className={'text-3xl font-bold text-white'}>
                  {MOCK_STATS.totalCollections.toLocaleString()}+
                </div>
                <div className={'text-sm text-slate-400'}>Collections</div>
              </div>
            </div>
          </div>

          {/* Right Content - Featured Bobblehead Showcase */}
          <div className={'relative lg:pl-8'}>
            {/* Main Featured Card */}
            <div className={'relative'}>
              <div
                className={
                  'group relative overflow-hidden rounded-3xl border border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-2 shadow-2xl backdrop-blur-sm'
                }
              >
                <div className={'relative aspect-square overflow-hidden rounded-2xl'}>
                  {}
                  <img
                    alt={'Featured Bobblehead'}
                    className={
                      'absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-110'
                    }
                    src={'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800&q=80'}
                  />
                  <div
                    className={'absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent'}
                  />

                  {/* Overlay Content */}
                  <div className={'absolute right-0 bottom-0 left-0 p-6'}>
                    <Badge variant={'editor_pick'}>Editor&apos;s Pick</Badge>
                    <h3 className={'mt-3 text-2xl font-bold text-white drop-shadow-lg'}>
                      Derek Jeter Retirement
                    </h3>
                    <p className={'mt-1 text-slate-300'}>Limited Edition Stadium Exclusive</p>
                    <div className={'mt-4 flex items-center gap-4 text-sm text-slate-300'}>
                      <span className={'flex items-center gap-1'}>
                        <Heart className={'size-4 text-red-400'} />
                        892
                      </span>
                      <span className={'flex items-center gap-1'}>
                        <Eye className={'size-4'} />
                        4,521
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Cards */}
              <div
                className={
                  'absolute top-8 -left-8 -rotate-12 transform animate-bounce rounded-2xl border border-slate-600/50 bg-slate-800/90 p-3 shadow-xl backdrop-blur-sm'
                }
                style={{ animationDuration: '3s' }}
              >
                <div className={'flex items-center gap-3'}>
                  <div className={'rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 p-2'}>
                    <Trophy className={'size-5 text-white'} />
                  </div>
                  <div>
                    <div className={'text-sm font-semibold text-white'}>Top Rated</div>
                    <div className={'text-xs text-slate-400'}>This Week</div>
                  </div>
                </div>
              </div>

              <div
                className={
                  'absolute -right-4 bottom-20 rotate-6 transform animate-bounce rounded-2xl border border-slate-600/50 bg-slate-800/90 p-3 shadow-xl backdrop-blur-sm'
                }
                style={{ animationDelay: '1s', animationDuration: '4s' }}
              >
                <div className={'flex items-center gap-3'}>
                  <div className={'rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 p-2'}>
                    <TrendingUp className={'size-5 text-white'} />
                  </div>
                  <div>
                    <div className={'text-sm font-semibold text-white'}>+23%</div>
                    <div className={'text-xs text-slate-400'}>Value Growth</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave Divider */}
      <div className={'absolute right-0 bottom-0 left-0'}>
        <svg className={'w-full'} fill={'none'} viewBox={'0 0 1440 120'} xmlns={'http://www.w3.org/2000/svg'}>
          <path
            className={'fill-white dark:fill-slate-950'}
            d={
              'M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z'
            }
          />
        </svg>
      </div>
    </section>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

function TrendingBobbleheadsSection() {
  return (
    <section
      className={
        'bg-gradient-to-br from-slate-50 via-orange-50/30 to-amber-50/30 py-20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900'
      }
    >
      <div className={'container mx-auto px-6'}>
        {/* Section Header */}
        <div className={'mb-12 flex flex-col items-center text-center'}>
          <div
            className={
              'mb-4 flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30'
            }
          >
            <Flame className={'size-8 text-red-600 dark:text-red-400'} />
          </div>
          <h2 className={'text-4xl font-bold tracking-tight text-slate-900 md:text-5xl dark:text-white'}>
            Trending Now
          </h2>
          <p className={'mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-400'}>
            The most popular bobbleheads this week from collectors worldwide
          </p>
        </div>

        {/* Bobbleheads Grid */}
        <div className={'grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-6'}>
          {MOCK_TRENDING_BOBBLEHEADS.map((bobblehead) => (
            <Link
              className={
                'group relative overflow-hidden rounded-2xl border border-slate-200/50 bg-white shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl dark:border-slate-700/50 dark:bg-slate-800'
              }
              href={'#'}
              key={bobblehead.id}
            >
              {/* Image */}
              <div
                className={
                  'relative aspect-square overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800'
                }
              >
                {}
                <img
                  alt={bobblehead.name}
                  className={
                    'absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-110'
                  }
                  src={bobblehead.imageUrl}
                />

                {/* Badge */}
                <div className={'absolute top-2 left-2'}>
                  <Badge variant={bobblehead.badge as 'editor_pick' | 'new' | 'popular' | 'trending'}>
                    {bobblehead.badge === 'editor_pick' ?
                      'Pick'
                    : bobblehead.badge.charAt(0).toUpperCase() + bobblehead.badge.slice(1)}
                  </Badge>
                </div>

                {/* Gradient Overlay */}
                <div
                  className={
                    'absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100'
                  }
                />

                {/* Hover Stats */}
                <div
                  className={
                    'absolute right-0 bottom-0 left-0 translate-y-full p-3 transition-transform group-hover:translate-y-0'
                  }
                >
                  <div className={'flex items-center justify-center gap-3 text-xs text-white'}>
                    <span className={'flex items-center gap-1'}>
                      <Heart className={'size-3'} />
                      {bobblehead.likeCount.toLocaleString()}
                    </span>
                    <span className={'flex items-center gap-1'}>
                      <Eye className={'size-3'} />
                      {bobblehead.viewCount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className={'p-3'}>
                <h3 className={'line-clamp-1 text-sm font-semibold text-slate-900 dark:text-white'}>
                  {bobblehead.characterName}
                </h3>
                <div className={'mt-1 flex items-center justify-between text-xs text-slate-500'}>
                  <span>{bobblehead.category}</span>
                  <span>{bobblehead.year}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className={'mt-12 text-center'}>
          <Button
            className={
              'group bg-gradient-to-r from-orange-500 to-red-500 px-8 text-lg font-semibold shadow-lg shadow-orange-500/25 hover:from-orange-600 hover:to-red-600'
            }
            size={'lg'}
          >
            Explore All Bobbleheads
            <ArrowRight className={'ml-2 size-5 transition-transform group-hover:translate-x-1'} />
          </Button>
        </div>
      </div>
    </section>
  );
}
