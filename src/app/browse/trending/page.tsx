import type { Metadata } from 'next';

export function generateMetadata(): Metadata {
  return {
    description: '',
    title: 'Trending',
  };
}

export default function TrendingPage() {
  return <div>Trending Page</div>;
}
