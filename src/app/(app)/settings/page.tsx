import type { Metadata } from 'next';

export function generateMetadata(): Metadata {
  return {
    description: '',
    title: { default: 'Settings', template: '%s | Settings' },
  };
}

export default function SettingsPage() {
  return <div>Settings Page</div>;
}
