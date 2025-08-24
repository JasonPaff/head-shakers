import type { Metadata } from 'next';

export function generateMetadata(): Metadata {
  return {
    description: '',
    title: 'Home',
  };
}

export default function HomePage() {
  return <div>Home Page</div>;
}
