import 'server-only';

import { ViewAnalyticsDashboard } from '@/components/admin/analytics/view-analytics-dashboard';
import { AnalyticsFacade } from '@/lib/facades/analytics/analytics.facade';

interface AnalyticsDashboardAsyncProps {
  isIncludeAnonymous?: boolean;
  targetType?: 'bobblehead' | 'collection' | 'profile' | 'subcollection';
  timeRange?: 'day' | 'month' | 'week';
}

const randomInt = Math.random() * 50;

export const AnalyticsDashboardAsync = async ({
  isIncludeAnonymous = true,
  targetType,
  timeRange = 'week',
}: AnalyticsDashboardAsyncProps) => {
  const dashboardData = await AnalyticsFacade.getDashboardData({
    isIncludingAnonymous: isIncludeAnonymous,
    targetType,
    timeframe: timeRange,
  });

  // fetch trending content for all types using the facade
  const trendingBobbleheads = await AnalyticsFacade.getTrendingContent('bobblehead', {
    isIncludingAnonymous: isIncludeAnonymous,
    limit: 5,
    timeframe: timeRange,
  });

  const trendingCollections = await AnalyticsFacade.getTrendingContent('collection', {
    isIncludingAnonymous: isIncludeAnonymous,
    limit: 5,
    timeframe: timeRange,
  });

  const trendingProfiles = await AnalyticsFacade.getTrendingContent('profile', {
    isIncludingAnonymous: isIncludeAnonymous,
    limit: 3,
    timeframe: timeRange,
  });

  // combine trending content with additional metadata
  const combinedTrendingData = [
    ...trendingBobbleheads.map((item) => ({
      averageViewDuration: item.averageViewDuration,
      rank: item.rank,
      targetId: item.targetId,
      targetType: 'bobblehead' as const,
      title: `Bobblehead ${item.targetId}`, // this would be replaced with actual titles from content lookup
      totalViews: item.totalViews,
      trendDirection: 'up' as const, // this would be calculated based on recent vs. historical data
      trendPercentage: randomInt, // mock percentage - would be calculated from real data
      uniqueViewers: item.uniqueViewers,
    })),
    ...trendingCollections.map((item) => ({
      averageViewDuration: item.averageViewDuration,
      rank: item.rank + trendingBobbleheads.length,
      targetId: item.targetId,
      targetType: 'collection' as const,
      title: `Collection ${item.targetId}`, // this would be replaced with actual titles from content lookup
      totalViews: item.totalViews,
      trendDirection: 'up' as const, // this would be calculated based on recent vs. historical data
      trendPercentage: randomInt, // Mock percentage - would be calculated from real data
      uniqueViewers: item.uniqueViewers,
    })),
    ...trendingProfiles.map((item) => ({
      averageViewDuration: item.averageViewDuration,
      rank: item.rank + trendingBobbleheads.length + trendingCollections.length,
      targetId: item.targetId,
      targetType: 'user' as const, // map profile to user for consistency with the component
      title: `Profile ${item.targetId}`, // this would be replaced with actual profile names from user lookup
      totalViews: item.totalViews,
      trendDirection: 'up' as const, // this would be calculated based on recent vs historical data
      trendPercentage: randomInt, // mock percentage - would be calculated from real data
      uniqueViewers: item.uniqueViewers,
    })),
  ];

  // get detailed view trends for charts using the facade
  const chartDataRaw = await AnalyticsFacade.getViewTrends({
    groupBy: timeRange === 'day' ? 'hour' : 'day',
    isIncludingAnonymous: isIncludeAnonymous,
    targetType,
  });

  // transform chart data to match the expected format
  const transformedChartData = chartDataRaw.map((item) => ({
    avgDuration: Math.round(item.averageViewDuration || 0),
    date: item.period.split('T')[0] || item.period,
    uniqueViewers: item.uniqueViewers,
    views: item.viewCount,
  }));

  // calculate period comparison (mock for now - would need historical data comparison)
  const periodComparison = {
    bounceRate: -2.1,
    duration: -5.2,
    viewers: 8.9,
    views: 12.8,
  };

  // transform data to match current component expectations
  const overviewData = {
    avgViewDuration: Math.round(dashboardData.averageViewDuration || 0),
    bounceRate: 23.4, // this would need to be calculated from actual bounce data
    periodComparison,
    totalViewers: dashboardData.uniqueViewers,
    totalViews: dashboardData.totalViews,
  };

  return (
    <ViewAnalyticsDashboard
      chartData={transformedChartData}
      overviewData={overviewData}
      timeRange={timeRange}
      trendingData={combinedTrendingData}
    />
  );
};
