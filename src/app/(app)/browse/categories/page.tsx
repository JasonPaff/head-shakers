import type { Metadata } from 'next';

export default function CategoriesPage() {
  return <div>Categories Page</div>;
}

export function generateMetadata(): Metadata {
  return {
    description: '',
    title: 'Categories',
  };
}
