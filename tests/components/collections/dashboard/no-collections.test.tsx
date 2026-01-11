import { describe, expect, it } from 'vitest';

import { NoCollections } from '@/app/(app)/dashboard/collection/components/empty-states/no-collections';

import { render, screen } from '../../../setup/test-utils';

describe('NoCollections', () => {
  describe('rendering', () => {
    it('renders empty state message and icon', () => {
      render(<NoCollections />);

      // Check for heading
      expect(screen.getByRole('heading', { level: 3, name: 'No collections yet' })).toBeInTheDocument();

      // Check for description text
      expect(
        screen.getByText('Create your first collection to start organizing your bobbleheads'),
      ).toBeInTheDocument();
    });

    it('renders "Create Collection" call-to-action button', () => {
      render(<NoCollections />);

      const button = screen.getByRole('button', { name: /create collection/i });
      expect(button).toBeInTheDocument();
    });
  });
});
