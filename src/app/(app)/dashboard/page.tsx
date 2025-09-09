import type { Metadata } from 'next';

import { DashboardServer } from './components/dashboard-server';

export default function DashboardPage() {
  return <DashboardServer />;
}

export function generateMetadata(): Metadata {
  return {
    description: 'Your bobblehead collection dashboard',
    title: 'Dashboard',
  };
}
