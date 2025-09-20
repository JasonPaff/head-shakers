'use client';

import { CalendarIcon, DownloadIcon, RefreshCwIcon } from 'lucide-react';
import { useState } from 'react';

type ChartData = {
  avgDuration: number;
  date: string;
  uniqueViewers: number;
  views: number;
};

// Type imports for analytics data
type OverviewData = {
  avgViewDuration: number;
  bounceRate: number;
  periodComparison: {
    bounceRate: number;
    duration: number;
    viewers: number;
    views: number;
  };
  totalViewers: number;
  totalViews: number;
};

type TrendingData = {
  averageViewDuration?: number;
  rank: number;
  targetId: string;
  targetType: 'bobblehead' | 'collection' | 'user';
  title: string;
  totalViews: number;
  trendDirection: 'down' | 'up';
  trendPercentage: number;
  uniqueViewers: number;
};
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToggle } from '@/hooks/use-toggle';

import { EngagementMetricsCard } from './engagement-metrics-card';
import { TrendingContentTable } from './trending-content-table';
import { ViewCharts } from './view-charts';

interface ViewAnalyticsDashboardProps {
  chartData: Array<ChartData>;
  className?: string;
  overviewData: OverviewData;
  timeRange: string;
  trendingData: Array<TrendingData>;
}

export const ViewAnalyticsDashboard = ({
  chartData,
  className,
  overviewData,
  timeRange: initialTimeRange,
  trendingData,
}: ViewAnalyticsDashboardProps) => {
  const [timeRange, setTimeRange] = useState(initialTimeRange);
  const [isRefreshing, setIsRefreshing] = useToggle();

  const handleRefresh = async () => {
    setIsRefreshing.on();
    // TODO: refresh server component data
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing.off();
  };

  const handleExport = () => {
    // TODO: export analytics data
    const exportData = {
      chartData,
      exportedAt: new Date().toISOString(),
      overview: overviewData,
      timeRange,
      trending: trendingData,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });

    // TODO: turn into a reusable utility
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
          change={overviewData.periodComparison.views}
          format={'number'}
          timeRange={timeRange}
          title={'Total Views'}
          value={overviewData.totalViews}
        />
        <EngagementMetricsCard
          change={overviewData.periodComparison.viewers}
          format={'number'}
          timeRange={timeRange}
          title={'Unique Viewers'}
          value={overviewData.totalViewers}
        />
        <EngagementMetricsCard
          change={overviewData.periodComparison.duration}
          format={'duration'}
          timeRange={timeRange}
          title={'Avg View Duration'}
          value={overviewData.avgViewDuration}
        />
        <EngagementMetricsCard
          change={overviewData.periodComparison.bounceRate}
          format={'percentage'}
          isInverseGood={true}
          timeRange={timeRange}
          title={'Bounce Rate'}
          value={overviewData.bounceRate}
        />
      </div>

      {/* Charts Section */}
      <div className={'mb-6'}>
        <Card>
          <CardHeader>
            <CardTitle>View Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ViewCharts data={chartData} timeRange={timeRange} />
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
            <TrendingContentTable data={trendingData} timeRange={timeRange} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
