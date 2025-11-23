import { describe, expect, it } from 'vitest';

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { render, screen } from '../../setup/test-utils';

describe('Card', () => {
  describe('Card', () => {
    it('renders children', () => {
      render(<Card>Card content</Card>);
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('renders with custom testId', () => {
      render(<Card testId={'custom-card'}>Content</Card>);
      expect(screen.getByTestId('custom-card')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <Card className={'p-1'} testId={'styled-card'}>
          Content
        </Card>,
      );
      expect(screen.getByTestId('styled-card')).toHaveClass('p-1');
    });

    it('has correct data-slot attribute', () => {
      render(<Card>Content</Card>);
      expect(screen.getByText('Content')).toHaveAttribute('data-slot', 'card');
    });
  });

  describe('CardHeader', () => {
    it('renders children', () => {
      render(<CardHeader>Header content</CardHeader>);
      expect(screen.getByText('Header content')).toBeInTheDocument();
    });

    it('renders with custom testId', () => {
      render(<CardHeader testId={'custom-header'}>Header</CardHeader>);
      expect(screen.getByTestId('custom-header')).toBeInTheDocument();
    });

    it('has correct data-slot attribute', () => {
      render(<CardHeader>Header</CardHeader>);
      expect(screen.getByText('Header')).toHaveAttribute('data-slot', 'card-header');
    });
  });

  describe('CardTitle', () => {
    it('renders children', () => {
      render(<CardTitle>Title text</CardTitle>);
      expect(screen.getByText('Title text')).toBeInTheDocument();
    });

    it('renders with custom testId', () => {
      render(<CardTitle testId={'custom-title'}>Title</CardTitle>);
      expect(screen.getByTestId('custom-title')).toBeInTheDocument();
    });

    it('has correct styling', () => {
      render(<CardTitle>Title</CardTitle>);
      expect(screen.getByText('Title')).toHaveClass('font-semibold');
    });

    it('has correct data-slot attribute', () => {
      render(<CardTitle>Title</CardTitle>);
      expect(screen.getByText('Title')).toHaveAttribute('data-slot', 'card-title');
    });
  });

  describe('CardDescription', () => {
    it('renders children', () => {
      render(<CardDescription>Description text</CardDescription>);
      expect(screen.getByText('Description text')).toBeInTheDocument();
    });

    it('renders with custom testId', () => {
      render(<CardDescription testId={'custom-desc'}>Description</CardDescription>);
      expect(screen.getByTestId('custom-desc')).toBeInTheDocument();
    });

    it('has correct styling', () => {
      render(<CardDescription>Description</CardDescription>);
      expect(screen.getByText('Description')).toHaveClass('text-muted-foreground');
    });

    it('has correct data-slot attribute', () => {
      render(<CardDescription>Description</CardDescription>);
      expect(screen.getByText('Description')).toHaveAttribute('data-slot', 'card-description');
    });
  });

  describe('CardContent', () => {
    it('renders children', () => {
      render(<CardContent>Content area</CardContent>);
      expect(screen.getByText('Content area')).toBeInTheDocument();
    });

    it('renders with custom testId', () => {
      render(<CardContent testId={'custom-content'}>Content</CardContent>);
      expect(screen.getByTestId('custom-content')).toBeInTheDocument();
    });

    it('has correct data-slot attribute', () => {
      render(<CardContent>Content</CardContent>);
      expect(screen.getByText('Content')).toHaveAttribute('data-slot', 'card-content');
    });
  });

  describe('CardFooter', () => {
    it('renders children', () => {
      render(<CardFooter>Footer content</CardFooter>);
      expect(screen.getByText('Footer content')).toBeInTheDocument();
    });

    it('renders with custom testId', () => {
      render(<CardFooter testId={'custom-footer'}>Footer</CardFooter>);
      expect(screen.getByTestId('custom-footer')).toBeInTheDocument();
    });

    it('has correct data-slot attribute', () => {
      render(<CardFooter>Footer</CardFooter>);
      expect(screen.getByText('Footer')).toHaveAttribute('data-slot', 'card-footer');
    });
  });

  describe('CardAction', () => {
    it('renders children', () => {
      render(<CardAction>Action content</CardAction>);
      expect(screen.getByText('Action content')).toBeInTheDocument();
    });

    it('renders with custom testId', () => {
      render(<CardAction testId={'custom-action'}>Action</CardAction>);
      expect(screen.getByTestId('custom-action')).toBeInTheDocument();
    });

    it('has correct data-slot attribute', () => {
      render(<CardAction>Action</CardAction>);
      expect(screen.getByText('Action')).toHaveAttribute('data-slot', 'card-action');
    });
  });

  describe('composition', () => {
    it('renders full card with all components', () => {
      render(
        <Card testId={'full-card'}>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>
            <CardAction>Action</CardAction>
          </CardHeader>
          <CardContent>Main content goes here</CardContent>
          <CardFooter>Footer content</CardFooter>
        </Card>,
      );

      expect(screen.getByTestId('full-card')).toBeInTheDocument();
      expect(screen.getByText('Card Title')).toBeInTheDocument();
      expect(screen.getByText('Card Description')).toBeInTheDocument();
      expect(screen.getByText('Action')).toBeInTheDocument();
      expect(screen.getByText('Main content goes here')).toBeInTheDocument();
      expect(screen.getByText('Footer content')).toBeInTheDocument();
    });
  });
});
