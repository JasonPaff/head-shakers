'use client';

import { BarChart3Icon, CalendarIcon, TrendingUpIcon } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const FeaturedContentAnalytics = () => {
  // mock analytics data - would come from the contentMetrics table in real implementation
  const mockAnalytics = {
    overview: {
      activeFeatures: 12,
      avgViewsPerFeature: 1986,
      totalFeatures: 23,
      totalViews: 45672,
    },
    recentActivity: [
      { date: '2024-01-15', features: 3, views: 2340 },
      { date: '2024-01-14', features: 2, views: 1890 },
      { date: '2024-01-13', features: 1, views: 1420 },
      { date: '2024-01-12', features: 2, views: 1980 },
      { date: '2024-01-11', features: 1, views: 980 },
    ],
    topPerformers: [
      { ctr: 12.4, name: 'Baseball Legends Collection', type: 'collection', views: 8420 },
      { ctr: 9.8, name: 'Vintage Mickey Mouse', type: 'bobblehead', views: 6340 },
      { ctr: 8.2, name: 'John Collector Profile', type: 'user', views: 4890 },
    ],
  };

  return (
    <div className={'space-y-6'}>
      {/* Overview Stats */}
      <div className={'grid gap-4 md:grid-cols-2 lg:grid-cols-4'}>
        <Card>
          <CardHeader className={'flex flex-row items-center justify-between space-y-0 pb-2'}>
            <CardTitle className={'text-sm font-medium'}>Total Views</CardTitle>
            <BarChart3Icon aria-hidden className={'size-4 text-muted-foreground'} />
          </CardHeader>
          <CardContent>
            <div className={'text-2xl font-bold'}>{mockAnalytics.overview.totalViews.toLocaleString()}</div>
            <p className={'text-xs text-muted-foreground'}>+12.5% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className={'flex flex-row items-center justify-between space-y-0 pb-2'}>
            <CardTitle className={'text-sm font-medium'}>Active Features</CardTitle>
            <TrendingUpIcon aria-hidden className={'size-4 text-muted-foreground'} />
          </CardHeader>
          <CardContent>
            <div className={'text-2xl font-bold'}>{mockAnalytics.overview.activeFeatures}</div>
            <p className={'text-xs text-muted-foreground'}>of {mockAnalytics.overview.totalFeatures} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className={'flex flex-row items-center justify-between space-y-0 pb-2'}>
            <CardTitle className={'text-sm font-medium'}>Avg Views/Feature</CardTitle>
            <BarChart3Icon aria-hidden className={'size-4 text-muted-foreground'} />
          </CardHeader>
          <CardContent>
            <div className={'text-2xl font-bold'}>
              {mockAnalytics.overview.avgViewsPerFeature.toLocaleString()}
            </div>
            <p className={'text-xs text-muted-foreground'}>+8.1% from last period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className={'flex flex-row items-center justify-between space-y-0 pb-2'}>
            <CardTitle className={'text-sm font-medium'}>This Week</CardTitle>
            <CalendarIcon aria-hidden className={'size-4 text-muted-foreground'} />
          </CardHeader>
          <CardContent>
            <div className={'text-2xl font-bold'}>9</div>
            <p className={'text-xs text-muted-foreground'}>new features created</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className={'grid gap-6 lg:grid-cols-2'}>
        {/* Top Performers */}
        <Card>
          <CardHeader>
            <div className={'flex items-center justify-between'}>
              <CardTitle>Top Performing Features</CardTitle>
              <Select defaultValue={'views'}>
                <SelectTrigger className={'w-[120px]'}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={'views'}>Views</SelectItem>
                  <SelectItem value={'ctr'}>Click Rate</SelectItem>
                  <SelectItem value={'engagement'}>Engagement</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className={'space-y-4'}>
              {mockAnalytics.topPerformers.map((performer, index) => (
                <div className={'flex items-center justify-between'} key={performer.name}>
                  <div className={'flex items-center gap-3'}>
                    <div
                      className={
                        'flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium'
                      }
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className={'text-sm font-medium'}>{performer.name}</p>
                      <p className={'text-xs text-muted-foreground capitalize'}>{performer.type}</p>
                    </div>
                  </div>
                  <div className={'text-right'}>
                    <p className={'text-sm font-medium'}>{performer.views.toLocaleString()}</p>
                    <p className={'text-xs text-muted-foreground'}>{performer.ctr}% CTR</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className={'flex items-center justify-between'}>
              <CardTitle>Recent Activity</CardTitle>
              <Select defaultValue={'7days'}>
                <SelectTrigger className={'w-[120px]'}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={'7days'}>Last 7 days</SelectItem>
                  <SelectItem value={'30days'}>Last 30 days</SelectItem>
                  <SelectItem value={'90days'}>Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className={'space-y-4'}>
              {mockAnalytics.recentActivity.map((day) => (
                <div className={'flex items-center justify-between'} key={day.date}>
                  <div className={'flex items-center gap-3'}>
                    <div className={'h-2 w-2 rounded-full bg-blue-500'} />
                    <div>
                      <p className={'text-sm font-medium'}>
                        {new Date(day.date).toLocaleDateString('en-US', {
                          day: 'numeric',
                          month: 'short',
                          weekday: 'short',
                        })}
                      </p>
                      <p className={'text-xs text-muted-foreground'}>
                        {day.features} feature{day.features !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className={'text-right'}>
                    <p className={'text-sm font-medium'}>{day.views.toLocaleString()}</p>
                    <p className={'text-xs text-muted-foreground'}>views</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Type Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Type Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={'grid gap-4 md:grid-cols-2 lg:grid-cols-4'}>
            <div className={'rounded-lg bg-blue-50 p-4'}>
              <div className={'mb-2 flex items-center gap-2'}>
                <div className={'h-3 w-3 rounded-full bg-blue-500'} />
                <span className={'text-sm font-medium'}>Homepage Banner</span>
              </div>
              <div className={'text-2xl font-bold text-blue-600'}>24.5K</div>
              <p className={'text-xs text-muted-foreground'}>avg views per feature</p>
            </div>

            <div className={'rounded-lg bg-green-50 p-4'}>
              <div className={'mb-2 flex items-center gap-2'}>
                <div className={'h-3 w-3 rounded-full bg-green-500'} />
                <span className={'text-sm font-medium'}>Editor Pick</span>
              </div>
              <div className={'text-2xl font-bold text-green-600'}>8.2K</div>
              <p className={'text-xs text-muted-foreground'}>avg views per feature</p>
            </div>

            <div className={'rounded-lg bg-yellow-50 p-4'}>
              <div className={'mb-2 flex items-center gap-2'}>
                <div className={'h-3 w-3 rounded-full bg-yellow-500'} />
                <span className={'text-sm font-medium'}>Trending</span>
              </div>
              <div className={'text-2xl font-bold text-yellow-600'}>12.1K</div>
              <p className={'text-xs text-muted-foreground'}>avg views per feature</p>
            </div>

            <div className={'rounded-lg bg-purple-50 p-4'}>
              <div className={'mb-2 flex items-center gap-2'}>
                <div className={'h-3 w-3 rounded-full bg-purple-500'} />
                <span className={'text-sm font-medium'}>Collection of Week</span>
              </div>
              <div className={'text-2xl font-bold text-purple-600'}>15.8K</div>
              <p className={'text-xs text-muted-foreground'}>avg views per feature</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
