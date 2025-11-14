import type { Metadata } from 'next';

export default function EditCollectionPage() {
  return <div>Edit Collection Page</div>;
}

export function generateMetadata(): Metadata {
  return {
    description: 'Edit collection details',
    robots: 'noindex, nofollow',
    title: 'Edit Collection',
  };
}
