import type { Metadata } from 'next';

export default function DashboardFeedPage() {
  return <div>Dashboard Feed Page</div>;
}

export function generateMetadata(): Metadata {
  return {
    description: '',
    title: 'Dashboard Feed',
  };
}
