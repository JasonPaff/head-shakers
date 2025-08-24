import type { Metadata } from 'next';

export function generateMetadata(): Metadata {
  return {
    description: '',
    title: 'Item',
  };
}

export default function ItemPage() {
  return <div>Item Page</div>;
}
