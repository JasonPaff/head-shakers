import { describe, expect, it } from 'vitest';

import { Spinner } from '@/components/ui/spinner';

import { render, screen } from '../../setup/test-utils';

describe('Spinner', () => {
  describe('rendering', () => {
    it('renders spinner element', () => {
      render(<Spinner />);
      expect(screen.getByTestId(/spinner/)).toBeInTheDocument();
    });

    it('renders with custom testId', () => {
      render(<Spinner testId={'custom-spinner'} />);
      expect(screen.getByTestId('custom-spinner')).toBeInTheDocument();
    });

    it('renders two inner divs for animation', () => {
      render(<Spinner testId={'spinner'} />);
      const spinner = screen.getByTestId('spinner');
      const innerDivs = spinner.querySelectorAll('div');
      expect(innerDivs.length).toBe(2);
    });
  });

  describe('styling', () => {
    it('has default size class', () => {
      render(<Spinner testId={'spinner'} />);
      expect(screen.getByTestId('spinner')).toHaveClass('size-12');
    });

    it('applies custom className', () => {
      render(<Spinner className={'custom-class'} testId={'spinner'} />);
      expect(screen.getByTestId('spinner')).toHaveClass('custom-class');
    });

    it('allows size override via className', () => {
      render(<Spinner className={'size-8'} testId={'spinner'} />);
      const spinner = screen.getByTestId('spinner');
      expect(spinner).toHaveClass('size-8');
    });

    it('has animation class on inner element', () => {
      render(<Spinner testId={'spinner'} />);
      const spinner = screen.getByTestId('spinner');
      const animatedDiv = spinner.querySelector('.animate-spin');
      expect(animatedDiv).toBeInTheDocument();
    });
  });

  describe('structure', () => {
    it('has relative positioning', () => {
      render(<Spinner testId={'spinner'} />);
      expect(screen.getByTestId('spinner')).toHaveClass('relative');
    });

    it('has background ring element', () => {
      render(<Spinner testId={'spinner'} />);
      const spinner = screen.getByTestId('spinner');
      const backgroundRing = spinner.querySelector('.border-muted');
      expect(backgroundRing).toBeInTheDocument();
    });

    it('has foreground spinning element', () => {
      render(<Spinner testId={'spinner'} />);
      const spinner = screen.getByTestId('spinner');
      const spinningRing = spinner.querySelector('.border-primary');
      expect(spinningRing).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should be accessible as a loading indicator', () => {
      render(
        <div aria-busy={'true'} aria-label={'Loading content'} role={'status'}>
          <Spinner />
        </div>,
      );
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });
});
