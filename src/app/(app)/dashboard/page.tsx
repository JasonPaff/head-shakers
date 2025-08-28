'use client';

import { useUser } from '@clerk/nextjs';
import { EyeIcon, PlusIcon, TrendingUpIcon, UsersIcon } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarInset } from '@/components/ui/sidebar/sidebar-inset';

export default function DashboardPage() {
  const { user } = useUser();

  const name = user?.firstName ? `, ${user.firstName}!` : '!';

  return (
    <SidebarInset>
      <div className={'flex flex-1 flex-col gap-6 p-6'}>
        <div className={'flex items-center justify-between'}>
          <div>
            <h1 className={'text-3xl font-bold'}>Welcome back{name}</h1>
            <p className={'text-muted-foreground'}>{`Here's what's happening with your collection`}</p>
          </div>
          <Button asChild className={'gap-2'}>
            <Link href={$path({ route: '/items/add' })}>
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
              <div className={'text-2xl font-bold'}>247</div>
              <p className={'text-xs text-muted-foreground'}>+12 from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className={'flex flex-row items-center justify-between space-y-0 pb-2'}>
              <CardTitle className={'text-sm font-medium'}>Collection Value</CardTitle>
              <TrendingUpIcon className={'h-4 w-4 text-muted-foreground'} />
            </CardHeader>
            <CardContent>
              <div className={'text-2xl font-bold'}>$3,247</div>
              <p className={'text-xs text-muted-foreground'}>+8.2% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className={'flex flex-row items-center justify-between space-y-0 pb-2'}>
              <CardTitle className={'text-sm font-medium'}>Followers</CardTitle>
              <UsersIcon className={'h-4 w-4 text-muted-foreground'} />
            </CardHeader>
            <CardContent>
              <div className={'text-2xl font-bold'}>89</div>
              <p className={'text-xs text-muted-foreground'}>+5 new followers</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className={'flex flex-row items-center justify-between space-y-0 pb-2'}>
              <CardTitle className={'text-sm font-medium'}>Profile Views</CardTitle>
              <EyeIcon className={'h-4 w-4 text-muted-foreground'} />
            </CardHeader>
            <CardContent>
              <div className={'text-2xl font-bold'}>1,234</div>
              <p className={'text-xs text-muted-foreground'}>+15% this week</p>
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
              <div className={'flex items-center gap-3'}>
                <div className={'h-2 w-2 rounded-full bg-green-500'}></div>
                <div className={'flex-1'}>
                  <p className={'text-sm font-medium'}>{`Added "Mickey Mouse Vintage"`}</p>
                  <p className={'text-xs text-muted-foreground'}>2 hours ago</p>
                </div>
              </div>
              <div className={'flex items-center gap-3'}>
                <div className={'h-2 w-2 rounded-full bg-blue-500'}></div>
                <div className={'flex-1'}>
                  <p className={'text-sm font-medium'}>{`Updated "Sports Collection"`}</p>
                  <p className={'text-xs text-muted-foreground'}>1 day ago</p>
                </div>
              </div>
              <div className={'flex items-center gap-3'}>
                <div className={'h-2 w-2 rounded-full bg-orange-500'}></div>
                <div className={'flex-1'}>
                  <p className={'text-sm font-medium'}>New follower: @collector_jane</p>
                  <p className={'text-xs text-muted-foreground'}>2 days ago</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Featured Items</CardTitle>
              <CardDescription>Your most valuable pieces</CardDescription>
            </CardHeader>
            <CardContent className={'space-y-4'}>
              <div className={'flex items-center gap-3'}>
                <div className={'h-12 w-12 rounded-md bg-muted'}></div>
                <div className={'flex-1'}>
                  <p className={'text-sm font-medium'}>Babe Ruth 1927</p>
                  <div className={'flex items-center gap-2'}>
                    <Badge variant={'secondary'}>Rare</Badge>
                    <span className={'text-sm text-muted-foreground'}>$450</span>
                  </div>
                </div>
              </div>
              <div className={'flex items-center gap-3'}>
                <div className={'h-12 w-12 rounded-md bg-muted'}></div>
                <div className={'flex-1'}>
                  <p className={'text-sm font-medium'}>Einstein Bobblehead</p>
                  <div className={'flex items-center gap-2'}>
                    <Badge variant={'secondary'}>Vintage</Badge>
                    <span className={'text-sm text-muted-foreground'}>$320</span>
                  </div>
                </div>
              </div>
              <div className={'flex items-center gap-3'}>
                <div className={'h-12 w-12 rounded-md bg-muted'}></div>
                <div className={'flex-1'}>
                  <p className={'text-sm font-medium'}>Star Wars C-3PO</p>
                  <div className={'flex items-center gap-2'}>
                    <Badge variant={'secondary'}>Limited</Badge>
                    <span className={'text-sm text-muted-foreground'}>$280</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarInset>
  );
}
