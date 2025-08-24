import type { Metadata } from 'next';

export function generateMetadata(): Metadata {
  return {
    description: '',
    title: 'User Collections',
  };
}

export default function UserCollectionsPage() {
  return <div>User Collections Page</div>;
}
