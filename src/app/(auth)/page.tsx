import type { Metadata } from 'next';

export function generateMetadata(): Metadata {
  return {
    description: '',
    title: 'Home - Head Shakers',
  };
}

export default function HomePage() {
  return <div>Home Page</div>;
}
