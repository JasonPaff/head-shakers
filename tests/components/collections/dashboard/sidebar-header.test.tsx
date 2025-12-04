import { describe, expect, it, vi } from 'vitest';

import { SidebarHeader } from '@/app/(app)/dashboard/collection/(collection)/components/sidebar/sidebar-header';

import { render, screen } from '../../../setup/test-utils';

describe('SidebarHeader', () => {
  describe('rendering', () => {
    it('should render "Collections" heading', () => {
      render(<SidebarHeader />);

      const heading = screen.getByRole('heading', { level: 2, name: 'Collections' });
      expect(heading).toBeInTheDocument();
    });

    it('should render "New" action button', () => {
      render(<SidebarHeader />);

      const button = screen.getByRole('button', { name: /new/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should call onCreateClick when "New" button is clicked', async () => {
      const onCreateClick = vi.fn();
      const { user } = render(<SidebarHeader onCreateClick={onCreateClick} />);

      const button = screen.getByRole('button', { name: /new/i });
      await user.click(button);

      expect(onCreateClick).toHaveBeenCalledTimes(1);
    });
  });
});
