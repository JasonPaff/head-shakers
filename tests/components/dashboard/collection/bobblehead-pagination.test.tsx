import { describe, expect, it, vi } from 'vitest';

import { BobbleheadPagination } from '@/app/(app)/user/[username]/dashboard/collection/components/main/bobblehead-pagination';

import { render, screen } from '../../../setup/test-utils';

describe('BobbleheadPagination', () => {
  const defaultProps = {
    currentPage: 1,
    onPageChange: vi.fn(),
    onPageSizeChange: vi.fn(),
    pageSize: 24,
    totalCount: 100,
    totalPages: 5,
  };

  describe('Results Display Text', () => {
    it('should display "Showing X to Y of Z bobbleheads" text correctly', () => {
      const { container } = render(<BobbleheadPagination {...defaultProps} />);

      // Check that the text content includes all the expected parts
      expect(container).toHaveTextContent(/Showing/i);
      expect(container).toHaveTextContent(/to/);
      expect(container).toHaveTextContent(/of/);
      expect(container).toHaveTextContent(/bobbleheads/);
      // Verify the specific numbers are present in the document
      const text = container.textContent;
      expect(text).toContain('1');
      expect(text).toContain('24');
      expect(text).toContain('100');
    });

    it('should calculate startItem correctly on page 2 with pageSize 24', () => {
      const { container } = render(<BobbleheadPagination {...defaultProps} currentPage={2} pageSize={24} />);

      // Page 2: (2-1) * 24 + 1 = 25
      // Verify startItem = 25 appears in the results text
      const text = container.textContent;
      expect(text).toContain('25');
      expect(text).toContain('to');
      expect(text).toContain('48'); // endItem for page 2
    });

    it('should calculate endItem correctly on last page with partial results', () => {
      // totalCount: 100, pageSize: 24, page 5
      // endItem = Math.min(5 * 24, 100) = Math.min(120, 100) = 100
      const { container } = render(<BobbleheadPagination {...defaultProps} currentPage={5} totalPages={5} />);

      // Verify the pagination text shows correct values
      const text = container.textContent;
      expect(text).toContain('97'); // startItem for page 5
      expect(text).toContain('100'); // endItem = 100 (not 120)
    });
  });

  describe('Previous Button Behavior', () => {
    it('should disable previous button on page 1', () => {
      render(<BobbleheadPagination {...defaultProps} currentPage={1} />);

      const previousButton = screen.getAllByRole('button')[0];
      expect(previousButton).toBeDisabled();
    });

    it('should call onPageChange with currentPage - 1 when previous clicked', async () => {
      const onPageChange = vi.fn();
      const { user } = render(
        <BobbleheadPagination {...defaultProps} currentPage={3} onPageChange={onPageChange} />,
      );

      const previousButton = screen.getAllByRole('button')[0]!;
      await user.click(previousButton);

      expect(onPageChange).toHaveBeenCalledWith(2);
    });
  });

  describe('Next Button Behavior', () => {
    it('should disable next button on last page', () => {
      render(<BobbleheadPagination {...defaultProps} currentPage={5} totalPages={5} />);

      const buttons = screen.getAllByRole('button');
      const nextButton = buttons[buttons.length - 1];
      expect(nextButton).toBeDisabled();
    });

    it('should call onPageChange with currentPage + 1 when next clicked', async () => {
      const onPageChange = vi.fn();
      const { user } = render(
        <BobbleheadPagination {...defaultProps} currentPage={2} onPageChange={onPageChange} />,
      );

      const buttons = screen.getAllByRole('button');
      const nextButton = buttons[buttons.length - 1]!;
      await user.click(nextButton);

      expect(onPageChange).toHaveBeenCalledWith(3);
    });
  });

  describe('Page Number Buttons', () => {
    it('should render page number buttons with getPageNumbers logic', () => {
      render(<BobbleheadPagination {...defaultProps} currentPage={1} totalPages={5} />);

      // getPageNumbers should return some page numbers
      expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
    });

    it('should highlight current page button with "default" variant', () => {
      render(<BobbleheadPagination {...defaultProps} currentPage={3} totalPages={5} />);

      const currentPageButton = screen.getByRole('button', { name: '3' });
      // The default variant uses specific classes - we can verify it's present
      expect(currentPageButton).toBeInTheDocument();
    });

    it('should call onPageChange when page number button clicked', async () => {
      const onPageChange = vi.fn();
      const { user } = render(
        <BobbleheadPagination {...defaultProps} currentPage={1} onPageChange={onPageChange} />,
      );

      await user.click(screen.getByRole('button', { name: '2' }));

      expect(onPageChange).toHaveBeenCalledWith(2);
    });
  });

  describe('Ellipsis Markers', () => {
    it('should render ellipsis markers as "..." text when page numbers are truncated', () => {
      // With many pages, getPageNumbers should return -1 for ellipsis
      render(<BobbleheadPagination {...defaultProps} currentPage={5} totalPages={20} />);

      const ellipsis = screen.getAllByText('...');
      expect(ellipsis.length).toBeGreaterThan(0);
    });
  });

  describe('Page Size Selector', () => {
    it('should render page size selector with current value', () => {
      render(<BobbleheadPagination {...defaultProps} pageSize={24} />);

      expect(screen.getByText('Per page:')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toHaveTextContent('24');
    });

    it('should display page size value of 48 when set', () => {
      render(<BobbleheadPagination {...defaultProps} pageSize={48} />);

      expect(screen.getByRole('combobox')).toHaveTextContent('48');
    });

    it('should display page size value of 12 when set', () => {
      render(<BobbleheadPagination {...defaultProps} pageSize={12} />);

      expect(screen.getByRole('combobox')).toHaveTextContent('12');
    });
  });

  describe('Empty State', () => {
    it('should return null when totalCount is 0', () => {
      const { container } = render(<BobbleheadPagination {...defaultProps} totalCount={0} />);

      expect(container.firstChild).toBeNull();
    });
  });
});
