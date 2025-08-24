import type { Metadata } from 'next';

export function generateMetadata(): Metadata {
  return {
    description: '',
    title: 'Privacy',
  };
}

export default function PrivacyPage() {
  return <div>Privacy Page</div>;
}
