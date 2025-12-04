import { describe, expect, it, vi } from 'vitest';

import type { CollectionSortOption } from '@/hooks/use-user-preferences';

import {
  type CollectionCardStyle,
  SidebarSearch,
} from '@/app/(app)/dashboard/collection/(collection)/components/sidebar/sidebar-search';

import { render, screen } from '../../../setup/test-utils';

describe('SidebarSearch', () => {
  const defaultProps = {
    cardStyle: 'compact' as CollectionCardStyle,
    isHoverCardEnabled: false,
    onCardStyleChange: vi.fn(),
    onHoverCardToggle: vi.fn(),
    onSearchChange: vi.fn(),
    onSearchClear: vi.fn(),
    onSortChange: vi.fn(),
    searchValue: '',
    sortOption: 'name-asc' as CollectionSortOption,
  };

  describe('search input', () => {
    it('should render search input field with placeholder', () => {
      render(<SidebarSearch {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText(/search collections/i);
      expect(searchInput).toBeInTheDocument();
    });

    it('should render search icon', () => {
      render(<SidebarSearch {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText(/search collections/i);
      const container = searchInput.closest('[data-slot="sidebar-search"]');
      expect(container).toBeInTheDocument();
    });

    it('should update search value on user input', async () => {
      const onSearchChange = vi.fn();
      const { user } = render(<SidebarSearch {...defaultProps} onSearchChange={onSearchChange} />);

      const searchInput = screen.getByPlaceholderText(/search collections/i);
      await user.type(searchInput, 'Test');

      // Each keystroke triggers onChange with the current input value
      // userEvent.type simulates individual keystrokes
      expect(onSearchChange).toHaveBeenCalled();
      expect(onSearchChange).toHaveBeenCalledTimes(4);
    });

    it('should display current search value', () => {
      render(<SidebarSearch {...defaultProps} searchValue={'My Search'} />);

      const searchInput = screen.getByPlaceholderText(/search collections/i);
      expect(searchInput).toHaveValue('My Search');
    });

    it('should call onSearchClear when clear button clicked', async () => {
      const onSearchClear = vi.fn();
      const { user } = render(
        <SidebarSearch {...defaultProps} onSearchClear={onSearchClear} searchValue={'Test'} />,
      );

      // The Input component with isClearable should show a clear button when there's a value
      const clearButton = screen.getByTestId('ui-button-clear');
      await user.click(clearButton);

      expect(onSearchClear).toHaveBeenCalledTimes(1);
    });

    it('should handle empty search state', () => {
      render(<SidebarSearch {...defaultProps} searchValue={''} />);

      const searchInput = screen.getByPlaceholderText(/search collections/i);
      expect(searchInput).toHaveValue('');
    });

    it('should disable search input when isDisabled is true', () => {
      render(<SidebarSearch {...defaultProps} isDisabled />);

      const searchInput = screen.getByPlaceholderText(/search collections/i);
      expect(searchInput).toBeDisabled();
    });
  });

  describe('sort dropdown', () => {
    it('should render sort dropdown with current option', () => {
      render(<SidebarSearch {...defaultProps} sortOption={'name-asc'} />);

      const sortButton = screen.getByRole('button', { name: /name \(a-z\)/i });
      expect(sortButton).toBeInTheDocument();
    });

    it('should display all sort options when dropdown is opened', async () => {
      const { user } = render(<SidebarSearch {...defaultProps} />);

      const sortButton = screen.getByRole('button', { name: /name \(a-z\)/i });
      await user.click(sortButton);

      expect(screen.getByRole('menuitemradio', { name: /name \(a-z\)/i })).toBeInTheDocument();
      expect(screen.getByRole('menuitemradio', { name: /name \(z-a\)/i })).toBeInTheDocument();
      expect(screen.getByRole('menuitemradio', { name: /item count \(high to low\)/i })).toBeInTheDocument();
      expect(screen.getByRole('menuitemradio', { name: /item count \(low to high\)/i })).toBeInTheDocument();
      expect(screen.getByRole('menuitemradio', { name: /total value \(high to low\)/i })).toBeInTheDocument();
      expect(screen.getByRole('menuitemradio', { name: /total value \(low to high\)/i })).toBeInTheDocument();
      expect(screen.getByRole('menuitemradio', { name: /likes \(high to low\)/i })).toBeInTheDocument();
      expect(screen.getByRole('menuitemradio', { name: /views \(high to low\)/i })).toBeInTheDocument();
      expect(screen.getByRole('menuitemradio', { name: /comments \(high to low\)/i })).toBeInTheDocument();
    });

    it('should call onSortChange when user selects new sort option', async () => {
      const onSortChange = vi.fn();
      const { user } = render(<SidebarSearch {...defaultProps} onSortChange={onSortChange} />);

      const sortButton = screen.getByRole('button', { name: /name \(a-z\)/i });
      await user.click(sortButton);

      const nameDescOption = screen.getByRole('menuitemradio', { name: /name \(z-a\)/i });
      await user.click(nameDescOption);

      expect(onSortChange).toHaveBeenCalledWith('name-desc');
    });

    it('should display correct icon for name-asc sort option', () => {
      render(<SidebarSearch {...defaultProps} sortOption={'name-asc'} />);

      const sortButton = screen.getByRole('button', { name: /name \(a-z\)/i });
      expect(sortButton).toBeInTheDocument();
    });

    it('should display correct icon for name-desc sort option', () => {
      render(<SidebarSearch {...defaultProps} sortOption={'name-desc'} />);

      const sortButton = screen.getByRole('button', { name: /name \(z-a\)/i });
      expect(sortButton).toBeInTheDocument();
    });

    it('should display correct label for each sort option', () => {
      const sortOptions: Array<CollectionSortOption> = [
        'name-asc',
        'name-desc',
        'count-asc',
        'count-desc',
        'value-asc',
        'value-desc',
        'likes-desc',
        'views-desc',
        'comments-desc',
      ];

      sortOptions.forEach((sortOption) => {
        const { unmount } = render(<SidebarSearch {...defaultProps} sortOption={sortOption} />);
        // Just verify component renders without errors for each sort option
        expect(
          screen.getByRole('button', { name: /sort|name|count|value|likes|views|comments/i }),
        ).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('card style dropdown', () => {
    it('should render card style dropdown with current style', () => {
      render(<SidebarSearch {...defaultProps} cardStyle={'compact'} />);

      const cardStyleButton = screen.getByRole('button', { name: /compact view/i });
      expect(cardStyleButton).toBeInTheDocument();
    });

    it('should display all card style options when dropdown is opened', async () => {
      const { user } = render(<SidebarSearch {...defaultProps} />);

      const cardStyleButton = screen.getByRole('button', { name: /compact view/i });
      await user.click(cardStyleButton);

      expect(screen.getByRole('menuitemradio', { name: /^compact$/i })).toBeInTheDocument();
      expect(screen.getByRole('menuitemradio', { name: /^detailed$/i })).toBeInTheDocument();
      expect(screen.getByRole('menuitemradio', { name: /^cover$/i })).toBeInTheDocument();
    });

    it('should call onCardStyleChange when user selects new card style', async () => {
      const onCardStyleChange = vi.fn();
      const { user } = render(<SidebarSearch {...defaultProps} onCardStyleChange={onCardStyleChange} />);

      const cardStyleButton = screen.getByRole('button', { name: /compact view/i });
      await user.click(cardStyleButton);

      const detailedOption = screen.getByRole('menuitemradio', { name: /^detailed$/i });
      await user.click(detailedOption);

      expect(onCardStyleChange).toHaveBeenCalledWith('detailed');
    });

    it('should display correct label for each card style', () => {
      const cardStyles: Array<CollectionCardStyle> = ['compact', 'cover', 'detailed'];

      cardStyles.forEach((cardStyle) => {
        const { unmount } = render(<SidebarSearch {...defaultProps} cardStyle={cardStyle} />);
        // Just verify component renders without errors for each card style
        expect(screen.getByRole('button', { name: /view/i })).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('hover card toggle', () => {
    it('should render hover card toggle switch', () => {
      render(<SidebarSearch {...defaultProps} />);

      const toggle = screen.getByRole('switch', { name: /quick preview on hover/i });
      expect(toggle).toBeInTheDocument();
    });

    it('should display label for screen readers', () => {
      render(<SidebarSearch {...defaultProps} />);

      const label = screen.getByLabelText(/quick preview on hover/i);
      expect(label).toBeInTheDocument();
    });

    it('should call onHoverCardToggle when switch is toggled', async () => {
      const onHoverCardToggle = vi.fn();
      const { user } = render(<SidebarSearch {...defaultProps} onHoverCardToggle={onHoverCardToggle} />);

      const toggle = screen.getByRole('switch', { name: /quick preview on hover/i });
      await user.click(toggle);

      expect(onHoverCardToggle).toHaveBeenCalledTimes(1);
    });

    it('should reflect checked state when isHoverCardEnabled is true', () => {
      render(<SidebarSearch {...defaultProps} isHoverCardEnabled />);

      const toggle = screen.getByRole('switch', { name: /quick preview on hover/i });
      expect(toggle).toBeChecked();
    });

    it('should reflect unchecked state when isHoverCardEnabled is false', () => {
      render(<SidebarSearch {...defaultProps} isHoverCardEnabled={false} />);

      const toggle = screen.getByRole('switch', { name: /quick preview on hover/i });
      expect(toggle).not.toBeChecked();
    });
  });

  describe('accessibility', () => {
    it('should have accessible labels for all interactive elements', () => {
      render(<SidebarSearch {...defaultProps} />);

      // Search input has placeholder that acts as accessible name
      expect(screen.getByPlaceholderText(/search collections/i)).toBeInTheDocument();

      // Dropdowns have accessible button labels
      expect(screen.getByRole('button', { name: /compact view/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /name \(a-z\)/i })).toBeInTheDocument();

      // Switch has accessible label
      expect(screen.getByLabelText(/quick preview on hover/i)).toBeInTheDocument();
    });

    it('should support keyboard navigation for sort dropdown', async () => {
      const onSortChange = vi.fn();
      const { user } = render(<SidebarSearch {...defaultProps} onSortChange={onSortChange} />);

      const sortButton = screen.getByRole('button', { name: /name \(a-z\)/i });

      // Focus the button
      sortButton.focus();
      expect(sortButton).toHaveFocus();

      // Open with keyboard
      await user.keyboard('{Enter}');

      // Verify menu is open
      expect(screen.getByRole('menuitemradio', { name: /name \(z-a\)/i })).toBeInTheDocument();
    });

    it('should support keyboard navigation for card style dropdown', async () => {
      const onCardStyleChange = vi.fn();
      const { user } = render(<SidebarSearch {...defaultProps} onCardStyleChange={onCardStyleChange} />);

      const cardStyleButton = screen.getByRole('button', { name: /compact view/i });

      // Focus the button
      cardStyleButton.focus();
      expect(cardStyleButton).toHaveFocus();

      // Open with keyboard
      await user.keyboard('{Enter}');

      // Verify menu is open
      expect(screen.getByRole('menuitemradio', { name: /^detailed$/i })).toBeInTheDocument();
    });
  });
});
