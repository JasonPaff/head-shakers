import { NextResponse } from 'next/server';

export function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 });
  }

  return NextResponse.json({
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
}

export function POST() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 });
  }

  return NextResponse.json({
    message: 'Cache statistics reset',
    timestamp: new Date().toISOString(),
  });
}
