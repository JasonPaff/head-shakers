'use client';

import { useUser } from '@clerk/nextjs';
import {
  ChartSplineIcon,
  EarthIcon,
  LayoutDashboardIcon,
  MailIcon,
  MenuIcon,
  PackagePlusIcon,
  ShieldHalfIcon,
  SparklesIcon,
  StarIcon,
  TrendingUpIcon,
  TriangleAlertIcon,
  TrophyIcon,
  UsersIcon,
} from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';

import { AuthContent } from '@/components/ui/auth';
import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminRole } from '@/hooks/use-admin-role';
import { useToggle } from '@/hooks/use-toggle';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

const publicNavItems = [
  {
    href: $path({ route: '/browse' }),
    icon: EarthIcon,
    label: 'All Collections',
  },
  {
    href: $path({ route: '/browse/featured' }),
    icon: StarIcon,
    label: 'Featured',
  },
  {
    href: $path({ route: '/browse/trending' }),
    icon: TrendingUpIcon,
    label: 'Trending',
  },
  {
    href: $path({ route: '/browse/categories' }),
    icon: TrophyIcon,
    label: 'Categories',
  },
];

const getUserNavItems = (username: string) => [
  {
    href: $path({ route: '/user/[username]/dashboard/collection', routeParams: { username } }),
    icon: LayoutDashboardIcon,
    label: 'Dashboard',
  },
  {
    href: $path({
      route: '/user/[username]/dashboard/collection',
      routeParams: { username },
      searchParams: { add: true },
    }),
    icon: PackagePlusIcon,
    label: 'Add Bobblehead',
  },
];

const adminNavItems = [
  {
    href: $path({ route: '/admin/featured-content' }),
    icon: SparklesIcon,
    label: 'Featured Content',
  },
  {
    href: $path({ route: '/admin/analytics' }),
    icon: ChartSplineIcon,
    label: 'Analytics',
  },
  {
    href: $path({ route: '/admin/launch-notifications' }),
    icon: MailIcon,
    label: 'Launch Notifications',
  },
  {
    href: $path({ route: '/admin/reports' }),
    icon: TriangleAlertIcon,
    label: 'Reports',
  },
  {
    href: $path({ route: '/admin/users' }),
    icon: UsersIcon,
    label: 'Users',
  },
];

export const AppHeaderMobileMenu = () => {
  const [isOpen, setIsOpen] = useToggle();
  const { isAdmin, isLoading, isModerator } = useAdminRole();
  const { user } = useUser();

  const isShowAdminMenu = !isLoading && (isModerator || isAdmin);
  const userNavItems = user?.username ? getUserNavItems(user.username) : [];

  return (
    <Sheet onOpenChange={setIsOpen.update} open={isOpen}>
      <SheetTrigger asChild>
        <Button
          className={'md:hidden'}
          data-testid={generateTestId('layout', 'app-header', 'mobile-menu-trigger')}
          size={'icon'}
          variant={'ghost'}
        >
          <MenuIcon aria-hidden className={'size-5'} />
          <span className={'sr-only'}>Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent data-testid={generateTestId('layout', 'app-header', 'mobile-menu')} side={'left'}>
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>Navigate to different sections of the site</SheetDescription>
        </SheetHeader>

        <div className={'-mx-4 flex-1 overflow-y-auto'}>
          <div className={'flex flex-col gap-6 px-4 py-4'}>
            {/* Browse Section */}
            <div className={'flex flex-col gap-3'}>
              <h3 className={'px-2 text-sm font-semibold text-muted-foreground'}>Browse</h3>
              <nav className={'flex flex-col gap-1'}>
                {publicNavItems.map((item) => (
                  <SheetClose asChild key={item.href}>
                    <Link
                      className={cn(
                        'flex items-center gap-3 rounded-md px-3 py-2.5',
                        'text-sm font-medium transition-colors',
                        'hover:bg-accent hover:text-accent-foreground',
                      )}
                      href={item.href}
                    >
                      <item.icon aria-hidden className={'size-5'} />
                      {item.label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
            </div>

            <Separator />

            {/* User Section - Only show if authenticated */}
            <AuthContent loadingSkeleton={<Skeleton className={'h-32 w-full'} />}>
              <div className={'flex flex-col gap-3'}>
                <h3 className={'px-2 text-sm font-semibold text-muted-foreground'}>My Collection</h3>
                <nav className={'flex flex-col gap-1'}>
                  {userNavItems.map((item) => (
                    <SheetClose asChild key={item.href}>
                      <Link
                        className={cn(
                          'flex items-center gap-3 rounded-md px-3 py-2.5',
                          'text-sm font-medium transition-colors',
                          'hover:bg-accent hover:text-accent-foreground',
                        )}
                        href={item.href}
                      >
                        <item.icon aria-hidden className={'size-5'} />
                        {item.label}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>
              </div>
            </AuthContent>

            {/* Admin Section - Only show if admin/moderator */}
            <Conditional isCondition={isShowAdminMenu}>
              <Separator />
              <div className={'flex flex-col gap-3'}>
                <div className={'flex items-center gap-2 px-2'}>
                  <ShieldHalfIcon aria-hidden className={'size-4 text-muted-foreground'} />
                  <h3 className={'text-sm font-semibold text-muted-foreground'}>Admin</h3>
                </div>
                <nav className={'flex flex-col gap-1'}>
                  {adminNavItems.map((item) => (
                    <SheetClose asChild key={item.href}>
                      <Link
                        className={cn(
                          'flex items-center gap-3 rounded-md px-3 py-2.5',
                          'text-sm font-medium transition-colors',
                          'hover:bg-accent hover:text-accent-foreground',
                        )}
                        href={item.href}
                      >
                        <item.icon aria-hidden className={'size-5'} />
                        {item.label}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>
              </div>
            </Conditional>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
