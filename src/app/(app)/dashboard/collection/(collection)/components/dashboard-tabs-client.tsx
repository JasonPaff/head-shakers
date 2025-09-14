'use client';

import { Children, isValidElement } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type DashboardTabsClientProps = Children;

type DataTab = { 'data-tab'?: string };

export const DashboardTabsClient = ({ children }: DashboardTabsClientProps) => {
  const tabContents = Children.toArray(children).filter(
    (child) => isValidElement(child) && (child.props as DataTab)['data-tab'],
  );

  return (
    <Tabs className={'w-full'} defaultValue={'collections'}>
      <TabsList className={'grid w-full grid-cols-3'}>
        <TabsTrigger value={'collections'}>Collections</TabsTrigger>
        <TabsTrigger value={'subcollections'}>Subcollections</TabsTrigger>
        <TabsTrigger value={'bobbleheads'}>Bobbleheads</TabsTrigger>
      </TabsList>

      {tabContents.map((child) => {
        if (isValidElement(child)) {
          const tabValue = (child.props as DataTab)['data-tab']!;
          return (
            <TabsContent key={tabValue} value={tabValue}>
              {child}
            </TabsContent>
          );
        }
        return null;
      })}
    </Tabs>
  );
};
