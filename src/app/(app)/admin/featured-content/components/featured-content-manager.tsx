'use client';

import { useMemo, useState } from 'react';

import type { AdminFeaturedContent } from '@/lib/facades/admin/admin.facade';

import { FeaturedContentForm } from '@/app/(app)/admin/featured-content/components/featured-content-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Conditional } from '@/components/ui/conditional';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToggle } from '@/hooks/use-toggle';

import { ContentSuggestions } from './content-suggestions';
import { FeaturedContentAnalytics } from './featured-content-analytics';
import { FeaturedContentList } from './featured-content-list';

interface FeaturedContentManagerProps {
  initialData: Array<AdminFeaturedContent>;
}

export const FeaturedContentManager = ({ initialData = [] }: FeaturedContentManagerProps) => {
  const [activeTab, setActiveTab] = useState('list');
  const [isShowCreateForm, setIsShowCreateForm] = useToggle();
  const [editingContent, setEditingContent] = useState<null | string>(null);

  const activeFeatures = useMemo(() => {
    return initialData.filter((item) => {
      return item.isActive;
    }).length;
  }, [initialData]);

  const editorPicks = useMemo(() => {
    return initialData.filter((item) => {
      return item.isActive && item.featureType === 'editor_pick';
    }).length;
  }, [initialData]);

  const homepageBanners = useMemo(() => {
    return initialData.filter((item) => {
      return item.isActive && item.featureType === 'homepage_banner';
    }).length;
  }, [initialData]);

  const totalViews = useMemo(() => {
    return initialData.reduce((sum, item) => {
      return sum + item.viewCount;
    }, 0);
  }, [initialData]);

  const handleCreate = () => {
    setEditingContent(null);
    setIsShowCreateForm.on();
    setActiveTab('form');
  };

  const handleEdit = (contentId: string) => {
    setEditingContent(contentId);
    setIsShowCreateForm.off();
    setActiveTab('form');
  };

  const handleFormClose = () => {
    setIsShowCreateForm.off();
    setEditingContent(null);
    setActiveTab('list');
  };

  return (
    <div className={'space-y-6'}>
      {/* Quick Stats */}
      <div className={'grid gap-4 md:grid-cols-2 lg:grid-cols-4'}>
        <Card>
          <CardHeader className={'flex flex-row items-center justify-between space-y-0 pb-2'}>
            <CardTitle className={'text-sm font-medium'}>Active Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={'text-2xl font-bold'}>{activeFeatures}</div>
            <p className={'text-xs text-muted-foreground'}>Currently active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className={'flex flex-row items-center justify-between space-y-0 pb-2'}>
            <CardTitle className={'text-sm font-medium'}>Total Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={'text-2xl font-bold'}>{totalViews.toLocaleString()}</div>
            <p className={'text-xs text-muted-foreground'}>Total views</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className={'flex flex-row items-center justify-between space-y-0 pb-2'}>
            <CardTitle className={'text-sm font-medium'}>Homepage Banner</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={'text-2xl font-bold'}>{homepageBanners}</div>
            <p className={'text-xs text-muted-foreground'}>Currently active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className={'flex flex-row items-center justify-between space-y-0 pb-2'}>
            <CardTitle className={'text-sm font-medium'}>Editor Picks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={'text-2xl font-bold'}>{editorPicks}</div>
            <p className={'text-xs text-muted-foreground'}>Active selections</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs onValueChange={setActiveTab} value={activeTab}>
        <div className={'flex items-center justify-between'}>
          <TabsList>
            <TabsTrigger value={'list'}>Featured Content</TabsTrigger>
            <TabsTrigger value={'suggestions'}>Suggestions</TabsTrigger>
            <TabsTrigger value={'analytics'}>Analytics</TabsTrigger>
            <Conditional isCondition={isShowCreateForm || !!editingContent}>
              <TabsTrigger value={'form'}>{isShowCreateForm ? 'Create Feature' : 'Edit Feature'}</TabsTrigger>
            </Conditional>
          </TabsList>
          <Conditional isCondition={activeTab === 'list'}>
            <Button onClick={handleCreate}>Create Featured Content</Button>
          </Conditional>
        </div>

        <TabsContent className={'space-y-4'} value={'list'}>
          <FeaturedContentList initialData={initialData} onEdit={handleEdit} />
        </TabsContent>

        <TabsContent className={'space-y-4'} value={'suggestions'}>
          <ContentSuggestions onFeature={handleCreate} />
        </TabsContent>

        <TabsContent className={'space-y-4'} value={'analytics'}>
          <FeaturedContentAnalytics />
        </TabsContent>

        <Conditional isCondition={isShowCreateForm || !!editingContent}>
          <TabsContent className={'space-y-4'} value={'form'}>
            <FeaturedContentForm
              contentId={editingContent}
              onClose={handleFormClose}
              onSuccess={() => {
                handleFormClose();
              }}
            />
          </TabsContent>
        </Conditional>
      </Tabs>
    </div>
  );
};
