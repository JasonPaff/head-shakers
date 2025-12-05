import { describe, expect, it } from 'vitest';

import { BobbleheadGrid } from '@/app/(app)/dashboard/collection/(collection)/components/main/bobblehead-grid';

import { render, screen } from '../../../setup/test-utils';

describe('BobbleheadGrid', () => {
  describe('Grid Layout Rendering', () => {
    it('should render children in grid layout with compact density', () => {
      render(
        <BobbleheadGrid gridDensity={'compact'}>
          <div>Bobblehead 1</div>
          <div>Bobblehead 2</div>
          <div>Bobblehead 3</div>
        </BobbleheadGrid>,
      );

      expect(screen.getByText('Bobblehead 1')).toBeInTheDocument();
      expect(screen.getByText('Bobblehead 2')).toBeInTheDocument();
      expect(screen.getByText('Bobblehead 3')).toBeInTheDocument();
    });

    it('should render children in grid layout with comfortable density', () => {
      render(
        <BobbleheadGrid gridDensity={'comfortable'}>
          <div>Bobblehead A</div>
          <div>Bobblehead B</div>
        </BobbleheadGrid>,
      );

      expect(screen.getByText('Bobblehead A')).toBeInTheDocument();
      expect(screen.getByText('Bobblehead B')).toBeInTheDocument();
    });
  });

  describe('Grid Column Classes', () => {
    it('should apply correct grid column classes for compact density', () => {
      const { container } = render(
        <BobbleheadGrid gridDensity={'compact'}>
          <div>Item</div>
        </BobbleheadGrid>,
      );

      // eslint-disable-next-line testing-library/no-container
      const gridElement = container.querySelector('[data-slot="bobblehead-grid"]');
      expect(gridElement).toBeInTheDocument();
      expect(gridElement).toHaveClass('grid');
      expect(gridElement).toHaveClass('gap-4');
      expect(gridElement).toHaveClass('grid-cols-3');
      expect(gridElement).toHaveClass('sm:grid-cols-4');
      expect(gridElement).toHaveClass('md:grid-cols-5');
      expect(gridElement).toHaveClass('lg:grid-cols-6');
      expect(gridElement).toHaveClass('xl:grid-cols-7');
    });

    it('should apply correct grid column classes for comfortable density', () => {
      const { container } = render(
        <BobbleheadGrid gridDensity={'comfortable'}>
          <div>Item</div>
        </BobbleheadGrid>,
      );

      // eslint-disable-next-line testing-library/no-container
      const gridElement = container.querySelector('[data-slot="bobblehead-grid"]');
      expect(gridElement).toBeInTheDocument();
      expect(gridElement).toHaveClass('grid');
      expect(gridElement).toHaveClass('gap-4');
      expect(gridElement).toHaveClass('grid-cols-2');
      expect(gridElement).toHaveClass('sm:grid-cols-2');
      expect(gridElement).toHaveClass('md:grid-cols-3');
      expect(gridElement).toHaveClass('lg:grid-cols-4');
      expect(gridElement).toHaveClass('xl:grid-cols-5');
    });
  });

  describe('Empty State Rendering', () => {
    it('should render empty state centered when isEmpty is true', () => {
      const { container } = render(
        <BobbleheadGrid gridDensity={'compact'} isEmpty={true}>
          <div>No bobbleheads found</div>
        </BobbleheadGrid>,
      );

      expect(screen.getByText('No bobbleheads found')).toBeInTheDocument();

      // Empty state should not use the grid, verify by checking that grid slot is not present
      // eslint-disable-next-line testing-library/no-container
      const gridElement = container.querySelector('[data-slot="bobblehead-grid"]');
      expect(gridElement).not.toBeInTheDocument();
    });

    it('should render grid normally when isEmpty is false', () => {
      const { container } = render(
        <BobbleheadGrid gridDensity={'compact'} isEmpty={false}>
          <div>Bobblehead 1</div>
        </BobbleheadGrid>,
      );

      expect(screen.getByText('Bobblehead 1')).toBeInTheDocument();
      // eslint-disable-next-line testing-library/no-container
      const gridElement = container.querySelector('[data-slot="bobblehead-grid"]');
      expect(gridElement).toBeInTheDocument();
    });
  });

  describe('Data Slot Attributes', () => {
    it('should use correct data-slot for grid container', () => {
      const { container } = render(
        <BobbleheadGrid gridDensity={'compact'}>
          <div>Item</div>
        </BobbleheadGrid>,
      );

      // eslint-disable-next-line testing-library/no-container
      const containerElement = container.querySelector('[data-slot="bobblehead-grid-container"]');
      expect(containerElement).toBeInTheDocument();
      expect(containerElement).toHaveAttribute('data-slot', 'bobblehead-grid-container');
    });

    it('should use correct data-slot for bobblehead grid element', () => {
      const { container } = render(
        <BobbleheadGrid gridDensity={'compact'}>
          <div>Item</div>
        </BobbleheadGrid>,
      );

      // eslint-disable-next-line testing-library/no-container
      const gridElement = container.querySelector('[data-slot="bobblehead-grid"]');
      expect(gridElement).toBeInTheDocument();
      expect(gridElement).toHaveAttribute('data-slot', 'bobblehead-grid');
    });

    it('should not render grid slot when empty state is shown', () => {
      const { container } = render(
        <BobbleheadGrid gridDensity={'compact'} isEmpty={true}>
          <div>Empty message</div>
        </BobbleheadGrid>,
      );

      // Container should still be present
      // eslint-disable-next-line testing-library/no-container
      const containerElement = container.querySelector('[data-slot="bobblehead-grid-container"]');
      expect(containerElement).toBeInTheDocument();

      // Grid element should not be present in empty state
      // eslint-disable-next-line testing-library/no-container
      const gridElement = container.querySelector('[data-slot="bobblehead-grid"]');
      expect(gridElement).not.toBeInTheDocument();
    });
  });

  describe('Container Styling', () => {
    it('should apply padding classes to container', () => {
      const { container } = render(
        <BobbleheadGrid gridDensity={'compact'}>
          <div>Item</div>
        </BobbleheadGrid>,
      );

      // eslint-disable-next-line testing-library/no-container
      const containerElement = container.querySelector('[data-slot="bobblehead-grid-container"]');
      expect(containerElement).toHaveClass('p-4');
      expect(containerElement).toHaveClass('pb-8');
    });

    it('should apply centering classes to empty state wrapper', () => {
      const { container } = render(
        <BobbleheadGrid gridDensity={'comfortable'} isEmpty={true}>
          <div>Empty</div>
        </BobbleheadGrid>,
      );

      // eslint-disable-next-line testing-library/no-container
      const containerElement = container.querySelector('[data-slot="bobblehead-grid-container"]');
      expect(containerElement).toBeInTheDocument();

       
      const emptyWrapper = containerElement!.firstElementChild;

      expect(emptyWrapper).toHaveClass('flex');
      expect(emptyWrapper).toHaveClass('h-full');
      expect(emptyWrapper).toHaveClass('items-center');
      expect(emptyWrapper).toHaveClass('justify-center');
    });
  });
});
