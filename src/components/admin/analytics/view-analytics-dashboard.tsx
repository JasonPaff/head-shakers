'use client';

import { CalendarIcon, DownloadIcon, RefreshCwIcon } from 'lucide-react';
import { useState } from 'react';

// Type imports for future use when integrating with real server actions
// import type { TrendingContentResult } from '@/lib/facades/analytics/analytics.facade';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { EngagementMetricsCard } from './engagement-metrics-card';
import { TrendingContentTable } from './trending-content-table';
import { ViewCharts } from './view-charts';

interface ViewAnalyticsDashboardProps {
  className?: string;
}

export const ViewAnalyticsDashboard = ({ className }: ViewAnalyticsDashboardProps) => {
  const [timeRange, setTimeRange] = useState('7days');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock data - in real implementation, this would come from TanStack Query hooks
  const mockOverviewData = {
    avgViewDuration: 142, // seconds
    bounceRate: 23.4, // percentage
    periodComparison: {
      bounceRate: -2.1,
      duration: -5.2,
      viewers: 8.9,
      views: 12.8, // percentage change
    },
    totalViewers: 12450,
    totalViews: 156780,
  };

  // TODO: Replace with real server action calls in future implementation
  const mockTrendingData = [
    {
      averageViewDuration: 180,
      rank: 1,
      targetId: '1',
      targetType: 'collection' as const,
      title: 'Baseball Legends Collection',
      totalViews: 8420,
      trendDirection: 'up' as const,
      trendPercentage: 24.5,
      uniqueViewers: 1240,
    },
    {
      averageViewDuration: 95,
      rank: 2,
      targetId: '2',
      targetType: 'bobblehead' as const,
      title: 'Vintage Mickey Mouse',
      totalViews: 6340,
      trendDirection: 'up' as const,
      trendPercentage: 18.2,
      uniqueViewers: 890,
    },
    {
      averageViewDuration: 120,
      rank: 3,
      targetId: '3',
      targetType: 'user' as const,
      title: 'John Collector Profile',
      totalViews: 4890,
      trendDirection: 'down' as const,
      trendPercentage: -3.1,
      uniqueViewers: 670,
    },
  ];

  const mockChartData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const dateString = date.toISOString().split('T')[0];
    return {
      avgDuration: Math.floor(Math.random() * 60) + 90,
      date: dateString || '',
      uniqueViewers: Math.floor(Math.random() * 200) + 100,
      views: Math.floor(Math.random() * 1000) + 500,
    };
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // In real implementation, this would invalidate and refetch queries
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const handleExport = () => {
    // In real implementation, this would export analytics data
    const exportData = {
      chartData: mockChartData,
      exportedAt: new Date().toISOString(),
      overview: mockOverviewData,
      timeRange,
      trending: mockTrendingData,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `view-analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={className}>
      {/* Header with Controls */}
      <div className={'mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between'}>
        <div>
          <h2 className={'text-2xl font-bold'}>View Analytics Dashboard</h2>
          <p className={'text-muted-foreground'}>
            Monitor content engagement and user behavior patterns across the platform.
          </p>
        </div>

        <div className={'flex flex-wrap gap-2'}>
          <Select onValueChange={setTimeRange} value={timeRange}>
            <SelectTrigger className={'w-[140px]'}>
              <CalendarIcon aria-hidden className={'mr-2 size-4'} />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={'1day'}>Last 24 hours</SelectItem>
              <SelectItem value={'7days'}>Last 7 days</SelectItem>
              <SelectItem value={'30days'}>Last 30 days</SelectItem>
              <SelectItem value={'90days'}>Last 90 days</SelectItem>
              <SelectItem value={'1year'}>Last year</SelectItem>
            </SelectContent>
          </Select>

          <Button
            className={'min-w-[100px]'}
            disabled={isRefreshing}
            onClick={handleRefresh}
            size={'sm'}
            variant={'outline'}
          >
            <RefreshCwIcon aria-hidden className={`mr-2 size-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>

          <Button onClick={handleExport} size={'sm'} variant={'outline'}>
            <DownloadIcon aria-hidden className={'mr-2 size-4'} />
            Export Data
          </Button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className={'mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4'}>
        <EngagementMetricsCard
          change={mockOverviewData.periodComparison.views}
          format={'number'}
          timeRange={timeRange}
          title={'Total Views'}
          value={mockOverviewData.totalViews}
        />
        <EngagementMetricsCard
          change={mockOverviewData.periodComparison.viewers}
          format={'number'}
          timeRange={timeRange}
          title={'Unique Viewers'}
          value={mockOverviewData.totalViewers}
        />
        <EngagementMetricsCard
          change={mockOverviewData.periodComparison.duration}
          format={'duration'}
          timeRange={timeRange}
          title={'Avg View Duration'}
          value={mockOverviewData.avgViewDuration}
        />
        <EngagementMetricsCard
          change={mockOverviewData.periodComparison.bounceRate}
          format={'percentage'}
          isInverseGood={true}
          timeRange={timeRange}
          title={'Bounce Rate'}
          value={mockOverviewData.bounceRate}
        />
      </div>

      {/* Charts Section */}
      <div className={'mb-6'}>
        <Card>
          <CardHeader>
            <CardTitle>View Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ViewCharts data={mockChartData} timeRange={timeRange} />
          </CardContent>
        </Card>
      </div>

      {/* Trending Content */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Trending Content</CardTitle>
          </CardHeader>
          <CardContent>
            <TrendingContentTable data={mockTrendingData} timeRange={timeRange} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};