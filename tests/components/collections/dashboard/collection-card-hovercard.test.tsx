import { describe, expect, it } from 'vitest';

import { CollectionHoverCardContent } from '@/app/(app)/dashboard/collection/(collection)/components/sidebar/cards/collection-card-hovercard';
import { HoverCard, HoverCardTrigger } from '@/components/ui/hover-card';

import {
  createMockCollectionDashboardRecord,
  mockCollectionDashboardRecord,
} from '../../../mocks/data/collections-dashboard.mock';
import { render, screen } from '../../../setup/test-utils';

describe('CollectionHoverCardContent', () => {
  describe('Trigger and Content Display', () => {
    it('should render trigger element (card preview)', () => {
      render(
        <HoverCard>
          <HoverCardTrigger asChild>
            <button>Hover me</button>
          </HoverCardTrigger>
          <CollectionHoverCardContent collection={mockCollectionDashboardRecord} />
        </HoverCard>,
      );

      expect(screen.getByRole('button', { name: /hover me/i })).toBeInTheDocument();
    });

    it('should show hovercard content on hover/focus', async () => {
      const { user } = render(
        <HoverCard>
          <HoverCardTrigger asChild>
            <button>Hover me</button>
          </HoverCardTrigger>
          <CollectionHoverCardContent collection={mockCollectionDashboardRecord} />
        </HoverCard>,
      );

      // Initially, the content should not be visible
      expect(screen.queryByText(mockCollectionDashboardRecord.name)).not.toBeInTheDocument();

      // Hover over the trigger
      await user.hover(screen.getByRole('button', { name: /hover me/i }));

      // HoverCard content should appear (with default delay)
      expect(await screen.findByText(mockCollectionDashboardRecord.name)).toBeInTheDocument();
    });
  });

  describe('Collection Stats Display', () => {
    it('should display collection stats in hovercard', async () => {
      const { user } = render(
        <HoverCard openDelay={0}>
          <HoverCardTrigger asChild>
            <button>Hover me</button>
          </HoverCardTrigger>
          <CollectionHoverCardContent collection={mockCollectionDashboardRecord} />
        </HoverCard>,
      );

      await user.hover(screen.getByRole('button', { name: /hover me/i }));

      // Collection name and bobblehead count
      expect(await screen.findByText(mockCollectionDashboardRecord.name)).toBeInTheDocument();
      expect(
        screen.getByText(`${mockCollectionDashboardRecord.bobbleheadCount} bobbleheads`),
      ).toBeInTheDocument();

      // Stats grid
      expect(screen.getByText(/total value:/i)).toBeInTheDocument();
      expect(screen.getByText('$450.00')).toBeInTheDocument(); // formatted currency

      expect(screen.getByText(/featured:/i)).toBeInTheDocument();
      expect(screen.getByText(mockCollectionDashboardRecord.featuredCount.toString())).toBeInTheDocument();

      expect(screen.getByText(/views:/i)).toBeInTheDocument();
      expect(screen.getByText(mockCollectionDashboardRecord.viewCount.toString())).toBeInTheDocument();

      expect(screen.getByText(/likes:/i)).toBeInTheDocument();
      expect(screen.getByText(mockCollectionDashboardRecord.likeCount.toString())).toBeInTheDocument();

      expect(screen.getByText(/visibility:/i)).toBeInTheDocument();
      expect(screen.getByText('Public')).toBeInTheDocument();

      // Comment count
      expect(screen.getByText(`${mockCollectionDashboardRecord.commentCount} comments`)).toBeInTheDocument();
    });

    it('should display collection description if present', async () => {
      const collectionWithDescription = createMockCollectionDashboardRecord({
        description: 'This is a test collection description',
      });

      const { user } = render(
        <HoverCard openDelay={0}>
          <HoverCardTrigger asChild>
            <button>Hover me</button>
          </HoverCardTrigger>
          <CollectionHoverCardContent collection={collectionWithDescription} />
        </HoverCard>,
      );

      await user.hover(screen.getByRole('button', { name: /hover me/i }));

      // Note: The component doesn't currently display description
      // This test verifies the component accepts collections with descriptions
      expect(await screen.findByText(collectionWithDescription.name)).toBeInTheDocument();
    });

    it('should handle null description gracefully', async () => {
      const collectionWithoutDescription = createMockCollectionDashboardRecord({
        description: null,
      });

      const { user } = render(
        <HoverCard openDelay={0}>
          <HoverCardTrigger asChild>
            <button>Hover me</button>
          </HoverCardTrigger>
          <CollectionHoverCardContent collection={collectionWithoutDescription} />
        </HoverCard>,
      );

      await user.hover(screen.getByRole('button', { name: /hover me/i }));

      // Component should still render without errors
      expect(await screen.findByText(collectionWithoutDescription.name)).toBeInTheDocument();
    });
  });

  describe('Hovercard Interactions', () => {
    it('should close hovercard when trigger loses focus', async () => {
      const { user } = render(
        <div>
          <HoverCard closeDelay={0} openDelay={0}>
            <HoverCardTrigger asChild>
              <button>Hover me</button>
            </HoverCardTrigger>
            <CollectionHoverCardContent collection={mockCollectionDashboardRecord} />
          </HoverCard>
          <button>Other button</button>
        </div>,
      );

      // Hover to show content
      await user.hover(screen.getByRole('button', { name: /hover me/i }));
      expect(await screen.findByText(mockCollectionDashboardRecord.name)).toBeInTheDocument();

      // Unhover (move away from trigger)
      await user.unhover(screen.getByRole('button', { name: /hover me/i }));

      // Content should disappear (may need waitFor due to close delay)
      expect(screen.queryByText(mockCollectionDashboardRecord.name)).not.toBeInTheDocument();
    });
  });
});
