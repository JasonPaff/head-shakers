import type { Metadata } from 'next';

export function generateMetadata(): Metadata {
  return {
    description: '',
    title: 'Profile',
  };
}

export default function ProfileSettingsPage() {
  return <div>Profile Settings Page</div>;
}
