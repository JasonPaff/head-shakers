import { NextResponse } from 'next/server';

import { FeaturedContentFacade } from '@/lib/queries/featured-content/featured-content-facade';

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 });
  }

  const stats = await FeaturedContentFacade.getCacheStats();

  return NextResponse.json({
    cacheStats: stats,
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
}

export async function POST() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 });
  }

  await FeaturedContentFacade.resetCacheStats();

  return NextResponse.json({
    message: 'Cache statistics reset',
    timestamp: new Date().toISOString(),
  });
}
