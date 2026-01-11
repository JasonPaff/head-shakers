import { describe, expect, it, vi } from 'vitest';

import { NoFilteredCollections } from '@/app/(app)/user/[username]/dashboard/collection/components/empty-states/no-filtered-collections';

import { render, screen } from '../../../setup/test-utils';

describe('NoFilteredCollections', () => {
  describe('rendering', () => {
    it('renders "no results found" message with search context', () => {
      render(<NoFilteredCollections />);

      // Check for heading
      expect(screen.getByRole('heading', { level: 3, name: 'No collections found' })).toBeInTheDocument();

      // Check for description text with search context
      expect(screen.getByText('No collections match your search. Try a different term.')).toBeInTheDocument();
    });

    it('renders "clear filters" button', async () => {
      const mockClearSearch = vi.fn();
      const { user } = render(<NoFilteredCollections onClearSearch={mockClearSearch} />);

      const clearButton = screen.getByRole('button', { name: /clear search/i });
      expect(clearButton).toBeInTheDocument();

      // Verify button is functional
      await user.click(clearButton);
      expect(mockClearSearch).toHaveBeenCalledTimes(1);
    });
  });
});
