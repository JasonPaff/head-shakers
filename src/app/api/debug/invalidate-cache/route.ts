import { NextResponse } from 'next/server';

import { invalidateFeaturedContentCaches } from '@/lib/utils/cache.utils';

export function POST() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 });
  }

  try {
    invalidateFeaturedContentCaches();

    return NextResponse.json({
      message: 'Featured content caches invalidated successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cache invalidation failed:', error);

    return NextResponse.json(
      {
        error: 'Cache invalidation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
