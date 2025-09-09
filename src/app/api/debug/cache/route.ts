import { NextResponse } from 'next/server';

import { getCacheStats, resetCacheStats } from '@/lib/queries/featured-content.queries';

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 });
  }

  const stats = getCacheStats();

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

  resetCacheStats();

  return NextResponse.json({
    message: 'Cache statistics reset',
    timestamp: new Date().toISOString(),
  });
}
