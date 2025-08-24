import type { Metadata } from 'next';

export default function CollectionPage() {
  return <div>Collection Page</div>;
}

export function generateMetadata(): Metadata {
  return {
    description: '',
    title: 'Collection',
  };
}
