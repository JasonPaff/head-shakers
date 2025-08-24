import type { Metadata } from 'next';

export default function CategoryPage() {
  return <div>Category Page</div>;
}

export function generateMetadata(): Metadata {
  return {
    description: '',
    title: 'Category',
  };
}
