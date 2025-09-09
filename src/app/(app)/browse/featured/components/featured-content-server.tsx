import {
  getCollectionOfWeek,
  getEditorPicks,
  getHomepageBanner,
  getTrendingContent,
  incrementViewCount,
} from '@/lib/queries/featured-content.queries';

import { FeaturedContentDisplay } from './featured-content-display';

export interface FeaturedContentServerProps {
  isTrackViews?: boolean;
}

export async function FeaturedContentServer({ isTrackViews = false }: FeaturedContentServerProps) {
  try {
    console.log('FeaturedContentServer: Fetching featured content data');

    // fetch all featured content sections in parallel
    const [homepageBanner, editorPicks, collectionOfWeek, trending] = await Promise.all([
      getHomepageBanner(),
      getEditorPicks(),
      getCollectionOfWeek(),
      getTrendingContent(),
    ]);

    console.log('FeaturedContentServer: Data fetched successfully', {
      collectionOfWeek: collectionOfWeek.length,
      editorPicks: editorPicks.length,
      homepageBanner: homepageBanner.length,
      trending: trending.length,
    });

    // transform data to match the expected format
    const featuredContentData = {
      collection_of_week: collectionOfWeek.map((content) => ({
        comments: content.comments || 0,
        contentId: content.contentId,
        contentType: content.contentType,
        description: content.description || '',
        endDate: content.endDate?.toISOString().split('T')[0] || null,
        id: content.id,
        imageUrl: content.imageUrl || null,
        likes: content.likes || 0,
        owner: content.owner || 'Unknown',
        ownerDisplayName: content.ownerDisplayName || content.owner || 'Unknown',
        priority: content.priority,
        startDate: (content.startDate || new Date()).toISOString().split('T')[0]!,
        title: content.title || '',
        viewCount: content.viewCount,
      })),
      editor_pick: editorPicks.map((content) => ({
        comments: content.comments || 0,
        contentId: content.contentId,
        contentType: content.contentType,
        description: content.description || '',
        endDate: content.endDate?.toISOString().split('T')[0] || null,
        id: content.id,
        imageUrl: content.imageUrl || null,
        likes: content.likes || 0,
        owner: content.owner || 'Unknown',
        ownerDisplayName: content.ownerDisplayName || content.owner || 'Unknown',
        priority: content.priority,
        startDate: (content.startDate || new Date()).toISOString().split('T')[0]!,
        title: content.title || '',
        viewCount: content.viewCount,
      })),
      homepage_banner: homepageBanner.map((content) => ({
        comments: content.comments || 0,
        contentId: content.contentId,
        contentType: content.contentType,
        description: content.description || '',
        endDate: content.endDate?.toISOString().split('T')[0] || null,
        id: content.id,
        imageUrl: content.imageUrl || null,
        likes: content.likes || 0,
        owner: content.owner || 'Unknown',
        ownerDisplayName: content.ownerDisplayName || content.owner || 'Unknown',
        priority: content.priority,
        startDate: (content.startDate || new Date()).toISOString().split('T')[0]!,
        title: content.title || '',
        viewCount: content.viewCount,
      })),
      trending: trending.map((content) => ({
        comments: content.comments || 0,
        contentId: content.contentId,
        contentType: content.contentType,
        description: content.description || '',
        endDate: content.endDate?.toISOString().split('T')[0] || null,
        id: content.id,
        imageUrl: content.imageUrl || null,
        likes: content.likes || 0,
        owner: content.owner || 'Unknown',
        ownerDisplayName: content.ownerDisplayName || content.owner || 'Unknown',
        priority: content.priority,
        startDate: (content.startDate || new Date()).toISOString().split('T')[0]!,
        title: content.title || '',
        viewCount: content.viewCount,
      })),
    };

    return (
      <FeaturedContentDisplay
        featuredContentData={featuredContentData}
        onViewContent={isTrackViews ? incrementViewCount : undefined}
      />
    );
  } catch (error) {
    console.error('Failed to fetch featured content:', error);

    // fallback to empty data structure
    const emptyData = {
      collection_of_week: [],
      editor_pick: [],
      homepage_banner: [],
      trending: [],
    };

    return <FeaturedContentDisplay featuredContentData={emptyData} />;
  }
}
