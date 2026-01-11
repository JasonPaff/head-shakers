import { waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { BobbleheadCard } from '@/app/(app)/user/[username]/dashboard/collection/components/main/bobblehead-card';

import { createMockBobbleheadDashboardRecord } from '../../../fixtures/bobblehead-grid.factory';
import { render, screen } from '../../../setup/test-utils';

describe('BobbleheadCard', () => {
  const mockBobblehead = createMockBobbleheadDashboardRecord({
    condition: 'mint',
    featurePhoto: 'https://example.com/photo.jpg',
    id: 'bobblehead-1',
    isFeatured: false,
    name: 'Test Bobblehead',
  });

  const defaultProps = {
    bobblehead: mockBobblehead,
    isSelected: false,
    isSelectionMode: false,
    onDelete: vi.fn(),
    onEdit: vi.fn(),
    onFeatureToggle: vi.fn(),
    onSelectionChange: vi.fn(),
    username: 'testuser123',
  };

  describe('Display Tests', () => {
    it('should render bobblehead name', () => {
      render(<BobbleheadCard {...defaultProps} />);

      expect(screen.getByText('Test Bobblehead')).toBeInTheDocument();
    });

    it('should render condition badge with correct variant for mint condition', () => {
      render(<BobbleheadCard {...defaultProps} />);

      const badge = screen.getByText('MINT');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-gradient-to-r', 'from-success', 'to-new');
    });

    it('should render condition badge with correct variant for excellent condition', () => {
      const bobblehead = createMockBobbleheadDashboardRecord({ condition: 'excellent' });
      render(<BobbleheadCard {...defaultProps} bobblehead={bobblehead} />);

      const badge = screen.getByText('EXCELLENT');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-primary', 'text-primary-foreground');
    });

    it('should render condition badge with correct variant for good condition', () => {
      const bobblehead = createMockBobbleheadDashboardRecord({ condition: 'good' });
      render(<BobbleheadCard {...defaultProps} bobblehead={bobblehead} />);

      const badge = screen.getByText('GOOD');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-secondary', 'text-secondary-foreground');
    });

    it('should render condition badge with correct variant for fair condition', () => {
      const bobblehead = createMockBobbleheadDashboardRecord({ condition: 'fair' });
      render(<BobbleheadCard {...defaultProps} bobblehead={bobblehead} />);

      const badge = screen.getByText('FAIR');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-muted', 'text-muted-foreground');
    });

    it('should render condition badge with correct variant for poor condition', () => {
      const bobblehead = createMockBobbleheadDashboardRecord({ condition: 'poor' });
      render(<BobbleheadCard {...defaultProps} bobblehead={bobblehead} />);

      const badge = screen.getByText('POOR');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-destructive', 'text-white');
    });

    it('should format condition text with uppercase and replace hyphens', () => {
      const bobblehead = createMockBobbleheadDashboardRecord({ condition: 'near-mint' });
      render(<BobbleheadCard {...defaultProps} bobblehead={bobblehead} />);

      expect(screen.getByText('NEAR MINT')).toBeInTheDocument();
    });

    it('should render feature photo when available', () => {
      render(<BobbleheadCard {...defaultProps} />);

      const image = screen.getByAltText('Test Bobblehead');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://example.com/photo.jpg');
    });

    it('should show "Featured" badge when isFeatured=true', () => {
      const bobblehead = createMockBobbleheadDashboardRecord({ isFeatured: true });
      render(<BobbleheadCard {...defaultProps} bobblehead={bobblehead} />);

      expect(screen.getByText('Featured')).toBeInTheDocument();
    });

    it('should not show "Featured" badge when isFeatured=false', () => {
      render(<BobbleheadCard {...defaultProps} />);

      expect(screen.queryByText('Featured')).not.toBeInTheDocument();
    });
  });

  describe('Selection Mode Tests', () => {
    it('should render checkbox when isSelectionMode=true', () => {
      render(<BobbleheadCard {...defaultProps} isSelectionMode={true} />);

      const checkbox = screen.getByTestId('ui-checkbox');
      expect(checkbox).toBeInTheDocument();
    });

    it('should not render checkbox when isSelectionMode=false', () => {
      render(<BobbleheadCard {...defaultProps} isSelectionMode={false} />);

      expect(screen.queryByTestId('ui-checkbox')).not.toBeInTheDocument();
    });

    it('should call onSelectionChange when checkbox clicked', async () => {
      const onSelectionChange = vi.fn();
      const { user } = render(
        <BobbleheadCard {...defaultProps} isSelectionMode={true} onSelectionChange={onSelectionChange} />,
      );

      const checkbox = screen.getByTestId('ui-checkbox');
      await user.click(checkbox);

      expect(onSelectionChange).toHaveBeenCalledWith('bobblehead-1', true);
    });

    it('should call onSelectionChange when card clicked in selection mode', async () => {
      const onSelectionChange = vi.fn();
      const { container, user } = render(
        <BobbleheadCard {...defaultProps} isSelectionMode={true} onSelectionChange={onSelectionChange} />,
      );

      // Click on the card container (the HoverCardTrigger div with role=checkbox)
      // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
      const cardContainer = container.querySelector('[data-slot="hover-card-trigger"]');
      if (cardContainer) {
        await user.click(cardContainer);
      }

      // When isSelected=false (default), clicking should toggle to true
      expect(onSelectionChange).toHaveBeenCalledWith('bobblehead-1', true);
    });

    it('should toggle isSelected when card clicked in selection mode', async () => {
      const onSelectionChange = vi.fn();
      const { container, user } = render(
        <BobbleheadCard
          {...defaultProps}
          isSelected={true}
          isSelectionMode={true}
          onSelectionChange={onSelectionChange}
        />,
      );

      // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
      const cardContainer = container.querySelector('[data-slot="hover-card-trigger"]');
      if (cardContainer) {
        await user.click(cardContainer);
      }

      // When isSelected=true, clicking should toggle to false
      expect(onSelectionChange).toHaveBeenCalledWith('bobblehead-1', false);
    });

    it('should apply ring-2 ring-primary when isSelected=true', () => {
      const { container } = render(<BobbleheadCard {...defaultProps} isSelected={true} />);

      // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
      const card = container.querySelector('[data-slot="bobblehead-card"]');
      expect(card).toHaveClass('ring-2', 'ring-primary');
    });

    it('should not apply ring classes when isSelected=false', () => {
      const { container } = render(<BobbleheadCard {...defaultProps} isSelected={false} />);

      // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
      const card = container.querySelector('[data-slot="bobblehead-card"]');
      expect(card).not.toHaveClass('ring-2', 'ring-primary');
    });

    it('should support keyboard navigation with Enter key in selection mode', async () => {
      const onSelectionChange = vi.fn();
      const { container, user } = render(
        <BobbleheadCard {...defaultProps} isSelectionMode={true} onSelectionChange={onSelectionChange} />,
      );

      // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
      const cardContainer = container.querySelector('[data-slot="hover-card-trigger"]') as HTMLElement;
      if (cardContainer) {
        cardContainer.focus();
        await user.keyboard('{Enter}');
      }

      // When isSelected=false (default), pressing Enter should toggle to true
      expect(onSelectionChange).toHaveBeenCalledWith('bobblehead-1', true);
    });

    it('should support keyboard navigation with Space key in selection mode', async () => {
      const onSelectionChange = vi.fn();
      const { container, user } = render(
        <BobbleheadCard {...defaultProps} isSelectionMode={true} onSelectionChange={onSelectionChange} />,
      );

      // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
      const cardContainer = container.querySelector('[data-slot="hover-card-trigger"]') as HTMLElement;
      if (cardContainer) {
        cardContainer.focus();
        await user.keyboard(' ');
      }

      // When isSelected=false (default), pressing Space should toggle to true
      expect(onSelectionChange).toHaveBeenCalledWith('bobblehead-1', true);
    });
  });

  describe('Normal Mode Tests', () => {
    it('should show Edit button in hover overlay', async () => {
      const { user } = render(<BobbleheadCard {...defaultProps} isSelectionMode={false} />);

      // Hover over the card to trigger the overlay
      const card = screen.getByText('Test Bobblehead');
      await user.hover(card);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
      });
    });

    it('should call onEdit when Edit button clicked', async () => {
      const onEdit = vi.fn();
      const { user } = render(<BobbleheadCard {...defaultProps} onEdit={onEdit} />);

      // Find and click the Edit button
      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      expect(onEdit).toHaveBeenCalledWith('bobblehead-1');
    });

    it('should show dropdown menu trigger with MoreVertical icon', () => {
      render(<BobbleheadCard {...defaultProps} />);

      // The dropdown trigger button is rendered (it's one of the buttons in the overlay)
      const buttons = screen.getAllByRole('button');
      // We should have at least 2 buttons: Edit button + dropdown trigger
      expect(buttons.length).toBeGreaterThanOrEqual(2);
    });

    it('should show dropdown menu with Feature option when clicked', async () => {
      const { user } = render(<BobbleheadCard {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      // Button[0] is Edit, Button[1] is the dropdown trigger
      const dropdownTrigger = buttons[1];

      if (dropdownTrigger) {
        await user.click(dropdownTrigger);
      }

      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: /feature/i })).toBeInTheDocument();
      });
    });

    it('should show dropdown menu with Delete option when clicked', async () => {
      const { user } = render(<BobbleheadCard {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      // Button[0] is Edit, Button[1] is the dropdown trigger
      const dropdownTrigger = buttons[1];

      if (dropdownTrigger) {
        await user.click(dropdownTrigger);
      }

      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: /delete/i })).toBeInTheDocument();
      });
    });

    it('should call onFeatureToggle when feature clicked', async () => {
      const onFeatureToggle = vi.fn();
      const { user } = render(<BobbleheadCard {...defaultProps} onFeatureToggle={onFeatureToggle} />);

      const buttons = screen.getAllByRole('button');
      // Button[0] is Edit, Button[1] is the dropdown trigger
      const dropdownTrigger = buttons[1];

      if (dropdownTrigger) {
        await user.click(dropdownTrigger);
      }

      await waitFor(async () => {
        const featureItem = screen.getByRole('menuitem', { name: /feature/i });
        await user.click(featureItem);
      });

      expect(onFeatureToggle).toHaveBeenCalledWith('bobblehead-1');
    });

    it('should call onDelete when delete clicked', async () => {
      const onDelete = vi.fn();
      const { user } = render(<BobbleheadCard {...defaultProps} onDelete={onDelete} />);

      const buttons = screen.getAllByRole('button');
      // Button[0] is Edit, Button[1] is the dropdown trigger
      const dropdownTrigger = buttons[1];

      if (dropdownTrigger) {
        await user.click(dropdownTrigger);
      }

      await waitFor(async () => {
        const deleteItem = screen.getByRole('menuitem', { name: /delete/i });
        await user.click(deleteItem);
      });

      expect(onDelete).toHaveBeenCalledWith('bobblehead-1');
    });

    it('should show "Un-feature" text when isFeatured=true', async () => {
      const bobblehead = createMockBobbleheadDashboardRecord({ isFeatured: true });
      const { user } = render(<BobbleheadCard {...defaultProps} bobblehead={bobblehead} />);

      const buttons = screen.getAllByRole('button');
      // Button[0] is Edit, Button[1] is the dropdown trigger
      const dropdownTrigger = buttons[1];

      if (dropdownTrigger) {
        await user.click(dropdownTrigger);
      }

      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: /un-feature/i })).toBeInTheDocument();
      });
    });

    it('should show "Feature" text when isFeatured=false', async () => {
      const bobblehead = createMockBobbleheadDashboardRecord({ isFeatured: false });
      const { user } = render(<BobbleheadCard {...defaultProps} bobblehead={bobblehead} />);

      const buttons = screen.getAllByRole('button');
      // Button[0] is Edit, Button[1] is the dropdown trigger
      const dropdownTrigger = buttons[1];

      if (dropdownTrigger) {
        await user.click(dropdownTrigger);
      }

      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: /^feature$/i })).toBeInTheDocument();
      });
    });
  });

  describe('Hover Card Tests', () => {
    it('should render HoverCardContent with full details when enabled', async () => {
      const bobblehead = createMockBobbleheadDashboardRecord({
        characterName: 'Baseball Player',
        commentCount: 5,
        height: 8,
        likeCount: 10,
        manufacturer: 'Bobblehead Co',
        material: 'Resin',
        purchasePrice: 49.99,
        series: 'MLB Series 1',
        viewCount: 100,
        year: 2024,
      });
      const { user } = render(
        <BobbleheadCard {...defaultProps} bobblehead={bobblehead} isHoverCardEnabled={true} />,
      );

      // Hover over the card trigger
      const card = screen.getByText(bobblehead.name!);
      await user.hover(card);

      // Wait for hover card to appear
      await waitFor(() => {
        expect(screen.getByText('Baseball Player')).toBeInTheDocument();
        expect(screen.getByText('Manufacturer:')).toBeInTheDocument();
        expect(screen.getByText('Bobblehead Co')).toBeInTheDocument();
        expect(screen.getByText('Year:')).toBeInTheDocument();
        expect(screen.getByText('2024')).toBeInTheDocument();
        expect(screen.getByText('Series:')).toBeInTheDocument();
        expect(screen.getByText('MLB Series 1')).toBeInTheDocument();
        expect(screen.getByText('Material:')).toBeInTheDocument();
        expect(screen.getByText('Resin')).toBeInTheDocument();
        expect(screen.getByText('Height:')).toBeInTheDocument();
        expect(screen.getByText('8"')).toBeInTheDocument();
        expect(screen.getByText('Value:')).toBeInTheDocument();
        expect(screen.getByText('$49.99')).toBeInTheDocument();
        expect(screen.getByText('10 likes')).toBeInTheDocument();
        expect(screen.getByText('5 comments')).toBeInTheDocument();
        expect(screen.getByText('100 views')).toBeInTheDocument();
      });
    });

    it('should be disabled when isSelectionMode=true', () => {
      const bobblehead = createMockBobbleheadDashboardRecord({
        characterName: 'Baseball Player',
      });
      render(
        <BobbleheadCard
          {...defaultProps}
          bobblehead={bobblehead}
          isHoverCardEnabled={true}
          isSelectionMode={true}
        />,
      );

      // Hover card should not open in selection mode
      // The HoverCard component should have open={false}
      expect(screen.queryByText('Baseball Player')).not.toBeInTheDocument();
    });

    it('should not show hover card when isHoverCardEnabled=false', async () => {
      const bobblehead = createMockBobbleheadDashboardRecord({
        characterName: 'Baseball Player',
      });
      const { user } = render(
        <BobbleheadCard {...defaultProps} bobblehead={bobblehead} isHoverCardEnabled={false} />,
      );

      // Hover over the card trigger
      const card = screen.getByText(bobblehead.name!);
      await user.hover(card);

      // Wait a bit to ensure hover card doesn't appear
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Character name should not appear (it's only in the hover card)
      expect(screen.queryByText('Baseball Player')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility Tests', () => {
    it('should have proper ARIA attributes in selection mode', () => {
      const { container } = render(
        <BobbleheadCard {...defaultProps} isSelected={true} isSelectionMode={true} />,
      );

      // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
      const cardContainer = container.querySelector('[data-slot="hover-card-trigger"]');
      expect(cardContainer).toHaveAttribute('aria-checked', 'true');
      expect(cardContainer).toHaveAttribute('role', 'checkbox');
      expect(cardContainer).toHaveAttribute('tabIndex', '0');
    });

    it('should not have checkbox role when not in selection mode', () => {
      const { container } = render(<BobbleheadCard {...defaultProps} isSelectionMode={false} />);

      // Should not find a checkbox role on the card container
      // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
      const cardContainer = container.querySelector('[data-slot="hover-card-trigger"]');
      expect(cardContainer).not.toHaveAttribute('role');
    });

    it('should have proper tabIndex in selection mode', () => {
      const { container } = render(<BobbleheadCard {...defaultProps} isSelectionMode={true} />);

      // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
      const cardContainer = container.querySelector('[data-slot="hover-card-trigger"]');
      expect(cardContainer).toHaveAttribute('tabIndex', '0');
    });

    it('should not have tabIndex when not in selection mode', () => {
      const { container } = render(<BobbleheadCard {...defaultProps} isSelectionMode={false} />);

      // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
      const clickableDiv = container.querySelector('.cursor-pointer');
      expect(clickableDiv).not.toHaveAttribute('tabIndex');
    });
  });
});
