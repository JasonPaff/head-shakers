'use client';

import { useUser } from '@clerk/nextjs';
import { EyeIcon, PlusIcon, TrendingUpIcon, UsersIcon } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';
import { Fragment } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarInset } from '@/components/ui/sidebar/sidebar-inset';

interface DashboardClientProps {
  stats?: DashboardStats;
}

interface DashboardStats {
  collectionValue: number;
  profileViews: number;
  totalItems: number;
}

export function DashboardClient({ stats }: DashboardClientProps) {
  const { user } = useUser();

  const name = user?.firstName ? `, ${user.firstName}!` : '!';

  const displayStats = stats || {
    collectionValue: 0,
    profileViews: 0,
    totalItems: 0,
  };

  return (
    <SidebarInset>
      <div className={'flex flex-1 flex-col gap-6 p-6'}>
        <div className={'flex items-center justify-between'}>
          <div>
            <h1 className={'text-3xl font-bold'}>Welcome back{name}</h1>
            <p className={'text-muted-foreground'}>{`Here's what's happening with your collection`}</p>
          </div>
          <Button asChild className={'gap-2'}>
            <Link href={$path({ route: '/bobbleheads/add' })}>
              <PlusIcon aria-hidden className={'size-4'} />
              Add Bobblehead
            </Link>
          </Button>
        </div>

        <div className={'grid gap-4 md:grid-cols-4'}>
          <Card>
            <CardHeader className={'flex flex-row items-center justify-between space-y-0 pb-2'}>
              <CardTitle className={'text-sm font-medium'}>Total Items</CardTitle>
              <div className={'h-4 w-4 text-muted-foreground'}>📊</div>
            </CardHeader>
            <CardContent>
              <div className={'text-2xl font-bold'}>{displayStats.totalItems}</div>
              <p className={'text-xs text-muted-foreground'}>
                {displayStats.totalItems > 0 ? 'Items in your collection' : 'Start building your collection'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className={'flex flex-row items-center justify-between space-y-0 pb-2'}>
              <CardTitle className={'text-sm font-medium'}>Collection Value</CardTitle>
              <TrendingUpIcon className={'h-4 w-4 text-muted-foreground'} />
            </CardHeader>
            <CardContent>
              <div className={'text-2xl font-bold'}>${displayStats.collectionValue.toLocaleString()}</div>
              <p className={'text-xs text-muted-foreground'}>
                {displayStats.collectionValue > 0 ? 'Based on purchase prices' : 'Add items to see value'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className={'flex flex-row items-center justify-between space-y-0 pb-2'}>
              <CardTitle className={'text-sm font-medium'}>Followers</CardTitle>
              <UsersIcon className={'h-4 w-4 text-muted-foreground'} />
            </CardHeader>
            <CardContent>
              <div className={'text-2xl font-bold'}>0</div>
              <p className={'text-xs text-muted-foreground'}>Social features coming soon</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className={'flex flex-row items-center justify-between space-y-0 pb-2'}>
              <CardTitle className={'text-sm font-medium'}>Profile Views</CardTitle>
              <EyeIcon className={'h-4 w-4 text-muted-foreground'} />
            </CardHeader>
            <CardContent>
              <div className={'text-2xl font-bold'}>{displayStats.profileViews.toLocaleString()}</div>
              <p className={'text-xs text-muted-foreground'}>Estimated profile activity</p>
            </CardContent>
          </Card>
        </div>

        <div className={'grid gap-6 md:grid-cols-2'}>
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest collection updates</CardDescription>
            </CardHeader>
            <CardContent className={'space-y-4'}>
              {displayStats.totalItems > 0 ?
                <>
                  <div className={'flex items-center gap-3'}>
                    <div className={'h-2 w-2 rounded-full bg-green-500'}></div>
                    <div className={'flex-1'}>
                      <p className={'text-sm font-medium'}>Collection is growing!</p>
                      <p className={'text-xs text-muted-foreground'}>
                        {displayStats.totalItems} items in your collection
                      </p>
                    </div>
                  </div>
                  <div className={'flex items-center gap-3'}>
                    <div className={'h-2 w-2 rounded-full bg-blue-500'}></div>
                    <div className={'flex-1'}>
                      <p className={'text-sm font-medium'}>Ready to add more?</p>
                      <p className={'text-xs text-muted-foreground'}>
                        Click &#34;Add Bobblehead&#34; to expand your collection
                      </p>
                    </div>
                  </div>
                </>
              : <div className={'flex items-center gap-3'}>
                  <div className={'h-2 w-2 rounded-full bg-orange-500'}></div>
                  <div className={'flex-1'}>
                    <p className={'text-sm font-medium'}>Start your collection!</p>
                    <p className={'text-xs text-muted-foreground'}>
                      Add your first bobblehead to get started
                    </p>
                  </div>
                </div>
              }
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Collection Overview</CardTitle>
              <CardDescription>Your bobblehead collection at a glance</CardDescription>
            </CardHeader>
            <CardContent className={'space-y-4'}>
              {displayStats.totalItems > 0 ?
                <Fragment>
                  <div className={'flex items-center gap-3'}>
                    <div className={'flex h-12 w-12 items-center justify-center rounded-md bg-muted'}>
                      <span className={'text-xl'}>🎯</span>
                    </div>
                    <div className={'flex-1'}>
                      <p className={'text-sm font-medium'}>Total Collection</p>
                      <div className={'flex items-center gap-2'}>
                        <Badge variant={'secondary'}>Active</Badge>
                        <span className={'text-sm text-muted-foreground'}>
                          {displayStats.totalItems} items
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className={'flex items-center gap-3'}>
                    <div className={'flex h-12 w-12 items-center justify-center rounded-md bg-muted'}>
                      <span className={'text-xl'}>💰</span>
                    </div>
                    <div className={'flex-1'}>
                      <p className={'text-sm font-medium'}>Collection Value</p>
                      <div className={'flex items-center gap-2'}>
                        <Badge variant={'secondary'}>Growing</Badge>
                        <span className={'text-sm text-muted-foreground'}>
                          ${displayStats.collectionValue.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Fragment>
              : <div className={'py-8 text-center'}>
                  <div className={'mb-2 text-4xl'}>📦</div>
                  <p className={'mb-4 text-sm text-muted-foreground'}>
                    Your collection is waiting to be started!
                  </p>
                  <Button asChild size={'sm'}>
                    <Link href={$path({ route: '/bobbleheads/add' })}>Add First Item</Link>
                  </Button>
                </div>
              }
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarInset>
  );
}
