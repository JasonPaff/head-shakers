import type { Metadata } from 'next';

export default function FeaturedPage() {
  return <div>Featured Page</div>;
}

export function generateMetadata(): Metadata {
  return {
    description: '',
    title: 'Featured',
  };
}
