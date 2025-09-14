'use client';

import { parseAsString, useQueryState } from 'nuqs';
import { Children, isValidElement } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type DashboardTabsClientProps = Children;

type DataTab = { 'data-tab'?: string };

const VALID_TABS = ['collections', 'subcollections', 'bobbleheads'] as const;
type ValidTab = (typeof VALID_TABS)[number];

export const DashboardTabsClient = ({ children }: DashboardTabsClientProps) => {
  const [activeTab, setActiveTab] = useQueryState(
    'tab',
    parseAsString.withDefault('collections').withOptions({
      clearOnDefault: true,
    }),
  );

  const tabContents = Children.toArray(children).filter(
    (child) => isValidElement(child) && (child.props as DataTab)['data-tab'],
  );

  const handleTabChange = (value: string) => {
    if (VALID_TABS.includes(value as ValidTab)) {
      void setActiveTab(value === 'collections' ? null : value);
    }
  };

  return (
    <Tabs className={'w-full'} onValueChange={handleTabChange} value={activeTab}>
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
