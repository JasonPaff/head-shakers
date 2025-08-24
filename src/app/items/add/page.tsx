import type { Metadata } from 'next';

export default function AddItemPage() {
  return <div>Add Item Page</div>;
}

export function generateMetadata(): Metadata {
  return {
    description: '',
    title: 'Add Item',
  };
}
