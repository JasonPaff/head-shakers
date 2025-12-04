import { describe, expect, it } from 'vitest';

import { SidebarCollectionList } from '@/app/(app)/dashboard/collection/(collection)/components/sidebar/sidebar-collection-list';

import { render, screen } from '../../../setup/test-utils';

describe('SidebarCollectionList', () => {
  describe('rendering', () => {
    it('should render children correctly', () => {
      render(
        <SidebarCollectionList cardStyle={'compact'}>
          <div data-testid={'test-child-1'}>Child 1</div>
          <div data-testid={'test-child-2'}>Child 2</div>
          <div data-testid={'test-child-3'}>Child 3</div>
        </SidebarCollectionList>,
      );

      expect(screen.getByTestId('test-child-1')).toBeInTheDocument();
      expect(screen.getByTestId('test-child-2')).toBeInTheDocument();
      expect(screen.getByTestId('test-child-3')).toBeInTheDocument();
    });

    it('should apply space-y-3 class for cover card style', () => {
      render(
        <SidebarCollectionList cardStyle={'cover'}>
          <div>Child</div>
        </SidebarCollectionList>,
      );

      const listContainer = screen.getByText('Child').parentElement;
      expect(listContainer).toHaveClass('space-y-3');
      expect(listContainer).not.toHaveClass('space-y-2');
    });

    it('should apply space-y-2 class for non-cover card styles', () => {
      render(
        <SidebarCollectionList cardStyle={'compact'}>
          <div>Child</div>
        </SidebarCollectionList>,
      );

      const listContainer = screen.getByText('Child').parentElement;
      expect(listContainer).toHaveClass('space-y-2');
      expect(listContainer).not.toHaveClass('space-y-3');
    });
  });

  describe('layout', () => {
    it('should render container with sidebar-content data-slot', () => {
      render(
        <SidebarCollectionList cardStyle={'compact'}>
          <div>Child</div>
        </SidebarCollectionList>,
      );

      const listContainer = screen.getByText('Child').parentElement;
      expect(listContainer).toHaveAttribute('data-slot', 'sidebar-content');
    });

    it('should apply scrollable overflow styles', () => {
      render(
        <SidebarCollectionList cardStyle={'compact'}>
          <div>Child</div>
        </SidebarCollectionList>,
      );

      const listContainer = screen.getByText('Child').parentElement;
      expect(listContainer).toHaveClass('overflow-y-auto');
    });
  });

  describe('empty state', () => {
    it('should render empty state component when provided as children', () => {
      render(
        <SidebarCollectionList cardStyle={'compact'}>
          <div data-testid={'empty-state'}>No collections found</div>
        </SidebarCollectionList>,
      );

      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('No collections found')).toBeInTheDocument();
    });
  });
});
