'use client';

import { Activity, Clock, Coins, Zap } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ExecutionMetric {
  completionTokens?: number;
  executionTimeMs?: number;
  icon: React.ElementType;
  label: string;
  promptTokens?: number;
  totalTokens?: number;
  value: number | string;
}

interface ExecutionMetricsProps {
  completionTokens?: number;
  executionTimeMs?: number;
  promptTokens?: number;
  retryCount?: number;
  status?: string;
  totalTokens?: number;
}

export const ExecutionMetrics = ({
  completionTokens = 0,
  executionTimeMs = 0,
  promptTokens = 0,
  retryCount = 0,
  status = 'unknown',
  totalTokens = 0,
}: ExecutionMetricsProps) => {
  const metrics: ExecutionMetric[] = [
    {
      icon: Clock,
      label: 'Execution Time',
      value: executionTimeMs ? `${(executionTimeMs / 1000).toFixed(2)}s` : 'N/A',
    },
    {
      icon: Coins,
      label: 'Total Tokens',
      totalTokens,
      value: totalTokens.toLocaleString(),
    },
    {
      icon: Activity,
      label: 'Prompt Tokens',
      promptTokens,
      value: promptTokens.toLocaleString(),
    },
    {
      completionTokens,
      icon: Zap,
      label: 'Completion Tokens',
      value: completionTokens.toLocaleString(),
    },
  ];

  const tokenUtilization = totalTokens > 0 ? ((completionTokens / totalTokens) * 100).toFixed(1) : '0';

  return (
    <Card>
      <CardHeader>
        <CardTitle className={'text-sm font-medium'}>Execution Metrics</CardTitle>
        <CardDescription className={'flex items-center gap-2'}>
          Status:{' '}
          <Badge
            variant={
              status === 'completed' ? 'default'
              : status === 'failed' ?
                'destructive'
              : 'secondary'
            }
          >
            {status}
          </Badge>
          {retryCount > 0 && <Badge variant={'outline'}>{retryCount} retries</Badge>}
        </CardDescription>
      </CardHeader>
      <CardContent className={'space-y-4'}>
        <div className={'grid grid-cols-2 gap-3'}>
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div className={'flex items-center gap-3'} key={metric.label}>
                <div className={'flex size-8 items-center justify-center rounded-lg bg-primary/10'}>
                  <Icon className={'size-4 text-primary'} />
                </div>
                <div className={'flex-1'}>
                  <p className={'text-xs text-muted-foreground'}>{metric.label}</p>
                  <p className={'text-sm font-semibold'}>{metric.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Token Utilization */}
        {totalTokens > 0 && (
          <div className={'space-y-2'}>
            <div className={'flex items-center justify-between text-xs'}>
              <span className={'text-muted-foreground'}>Token Utilization</span>
              <span className={'font-medium'}>{tokenUtilization}% output</span>
            </div>
            <Progress className={'h-2'} value={Number(tokenUtilization)} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
