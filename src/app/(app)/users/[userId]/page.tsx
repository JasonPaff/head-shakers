import type { Metadata } from 'next';

export function generateMetadata(): Metadata {
  return {
    description: '',
    title: 'User',
  };
}

export default function UserPage() {
  return <div>User Page</div>;
}
