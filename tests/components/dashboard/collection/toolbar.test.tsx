import { describe, expect, it, vi } from 'vitest';

import { Toolbar } from '@/app/(app)/dashboard/collection/(collection)/components/main/toolbar';

import { render, screen } from '../../../setup/test-utils';

describe('Toolbar', () => {
  const defaultProps = {
    categories: ['Sports', 'Movies', 'Music'],
    conditions: ['mint', 'good', 'fair', 'poor'],
    filterCategory: 'all',
    filterCondition: 'all',
    filterFeatured: 'all',
    gridDensity: 'comfortable' as const,
    isHoverCardEnabled: false,
    isSelectionMode: false,
    onAddClick: vi.fn(),
    onClearFilters: vi.fn(),
    onFilterCategoryChange: vi.fn(),
    onFilterConditionChange: vi.fn(),
    onFilterFeaturedChange: vi.fn(),
    onGridDensityToggle: vi.fn(),
    onHoverCardToggle: vi.fn(),
    onSearchChange: vi.fn(),
    onSearchClear: vi.fn(),
    onSelectionModeToggle: vi.fn(),
    onSortChange: vi.fn(),
    searchValue: '',
    sortBy: 'newest',
  };

  describe('Search Input', () => {
    it('should render search input with placeholder "Search bobbleheads..."', () => {
      render(<Toolbar {...defaultProps} />);

      expect(screen.getByPlaceholderText('Search bobbleheads...')).toBeInTheDocument();
    });

    it('should call onSearchChange when typing in search input', async () => {
      const onSearchChange = vi.fn();
      const { user } = render(<Toolbar {...defaultProps} onSearchChange={onSearchChange} />);

      await user.type(screen.getByPlaceholderText('Search bobbleheads...'), 'test');

      expect(onSearchChange).toHaveBeenCalled();
      // userEvent.type fires onChange for each character
      expect(onSearchChange).toHaveBeenCalledTimes(4);
    });

    it('should call onSearchClear when clear button clicked', async () => {
      const onSearchClear = vi.fn();
      const { user } = render(
        <Toolbar {...defaultProps} onSearchClear={onSearchClear} searchValue={'existing search'} />,
      );

      // Find and click the clear button (X icon)
      const searchInput = screen.getByPlaceholderText('Search bobbleheads...');
      const clearButton = searchInput.parentElement?.querySelector('button');

      expect(clearButton).toBeInTheDocument();

      await user.click(clearButton!);
      expect(onSearchClear).toHaveBeenCalledTimes(1);
    });
  });

  describe('Filters Dropdown', () => {
    it('should render Filters dropdown', () => {
      render(<Toolbar {...defaultProps} />);

      expect(screen.getByRole('button', { name: /filters/i })).toBeInTheDocument();
    });

    it('should render all categories in filters dropdown', async () => {
      const { user } = render(<Toolbar {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /filters/i }));

      expect(screen.getByRole('menuitemradio', { name: 'All Categories' })).toBeInTheDocument();
      expect(screen.getByRole('menuitemradio', { name: 'Sports' })).toBeInTheDocument();
      expect(screen.getByRole('menuitemradio', { name: 'Movies' })).toBeInTheDocument();
      expect(screen.getByRole('menuitemradio', { name: 'Music' })).toBeInTheDocument();
    });

    it('should call onFilterCategoryChange when category selected', async () => {
      const onFilterCategoryChange = vi.fn();
      const { user } = render(<Toolbar {...defaultProps} onFilterCategoryChange={onFilterCategoryChange} />);

      await user.click(screen.getByRole('button', { name: /filters/i }));
      await user.click(screen.getByRole('menuitemradio', { name: 'Sports' }));

      expect(onFilterCategoryChange).toHaveBeenCalledWith('Sports');
    });

    it('should call onFilterConditionChange when condition selected', async () => {
      const onFilterConditionChange = vi.fn();
      const { user } = render(
        <Toolbar {...defaultProps} onFilterConditionChange={onFilterConditionChange} />,
      );

      await user.click(screen.getByRole('button', { name: /filters/i }));
      await user.click(screen.getByRole('menuitemradio', { name: 'MINT' }));

      expect(onFilterConditionChange).toHaveBeenCalledWith('mint');
    });

    it('should call onFilterFeaturedChange when featured filter changes', async () => {
      const onFilterFeaturedChange = vi.fn();
      const { user } = render(<Toolbar {...defaultProps} onFilterFeaturedChange={onFilterFeaturedChange} />);

      await user.click(screen.getByRole('button', { name: /filters/i }));
      await user.click(screen.getByRole('menuitemradio', { name: 'Featured Only' }));

      expect(onFilterFeaturedChange).toHaveBeenCalledWith('featured');
    });

    it('should call onClearFilters when "Clear All Filters" clicked', async () => {
      const onClearFilters = vi.fn();
      const { user } = render(
        <Toolbar {...defaultProps} filterCategory={'Sports'} onClearFilters={onClearFilters} />,
      );

      await user.click(screen.getByRole('button', { name: /filters/i }));
      await user.click(screen.getByRole('menuitem', { name: /clear all filters/i }));

      expect(onClearFilters).toHaveBeenCalledTimes(1);
    });

    it('should show active filter indicator when filters are applied', () => {
      render(<Toolbar {...defaultProps} filterCategory={'Sports'} />);

      const filterButton = screen.getByRole('button', { name: /filters/i });
      const indicator = filterButton.querySelector('[aria-label="Filters active"]');

      expect(indicator).toBeInTheDocument();
    });

    it('should not show active filter indicator when no filters are applied', () => {
      render(<Toolbar {...defaultProps} />);

      const filterButton = screen.getByRole('button', { name: /filters/i });
      const indicator = filterButton.querySelector('[aria-label="Filters active"]');

      expect(indicator).not.toBeInTheDocument();
    });
  });

  describe('Sort Dropdown', () => {
    it('should render Sort dropdown with all 6 sort options', async () => {
      const { user } = render(<Toolbar {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /sort/i }));

      expect(screen.getByRole('menuitemradio', { name: 'Newest First' })).toBeInTheDocument();
      expect(screen.getByRole('menuitemradio', { name: 'Oldest First' })).toBeInTheDocument();
      expect(screen.getByRole('menuitemradio', { name: 'Name (A-Z)' })).toBeInTheDocument();
      expect(screen.getByRole('menuitemradio', { name: 'Name (Z-A)' })).toBeInTheDocument();
      expect(screen.getByRole('menuitemradio', { name: 'Value (High-Low)' })).toBeInTheDocument();
      expect(screen.getByRole('menuitemradio', { name: 'Value (Low-High)' })).toBeInTheDocument();
    });

    it('should call onSortChange when sort option selected', async () => {
      const onSortChange = vi.fn();
      const { user } = render(<Toolbar {...defaultProps} onSortChange={onSortChange} />);

      await user.click(screen.getByRole('button', { name: /sort/i }));
      await user.click(screen.getByRole('menuitemradio', { name: 'Name (A-Z)' }));

      expect(onSortChange).toHaveBeenCalledWith('name-asc');
    });
  });

  describe('Grid Density Toggle', () => {
    it('should toggle grid density when density button clicked', async () => {
      const onGridDensityToggle = vi.fn();
      const { user } = render(<Toolbar {...defaultProps} onGridDensityToggle={onGridDensityToggle} />);

      // Find the grid density button (desktop view)
      const densityButtons = screen.getAllByRole('button');
      const densityButton = densityButtons.find((button) => {
        const svg = button.querySelector('svg');
        return svg?.classList.contains('lucide-layout-list');
      });

      if (densityButton) {
        await user.click(densityButton);
      }

      expect(onGridDensityToggle).toHaveBeenCalledTimes(1);
    });

    it('should display correct icon based on grid density', () => {
      const { rerender } = render(<Toolbar {...defaultProps} gridDensity={'comfortable'} />);

      // Comfortable should show LayoutListIcon
      const buttons = screen.getAllByRole('button');
      let densityButton = buttons.find((button) => {
        const svg = button.querySelector('svg');
        return svg?.classList.contains('lucide-layout-list');
      });
      expect(densityButton).toBeInTheDocument();

      // Compact should show GripVerticalIcon
      rerender(<Toolbar {...defaultProps} gridDensity={'compact'} />);
      densityButton = buttons.find((button) => {
        const svg = button.querySelector('svg');
        return svg?.classList.contains('lucide-grip-vertical');
      });
      expect(densityButton).toBeInTheDocument();
    });
  });

  describe('Hover Card Toggle', () => {
    it('should toggle hover card when Switch toggled', async () => {
      const onHoverCardToggle = vi.fn();
      const { user } = render(<Toolbar {...defaultProps} onHoverCardToggle={onHoverCardToggle} />);

      // Find the switch by its id
      const hoverCardSwitch = screen.getByRole('switch', { name: /quick preview/i });
      await user.click(hoverCardSwitch);

      expect(onHoverCardToggle).toHaveBeenCalledTimes(1);
    });

    it('should reflect correct checked state of hover card toggle', () => {
      const { rerender } = render(<Toolbar {...defaultProps} isHoverCardEnabled={false} />);

      const hoverCardSwitch = screen.getByRole('switch', { name: /quick preview/i });
      expect(hoverCardSwitch).not.toBeChecked();

      rerender(<Toolbar {...defaultProps} isHoverCardEnabled={true} />);
      expect(hoverCardSwitch).toBeChecked();
    });
  });

  describe('Selection Mode Toggle', () => {
    it('should toggle selection mode when "Select" button clicked', async () => {
      const onSelectionModeToggle = vi.fn();
      const { user } = render(<Toolbar {...defaultProps} onSelectionModeToggle={onSelectionModeToggle} />);

      // Find all Select buttons (desktop and mobile)
      const selectButtons = screen.getAllByRole('button', { name: /select/i });
      expect(selectButtons).toHaveLength(2);
      await user.click(selectButtons[0]!);

      expect(onSelectionModeToggle).toHaveBeenCalledTimes(1);
    });

    it('should show "Cancel" text when isSelectionMode=true', () => {
      render(<Toolbar {...defaultProps} isSelectionMode={true} />);

      expect(screen.getAllByRole('button', { name: /cancel/i })).toHaveLength(2); // Desktop and mobile
    });

    it('should show "Select" text when isSelectionMode=false', () => {
      render(<Toolbar {...defaultProps} isSelectionMode={false} />);

      expect(screen.getAllByRole('button', { name: /^select$/i })).toHaveLength(2); // Desktop and mobile
    });
  });

  describe('Add Bobblehead Button', () => {
    it('should call onAddClick when "Add Bobblehead" clicked', async () => {
      const onAddClick = vi.fn();
      const { user } = render(<Toolbar {...defaultProps} onAddClick={onAddClick} />);

      await user.click(screen.getByRole('button', { name: /add bobblehead/i }));

      expect(onAddClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Component Structure and Styling', () => {
    it('should use correct data-slot for test targeting', () => {
      const { container } = render(<Toolbar {...defaultProps} />);

      // eslint-disable-next-line testing-library/no-container
      const toolbarElement = container.querySelector('[data-slot="toolbar"]');
      expect(toolbarElement).toBeInTheDocument();
      expect(toolbarElement).toHaveAttribute('data-slot', 'toolbar');
    });

    it('should render with sticky positioning and backdrop blur', () => {
      const { container } = render(<Toolbar {...defaultProps} />);

      // eslint-disable-next-line testing-library/no-container
      const toolbarElement = container.querySelector('[data-slot="toolbar"]');
      expect(toolbarElement).toHaveClass('sticky');
      expect(toolbarElement).toHaveClass('backdrop-blur-sm');
    });
  });
});
