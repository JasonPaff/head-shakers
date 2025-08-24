import type { Metadata } from 'next';

export default function DashboardPage() {
  return <div>Dashboard Page</div>;
}

export function generateMetadata(): Metadata {
  return {
    description: '',
    title: 'Dashboard',
  };
}
