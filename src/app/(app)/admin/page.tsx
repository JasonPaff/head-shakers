import type { Metadata } from 'next';

import { ChartSplineIcon, MailIcon, SparklesIcon, TriangleAlertIcon, UsersIcon } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';

import { AdminLayout } from '@/components/layout/admin/admin-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const adminSections = [
  {
    description: 'Manage homepage featured collections and bobbleheads',
    href: $path({ route: '/admin/featured-content' }),
    icon: SparklesIcon,
    title: 'Featured Content',
  },
  {
    description: 'View platform usage and engagement metrics',
    href: $path({ route: '/admin/analytics' }),
    icon: ChartSplineIcon,
    title: 'Analytics',
  },
  {
    description: 'Manage pre-launch email signups',
    href: $path({ route: '/admin/launch-notifications' }),
    icon: MailIcon,
    title: 'Launch Notifications',
  },
  {
    description: 'Review content reports and moderation queue',
    href: $path({ route: '/admin/reports' }),
    icon: TriangleAlertIcon,
    title: 'Reports',
  },
  {
    description: 'Manage users, roles, and permissions',
    href: $path({ route: '/admin/users' }),
    icon: UsersIcon,
    title: 'Users',
  },
];

export default function AdminPage() {
  return (
    <AdminLayout isAdminRequired={false}>
      <div className={'grid gap-6 md:grid-cols-2 lg:grid-cols-3'}>
        {/* Admin Navigation Cards */}
        {adminSections.map((section) => {
          const Icon = section.icon;

          return (
            <Link href={section.href} key={section.href}>
              <Card
                className={'h-full cursor-pointer transition-all hover:border-primary hover:shadow-md'}
                data-slot={'admin-nav-card'}
              >
                <CardHeader>
                  <div className={'flex items-center gap-3'}>
                    <Icon aria-hidden className={'size-5 text-primary'} />
                    <CardTitle>{section.title}</CardTitle>
                  </div>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
                <CardContent />
              </Card>
            </Link>
          );
        })}
      </div>
    </AdminLayout>
  );
}

export function generateMetadata(): Metadata {
  return {
    description: 'Admin dashboard for content moderation and site management',
    robots: 'noindex, nofollow',
    title: 'Admin',
  };
}
