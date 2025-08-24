import type { Metadata } from 'next';

export function generateMetadata(): Metadata {
  return {
    description: '',
    title: 'Notification',
  };
}

export default function NotificationSettingsPage() {
  return <div>Notification Settings Page</div>;
}
