'use client';

import { useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ChartDataPoint {
  avgDuration: number;
  date: string;
  uniqueViewers: number;
  views: number;
}

type ChartType = 'area' | 'bar' | 'line';

type MetricType = 'all' | 'duration' | 'viewers' | 'views';
interface ViewChartsProps {
  className?: string;
  data: Array<ChartDataPoint>;
  timeRange: string;
}

export const ViewCharts = ({ className, data, timeRange }: ViewChartsProps) => {
  const [chartType, setChartType] = useState<ChartType>('area');
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('all');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    // format based on time range
    switch (timeRange) {
      case '1day':
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      case '1year':
        return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      case '7days':
        return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', weekday: 'short' });
      case '30days':
      case '90days':
        return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
      default:
        return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  interface CustomTooltipProps {
    isActive?: boolean;
    label?: string;
    payload?: Array<{
      color: string;
      dataKey: string;
      name: string;
      value: number;
    }>;
  }

  const CustomTooltip = ({ isActive, label, payload }: CustomTooltipProps) => {
    if (isActive && payload && payload.length) {
      return (
        <div className={'rounded-lg border bg-background p-3 shadow-md'}>
          <p className={'mb-2 font-medium'}>{formatDate(label as string)}</p>
          {payload.map((entry, index: number) => (
            <p className={'text-sm'} key={index} style={{ color: entry.color }}>
              {entry.name}:{' '}
              {entry.dataKey === 'avgDuration' ? formatDuration(entry.value) : entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const getMetricData = () => {
    switch (selectedMetric) {
      case 'duration':
        return data.map((item) => ({ ...item, value: item.avgDuration }));
      case 'viewers':
        return data.map((item) => ({ ...item, value: item.uniqueViewers }));
      case 'views':
        return data.map((item) => ({ ...item, value: item.views }));
      default:
        return data;
    }
  };

  const renderChart = () => {
    const chartData = getMetricData();

    const commonProps = {
      data: chartData,
      margin: { bottom: 5, left: 20, right: 30, top: 20 },
    };

    // create axis configuration following project naming conventions
    const createXAxisConfig = () => ({
      dataKey: 'date',
      tick: { fontSize: 12 },
      tickFormatter: formatDate,
    });

    const createYAxisConfig = () => ({
      tick: { fontSize: 12 },
      tickFormatter: (value: number) => {
        if (selectedMetric === 'duration') {
          return `${Math.floor(value / 60)}m`;
        }
        return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toString();
      },
    });

    const xAxisConfig = createXAxisConfig();
    const yAxisConfig = createYAxisConfig();

    if (selectedMetric !== 'all') {
      // single metric charts
      switch (chartType) {
        case 'area':
          return (
            <AreaChart {...commonProps}>
              <CartesianGrid stroke={'hsl(var(--border))'} strokeDasharray={'3 3'} />
              <XAxis {...xAxisConfig} />
              <YAxis {...yAxisConfig} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                dataKey={'value'}
                fill={'hsl(var(--primary))'}
                fillOpacity={0.3}
                stroke={'hsl(var(--primary))'}
                type={'monotone'}
              />
            </AreaChart>
          );

        case 'bar':
          return (
            <BarChart {...commonProps}>
              <CartesianGrid stroke={'hsl(var(--border))'} strokeDasharray={'3 3'} />
              <XAxis {...xAxisConfig} />
              <YAxis {...yAxisConfig} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey={'value'} fill={'hsl(var(--primary))'} radius={[2, 2, 0, 0]} />
            </BarChart>
          );

        case 'line':
          return (
            <LineChart {...commonProps}>
              <CartesianGrid stroke={'hsl(var(--border))'} strokeDasharray={'3 3'} />
              <XAxis {...xAxisConfig} />
              <YAxis {...yAxisConfig} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                activeDot={{ r: 4 }}
                dataKey={'value'}
                dot={false}
                stroke={'hsl(var(--primary))'}
                strokeWidth={2}
                type={'monotone'}
              />
            </LineChart>
          );
      }
    } else {
      // multi-metric charts
      switch (chartType) {
        case 'area':
          return (
            <AreaChart {...commonProps}>
              <CartesianGrid stroke={'hsl(var(--border))'} strokeDasharray={'3 3'} />
              <XAxis {...xAxisConfig} />
              <YAxis {...yAxisConfig} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                dataKey={'views'}
                fill={'hsl(var(--chart-1))'}
                fillOpacity={0.6}
                name={'Views'}
                stackId={'1'}
                stroke={'hsl(var(--chart-1))'}
                type={'monotone'}
              />
              <Area
                dataKey={'uniqueViewers'}
                fill={'hsl(var(--chart-2))'}
                fillOpacity={0.6}
                name={'Unique Viewers'}
                stackId={'1'}
                stroke={'hsl(var(--chart-2))'}
                type={'monotone'}
              />
            </AreaChart>
          );

        case 'bar':
          return (
            <BarChart {...commonProps}>
              <CartesianGrid stroke={'hsl(var(--border))'} strokeDasharray={'3 3'} />
              <XAxis {...xAxisConfig} />
              <YAxis {...yAxisConfig} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey={'views'} fill={'hsl(var(--chart-1))'} name={'Views'} radius={[2, 2, 0, 0]} />
              <Bar
                dataKey={'uniqueViewers'}
                fill={'hsl(var(--chart-2))'}
                name={'Unique Viewers'}
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          );

        case 'line':
          return (
            <LineChart {...commonProps}>
              <CartesianGrid stroke={'hsl(var(--border))'} strokeDasharray={'3 3'} />
              <XAxis {...xAxisConfig} />
              <YAxis {...yAxisConfig} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                dataKey={'views'}
                dot={false}
                name={'Views'}
                stroke={'hsl(var(--chart-1))'}
                strokeWidth={2}
                type={'monotone'}
              />
              <Line
                dataKey={'uniqueViewers'}
                dot={false}
                name={'Unique Viewers'}
                stroke={'hsl(var(--chart-2))'}
                strokeWidth={2}
                type={'monotone'}
              />
              <Line
                dataKey={'avgDuration'}
                dot={false}
                name={'Avg Duration (s)'}
                stroke={'hsl(var(--chart-3))'}
                strokeWidth={2}
                type={'monotone'}
                yAxisId={'duration'}
              />
              <YAxis
                orientation={'right'}
                tick={{ fontSize: 12 }}
                tickFormatter={(value: number) => `${Math.floor(value / 60)}m`}
                yAxisId={'duration'}
              />
            </LineChart>
          );
      }
    }
  };

  return (
    <div className={className}>
      {/* Chart Controls */}
      <div className={'mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'}>
        <div className={'flex flex-wrap items-center gap-3'}>
          <div className={'flex items-center gap-2'}>
            <span className={'text-sm font-medium'}>Chart Type:</span>
            <div className={'flex rounded-lg border'}>
              {(['line', 'area', 'bar'] as Array<ChartType>).map((type) => (
                <Button
                  className={'h-8 px-3 text-xs capitalize'}
                  key={type}
                  onClick={() => setChartType(type)}
                  size={'sm'}
                  variant={chartType === type ? 'default' : 'ghost'}
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>

          <div className={'flex items-center gap-2'}>
            <span className={'text-sm font-medium'}>Metric:</span>
            <Select onValueChange={(value: MetricType) => setSelectedMetric(value)} value={selectedMetric}>
              <SelectTrigger className={'w-[140px]'}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={'all'}>All Metrics</SelectItem>
                <SelectItem value={'views'}>Views</SelectItem>
                <SelectItem value={'viewers'}>Unique Viewers</SelectItem>
                <SelectItem value={'duration'}>Avg Duration</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Legend for multi-metric view */}
        {selectedMetric === 'all' && (
          <div className={'flex flex-wrap items-center gap-4 text-xs'}>
            <div className={'flex items-center gap-2'}>
              <div className={'h-3 w-3 rounded-full bg-[hsl(var(--chart-1))]'} />
              <span>Views</span>
            </div>
            <div className={'flex items-center gap-2'}>
              <div className={'h-3 w-3 rounded-full bg-[hsl(var(--chart-2))]'} />
              <span>Unique Viewers</span>
            </div>
            {chartType === 'line' && (
              <div className={'flex items-center gap-2'}>
                <div className={'h-3 w-3 rounded-full bg-[hsl(var(--chart-3))]'} />
                <span>Avg Duration</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Chart Container */}
      <div className={'h-[400px] w-full'}>
        <ResponsiveContainer height={'100%'} width={'100%'}>
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Chart Summary */}
      <div className={'mt-4 grid gap-4 rounded-lg bg-muted/30 p-4 sm:grid-cols-3'}>
        <div className={'text-center'}>
          <div className={'text-lg font-semibold text-[hsl(var(--chart-1))]'}>
            {Math.max(...data.map((d) => d.views)).toLocaleString()}
          </div>
          <div className={'text-sm text-muted-foreground'}>Peak Views</div>
        </div>
        <div className={'text-center'}>
          <div className={'text-lg font-semibold text-[hsl(var(--chart-2))]'}>
            {Math.max(...data.map((d) => d.uniqueViewers)).toLocaleString()}
          </div>
          <div className={'text-sm text-muted-foreground'}>Peak Viewers</div>
        </div>
        <div className={'text-center'}>
          <div className={'text-lg font-semibold text-[hsl(var(--chart-3))]'}>
            {formatDuration(Math.max(...data.map((d) => d.avgDuration)))}
          </div>
          <div className={'text-sm text-muted-foreground'}>Peak Duration</div>
        </div>
      </div>
    </div>
  );
};
