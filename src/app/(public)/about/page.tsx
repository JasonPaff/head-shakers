import type { Metadata } from 'next';

export default function AboutPage() {
  return <div>About Page</div>;
}

export function generateMetadata(): Metadata {
  return {
    description: '',
    title: 'About',
  };
}
