import { PackageIcon, ViewIcon } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface DashboardStatsProps {
  stats: {
    bobbleheads: number;
    collections: number;
  };
}

export const DashboardStats = ({ stats }: DashboardStatsProps) => {
  const statItems = [
    {
      icon: ViewIcon,
      label: 'Collections',
      value: stats.collections,
    },
    {
      icon: PackageIcon,
      label: 'Bobbleheads',
      value: stats.bobbleheads,
    },
  ];

  return (
    <div className={'grid grid-cols-1 gap-4 sm:grid-cols-2'}>
      {statItems.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.label}>
            <CardContent className={'flex items-center gap-3 p-4'}>
              <div className={'rounded-md bg-primary/10 p-2'}>
                <Icon aria-hidden className={'size-5 text-primary'} />
              </div>
              <div>
                <p className={'text-sm text-muted-foreground'}>{item.label}</p>
                <Badge className={'text-lg font-semibold'} variant={'secondary'}>
                  {item.value}
                </Badge>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
