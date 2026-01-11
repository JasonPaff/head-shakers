import { describe, expect, it, vi } from 'vitest';

import { BulkActionsBar } from '@/app/(app)/user/[username]/dashboard/collection/components/main/bulk-actions-bar';

import { render, screen } from '../../../setup/test-utils';

describe('BulkActionsBar', () => {
  const defaultProps = {
    isAllSelected: false,
    onBulkDelete: vi.fn(),
    onBulkFeature: vi.fn(),
    onSelectAll: vi.fn(),
    selectedCount: 5,
  };

  describe('Selected Count Display', () => {
    it('should display correct selected count with singular item text', () => {
      render(<BulkActionsBar {...defaultProps} selectedCount={1} />);

      expect(screen.getByText('1 item selected')).toBeInTheDocument();
    });

    it('should display correct selected count with plural items text', () => {
      render(<BulkActionsBar {...defaultProps} selectedCount={5} />);

      expect(screen.getByText('5 items selected')).toBeInTheDocument();
    });
  });

  describe('Select All Button Behavior', () => {
    it('should call onSelectAll when "Select All" button is clicked', async () => {
      const onSelectAll = vi.fn();
      const { user } = render(
        <BulkActionsBar {...defaultProps} isAllSelected={false} onSelectAll={onSelectAll} />,
      );

      await user.click(screen.getByRole('button', { name: /select all/i }));

      expect(onSelectAll).toHaveBeenCalledTimes(1);
    });

    it('should call onSelectAll when "Deselect All" button is clicked', async () => {
      const onSelectAll = vi.fn();
      const { user } = render(
        <BulkActionsBar {...defaultProps} isAllSelected={true} onSelectAll={onSelectAll} />,
      );

      await user.click(screen.getByRole('button', { name: /deselect all/i }));

      expect(onSelectAll).toHaveBeenCalledTimes(1);
    });

    it('should show "Deselect All" text when isAllSelected is true', () => {
      render(<BulkActionsBar {...defaultProps} isAllSelected={true} />);

      expect(screen.getByRole('button', { name: /deselect all/i })).toBeInTheDocument();
    });

    it('should show "Select All" text when isAllSelected is false', () => {
      render(<BulkActionsBar {...defaultProps} isAllSelected={false} />);

      expect(screen.getByRole('button', { name: /select all/i })).toBeInTheDocument();
    });
  });

  describe('Bulk Action Buttons', () => {
    it('should call onBulkFeature when "Feature Selected" button is clicked', async () => {
      const onBulkFeature = vi.fn();
      const { user } = render(<BulkActionsBar {...defaultProps} onBulkFeature={onBulkFeature} />);

      await user.click(screen.getByRole('button', { name: /feature selected/i }));

      expect(onBulkFeature).toHaveBeenCalledTimes(1);
    });

    it('should call onBulkDelete when "Delete Selected" button is clicked', async () => {
      const onBulkDelete = vi.fn();
      const { user } = render(<BulkActionsBar {...defaultProps} onBulkDelete={onBulkDelete} />);

      await user.click(screen.getByRole('button', { name: /delete selected/i }));

      expect(onBulkDelete).toHaveBeenCalledTimes(1);
    });
  });

  describe('Responsive Button Text Display', () => {
    it('should hide button text on mobile for Feature Selected button', () => {
      render(<BulkActionsBar {...defaultProps} />);

      const featureButton = screen.getByRole('button', { name: /feature selected/i });

      const featureButtonText = featureButton.querySelector('.hidden.sm\\:inline');

      expect(featureButtonText).toBeInTheDocument();
      expect(featureButtonText).toHaveClass('hidden');
      expect(featureButtonText).toHaveClass('sm:inline');
      expect(featureButtonText).toHaveTextContent('Feature Selected');
    });

    it('should hide button text on mobile for Delete Selected button', () => {
      render(<BulkActionsBar {...defaultProps} />);

      const deleteButton = screen.getByRole('button', { name: /delete selected/i });

      const deleteButtonText = deleteButton.querySelector('.hidden.sm\\:inline');

      expect(deleteButtonText).toBeInTheDocument();
      expect(deleteButtonText).toHaveClass('hidden');
      expect(deleteButtonText).toHaveClass('sm:inline');
      expect(deleteButtonText).toHaveTextContent('Delete Selected');
    });
  });

  describe('Component Structure and Styling', () => {
    it('should render with primary border styling on Card', () => {
      const { container } = render(<BulkActionsBar {...defaultProps} />);

      // eslint-disable-next-line testing-library/no-container
      const cardElement = container.querySelector('.border-primary');
      expect(cardElement).toBeInTheDocument();
    });

    it('should use correct data-slot for test targeting', () => {
      const { container } = render(<BulkActionsBar {...defaultProps} />);

      // eslint-disable-next-line testing-library/no-container
      const barElement = container.querySelector('[data-slot="bulk-actions-bar"]');
      expect(barElement).toBeInTheDocument();
      expect(barElement).toHaveAttribute('data-slot', 'bulk-actions-bar');
    });
  });
});
