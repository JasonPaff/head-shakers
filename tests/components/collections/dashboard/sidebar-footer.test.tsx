import { describe, expect, it } from 'vitest';

import { SidebarFooter } from '@/app/(app)/user/[username]/dashboard/collection/components/sidebar/sidebar-footer';

import { render, screen } from '../../../setup/test-utils';

describe('SidebarFooter', () => {
  describe('rendering total count', () => {
    it('should render total collection count when provided', () => {
      render(<SidebarFooter totalCount={5} />);

      const countText = screen.getByText('5 total collections');
      expect(countText).toBeInTheDocument();
    });

    it('should render singular "collection" text for count of 1', () => {
      render(<SidebarFooter totalCount={1} />);

      const countText = screen.getByText('1 total collection');
      expect(countText).toBeInTheDocument();
      expect(screen.queryByText('1 total collections')).not.toBeInTheDocument();
    });

    it('should render plural "collections" text for count greater than 1', () => {
      render(<SidebarFooter totalCount={10} />);

      const countText = screen.getByText('10 total collections');
      expect(countText).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle zero collections gracefully', () => {
      render(<SidebarFooter totalCount={0} />);

      const countText = screen.getByText('0 total collections');
      expect(countText).toBeInTheDocument();
    });

    it('should render large collection counts correctly', () => {
      render(<SidebarFooter totalCount={1000} />);

      const countText = screen.getByText('1000 total collections');
      expect(countText).toBeInTheDocument();
    });
  });

  describe('component structure', () => {
    it('should render footer with accessible text content', () => {
      render(<SidebarFooter totalCount={5} />);

      const countText = screen.getByText('5 total collections');
      expect(countText).toBeInTheDocument();
      expect(countText).toHaveClass('text-muted-foreground');
    });

    it('should display count information in footer region', () => {
      render(<SidebarFooter totalCount={3} />);

      // Verify the footer text is present and accessible
      const countText = screen.getByText('3 total collections');
      expect(countText).toBeInTheDocument();
    });
  });
});
