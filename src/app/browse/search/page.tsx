import type { Metadata } from 'next';

export function generateMetadata(): Metadata {
  return {
    description: '',
    title: 'Search',
  };
}

export default function SearchPage() {
  return <div>Search Page</div>;
}
