import type { Metadata } from 'next';

export default function BrowsePage() {
  return <div>Browse Page</div>;
}

export function generateMetadata(): Metadata {
  return {
    description: '',
    title: 'Browse',
  };
}
