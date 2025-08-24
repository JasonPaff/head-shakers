import type { Metadata } from 'next';

export default function EditItemPage() {
  return <div>Edit Item Page</div>;
}

export function generateMetadata(): Metadata {
  return {
    description: '',
    title: 'Edit Item',
  };
}
