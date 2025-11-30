'use client';

import type { LucideIcon } from 'lucide-react';

import {
  ArrowDownIcon,
  ArrowUpIcon,
  BarChart3Icon,
  CalendarIcon,
  ClockIcon,
  TrendingUpIcon,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Conditional } from '@/components/ui/conditional';
import { formatCurrency } from '@/lib/utils/currency.utils';
import { cn } from '@/utils/tailwind-utils';

interface EngagementMetricsCardProps {
  change: number; // percentage change
  className?: string;
  format: 'currency' | 'duration' | 'number' | 'percentage';
  isInverseGood?: boolean; // true if lower values are better (e.g., bounce rate)
  timeRange: string;
  title: string;
  value: number;
}

const METRIC_ICONS: Record<string, LucideIcon> = {
  'avg view duration': ClockIcon,
  'bounce rate': CalendarIcon,
  'total views': BarChart3Icon,
  'unique viewers': TrendingUpIcon,
};

export const EngagementMetricsCard = ({
  change,
  className,
  format,
  isInverseGood = false,
  timeRange,
  title,
  value,
}: EngagementMetricsCardProps) => {
  const formatValue = (val: number, fmt: typeof format) => {
    switch (fmt) {
      case 'currency':
        return formatCurrency(val);
      case 'duration': {
        const minutes = Math.floor(val / 60);
        const seconds = val % 60;
        return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
      }
      case 'number':
        return val.toLocaleString();
      case 'percentage':
        return `${val.toFixed(1)}%`;
      default:
        return val.toString();
    }
  };

  const getChangeColor = () => {
    const isPositiveChange = change > 0;
    const isGoodChange = isInverseGood ? !isPositiveChange : isPositiveChange;

    if (change === 0) return 'text-muted-foreground';
    return isGoodChange ? 'text-green-600' : 'text-red-600';
  };

  const getTimeRangeText = () => {
    switch (timeRange) {
      case '1day':
        return 'vs yesterday';
      case '1year':
        return 'vs last year';
      case '7days':
        return 'vs last week';
      case '30days':
        return 'vs last month';
      case '90days':
        return 'vs last quarter';
      default:
        return 'vs previous period';
    }
  };

  const Icon = METRIC_ICONS[title.toLowerCase()] ?? BarChart3Icon;

  return (
    <Card className={className}>
      <CardHeader className={'flex flex-row items-center justify-between space-y-0 pb-2'}>
        <CardTitle className={'text-sm font-medium text-muted-foreground'}>{title}</CardTitle>
        <Icon aria-hidden className={'size-4 text-muted-foreground'} />
      </CardHeader>
      <CardContent>
        <div className={'space-y-1'}>
          <div className={'text-2xl font-bold tracking-tight'}>{formatValue(value, format)}</div>

          <div className={'flex items-center text-xs'}>
            <Conditional isCondition={change !== 0}>
              <div className={cn('flex items-center gap-1', getChangeColor())}>
                {change > 0 ?
                  <ArrowUpIcon aria-hidden className={'size-3'} />
                : <ArrowDownIcon aria-hidden className={'size-3'} />}
                <span className={'font-medium'}>{Math.abs(change).toFixed(1)}%</span>
              </div>
            </Conditional>

            <Conditional isCondition={change === 0}>
              <div className={'text-muted-foreground'}>
                <span className={'font-medium'}>No change</span>
              </div>
            </Conditional>

            <span className={'ml-1 text-muted-foreground'}>{getTimeRangeText()}</span>
          </div>
        </div>

        {/* Additional context based on metric type */}
        <Conditional isCondition={title === 'Avg View Duration'}>
          <div className={'mt-2 text-xs text-muted-foreground'}>
            {value > 120 ?
              'High engagement'
            : value > 60 ?
              'Good engagement'
            : 'Low engagement'}
          </div>
        </Conditional>

        <Conditional isCondition={title === 'Bounce Rate'}>
          <div className={'mt-2 text-xs text-muted-foreground'}>
            {value < 20 ?
              'Excellent'
            : value < 40 ?
              'Good'
            : value < 60 ?
              'Average'
            : 'Needs improvement'}
          </div>
        </Conditional>

        <Conditional isCondition={title === 'Total Views'}>
          <div className={'mt-2 text-xs text-muted-foreground'}>
            {change > 10 ?
              'Strong growth'
            : change > 0 ?
              'Growing'
            : change === 0 ?
              'Stable'
            : 'Declining'}
          </div>
        </Conditional>

        <Conditional isCondition={title === 'Unique Viewers'}>
          <div className={'mt-2 text-xs text-muted-foreground'}>
            Reach: {((value / 50000) * 100).toFixed(1)}% of target audience
          </div>
        </Conditional>
      </CardContent>
    </Card>
  );
};
