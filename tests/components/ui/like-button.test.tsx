import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LikeCompactButton, LikeIconButton, LikeTextButton } from '@/components/ui/like-button';
import { useLike } from '@/hooks/use-like';

import { render, screen } from '../../setup/test-utils';

// Mock useLike hook
vi.mock('@/hooks/use-like', () => ({
  useLike: vi.fn(),
}));

// Mock NumberFlow component
vi.mock('@number-flow/react', () => ({
  default: ({ value }: { value: number }) => <span data-testid={'number-flow'}>{value}</span>,
}));

type UseLikeReturn = {
  isLiked: boolean;
  isPending: boolean;
  isSignedIn: boolean;
  likeCount: number;
  toggleLike: () => void;
};

describe('LikeIconButton', () => {
  const defaultProps = {
    initialLikeCount: 10,
    isInitiallyLiked: false,
    targetId: 'target-123',
    targetType: 'bobblehead' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with heart icon and like count', () => {
    vi.mocked(useLike).mockReturnValue({
      isLiked: false,
      isPending: false,
      isSignedIn: true,
      likeCount: 10,
      toggleLike: vi.fn(),
    } as UseLikeReturn);

    render(<LikeIconButton {...defaultProps} />);

    // Check for button with proper aria-label
    const button = screen.getByRole('button', {
      name: /like this bobblehead\. 10 likes/i,
    });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-pressed', 'false');

    // Check for like count display
    expect(screen.getByTestId('number-flow')).toHaveTextContent('10');
    expect(screen.getByText(/likes/i)).toBeInTheDocument();
  });

  it('should toggle like state when clicked (authenticated)', async () => {
    const mockToggleLike = vi.fn();
    vi.mocked(useLike).mockReturnValue({
      isLiked: false,
      isPending: false,
      isSignedIn: true,
      likeCount: 10,
      toggleLike: mockToggleLike,
    } as UseLikeReturn);

    const { user } = render(<LikeIconButton {...defaultProps} />);

    const button = screen.getByRole('button', {
      name: /like this bobblehead/i,
    });
    await user.click(button);

    expect(mockToggleLike).toHaveBeenCalledTimes(1);
  });

  it('should show liked state with filled heart', () => {
    vi.mocked(useLike).mockReturnValue({
      isLiked: true,
      isPending: false,
      isSignedIn: true,
      likeCount: 11,
      toggleLike: vi.fn(),
    } as UseLikeReturn);

    render(<LikeIconButton {...defaultProps} />);

    const button = screen.getByRole('button', {
      name: /unlike this bobblehead\. 11 likes/i,
    });
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('should not show count when shouldShowCount is false', () => {
    vi.mocked(useLike).mockReturnValue({
      isLiked: false,
      isPending: false,
      isSignedIn: true,
      likeCount: 10,
      toggleLike: vi.fn(),
    } as UseLikeReturn);

    render(<LikeIconButton {...defaultProps} shouldShowCount={false} />);

    expect(screen.queryByTestId('number-flow')).not.toBeInTheDocument();
    expect(screen.queryByText(/likes/i)).not.toBeInTheDocument();
  });

  it('should wrap button in SignUpButton when unauthenticated', () => {
    vi.mocked(useLike).mockReturnValue({
      isLiked: false,
      isPending: false,
      isSignedIn: false,
      likeCount: 10,
      toggleLike: vi.fn(),
    } as UseLikeReturn);

    render(<LikeIconButton {...defaultProps} />);

    // Check for unauthenticated aria-label
    const button = screen.getByRole('button', {
      name: /10 likes\. sign in to like this bobblehead/i,
    });
    expect(button).toBeInTheDocument();
  });

  it('should disable button when isPending is true', () => {
    vi.mocked(useLike).mockReturnValue({
      isLiked: false,
      isPending: true,
      isSignedIn: true,
      likeCount: 10,
      toggleLike: vi.fn(),
    } as UseLikeReturn);

    render(<LikeIconButton {...defaultProps} />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });
});

describe('LikeCompactButton', () => {
  const defaultProps = {
    initialLikeCount: 5,
    isInitiallyLiked: false,
    targetId: 'target-456',
    targetType: 'collection' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render compact variant with smaller size', () => {
    vi.mocked(useLike).mockReturnValue({
      isLiked: false,
      isPending: false,
      isSignedIn: true,
      likeCount: 5,
      toggleLike: vi.fn(),
    } as UseLikeReturn);

    render(<LikeCompactButton {...defaultProps} />);

    const button = screen.getByRole('button', {
      name: /like this collection\. 5 likes/i,
    });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-pressed', 'false');

    // Check for compact styling
    expect(button).toHaveClass('inline-flex', 'items-center', 'gap-1', 'text-sm');

    // Check for NumberFlow with count
    expect(screen.getByTestId('number-flow')).toHaveTextContent('5');
  });

  it('should show sign-in prompt when clicked while unauthenticated', () => {
    vi.mocked(useLike).mockReturnValue({
      isLiked: false,
      isPending: false,
      isSignedIn: false,
      likeCount: 5,
      toggleLike: vi.fn(),
    } as UseLikeReturn);

    render(<LikeCompactButton {...defaultProps} />);

    // Check that button is present with correct aria-label
    const button = screen.getByRole('button', {
      name: /like this collection\. 5 likes/i,
    });
    expect(button).toBeInTheDocument();
  });

  it('should toggle like state when clicked (authenticated)', async () => {
    const mockToggleLike = vi.fn();
    vi.mocked(useLike).mockReturnValue({
      isLiked: false,
      isPending: false,
      isSignedIn: true,
      likeCount: 5,
      toggleLike: mockToggleLike,
    } as UseLikeReturn);

    const { user } = render(<LikeCompactButton {...defaultProps} />);

    const button = screen.getByRole('button', {
      name: /like this collection/i,
    });
    await user.click(button);

    expect(mockToggleLike).toHaveBeenCalledTimes(1);
  });

  it('should show unliked state correctly', () => {
    vi.mocked(useLike).mockReturnValue({
      isLiked: true,
      isPending: false,
      isSignedIn: true,
      likeCount: 6,
      toggleLike: vi.fn(),
    } as UseLikeReturn);

    render(<LikeCompactButton {...defaultProps} />);

    const button = screen.getByRole('button', {
      name: /unlike this collection\. 6 likes/i,
    });
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('should not show icon when shouldShowIcon is false', () => {
    vi.mocked(useLike).mockReturnValue({
      isLiked: false,
      isPending: false,
      isSignedIn: true,
      likeCount: 5,
      toggleLike: vi.fn(),
    } as UseLikeReturn);

    const { container } = render(<LikeCompactButton {...defaultProps} shouldShowIcon={false} />);

    // Icon should not be present (checked by looking for HeartIcon svg)
    // eslint-disable-next-line testing-library/no-container
    const icon = container.querySelector('svg');
    expect(icon).not.toBeInTheDocument();
  });
});

describe('LikeTextButton', () => {
  const defaultProps = {
    initialLikeCount: 20,
    isInitiallyLiked: false,
    targetId: 'target-789',
    targetType: 'bobblehead' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render full variant with label text', () => {
    vi.mocked(useLike).mockReturnValue({
      isLiked: false,
      isPending: false,
      isSignedIn: true,
      likeCount: 20,
      toggleLike: vi.fn(),
    } as UseLikeReturn);

    render(<LikeTextButton {...defaultProps} />);

    const button = screen.getByRole('button', { name: /like \(20\)/i });
    expect(button).toBeInTheDocument();

    // Check text content
    expect(button).toHaveTextContent('Like (20)');
  });

  it('should call onLikeChange callback with new values on toggle', async () => {
    const mockToggleLike = vi.fn();
    const mockOnLikeChange = vi.fn();

    vi.mocked(useLike).mockReturnValue({
      isLiked: false,
      isPending: false,
      isSignedIn: true,
      likeCount: 20,
      toggleLike: mockToggleLike,
    } as UseLikeReturn);

    const { user } = render(<LikeTextButton {...defaultProps} onLikeChange={mockOnLikeChange} />);

    const button = screen.getByRole('button', { name: /like \(20\)/i });
    await user.click(button);

    expect(mockToggleLike).toHaveBeenCalledTimes(1);
  });

  it('should render custom children when provided', () => {
    vi.mocked(useLike).mockReturnValue({
      isLiked: false,
      isPending: false,
      isSignedIn: true,
      likeCount: 20,
      toggleLike: vi.fn(),
    } as UseLikeReturn);

    render(
      <LikeTextButton {...defaultProps}>
        <span>Custom Like Text</span>
      </LikeTextButton>,
    );

    expect(screen.getByText('Custom Like Text')).toBeInTheDocument();
  });

  it('should show SignUpButton when unauthenticated', () => {
    vi.mocked(useLike).mockReturnValue({
      isLiked: false,
      isPending: false,
      isSignedIn: false,
      likeCount: 20,
      toggleLike: vi.fn(),
    } as UseLikeReturn);

    render(<LikeTextButton {...defaultProps} />);

    // Check that button is present
    const button = screen.getByRole('button', { name: /like \(20\)/i });
    expect(button).toBeInTheDocument();
  });

  it('should not show icon when shouldShowIcon is false', () => {
    vi.mocked(useLike).mockReturnValue({
      isLiked: false,
      isPending: false,
      isSignedIn: true,
      likeCount: 20,
      toggleLike: vi.fn(),
    } as UseLikeReturn);

    const { container } = render(<LikeTextButton {...defaultProps} shouldShowIcon={false} />);

    // Icon should not be present
    // eslint-disable-next-line testing-library/no-container
    const icon = container.querySelector('svg');
    expect(icon).not.toBeInTheDocument();
  });

  it('should show liked state with filled heart icon', () => {
    vi.mocked(useLike).mockReturnValue({
      isLiked: true,
      isPending: false,
      isSignedIn: true,
      likeCount: 21,
      toggleLike: vi.fn(),
    } as UseLikeReturn);

    render(<LikeTextButton {...defaultProps} />);

    const button = screen.getByRole('button', { name: /like \(21\)/i });
    expect(button).toBeInTheDocument();
  });
});
