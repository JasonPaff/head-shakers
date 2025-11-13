'use client';

import { $path } from 'next-typesafe-url';
import { toast } from 'sonner';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  copyToClipboard,
  generateAbsoluteUrl,
  generateSocialShareUrl,
  openShareWindow,
} from '@/lib/utils/share-utils';

type BobbleheadShareMenuProps = Children & {
  bobbleheadSlug: string;
};

export function BobbleheadShareMenu({ bobbleheadSlug, children }: BobbleheadShareMenuProps) {
  const handleCopyLink = async () => {
    try {
      const relativePath = $path({
        route: '/bobbleheads/[bobbleheadSlug]',
        routeParams: { bobbleheadSlug },
      });
      const absoluteUrl = generateAbsoluteUrl(relativePath);
      const success = await copyToClipboard(absoluteUrl);

      if (success) {
        toast.success('Link copied to clipboard!');
      } else {
        toast.error('Failed to copy link. Please try again.');
      }
    } catch {
      toast.error('Failed to copy link. Please try again.');
    }
  };

  const handleShareToTwitter = () => {
    try {
      const relativePath = $path({
        route: '/bobbleheads/[bobbleheadSlug]',
        routeParams: { bobbleheadSlug },
      });
      const absoluteUrl = generateAbsoluteUrl(relativePath);
      const shareUrl = generateSocialShareUrl('twitter', {
        title: 'Check out this bobblehead!',
        url: absoluteUrl,
      });
      openShareWindow(shareUrl);
    } catch {
      toast.error('Failed to open share window. Please try again.');
    }
  };

  const handleShareToFacebook = () => {
    try {
      const relativePath = $path({
        route: '/bobbleheads/[bobbleheadSlug]',
        routeParams: { bobbleheadSlug },
      });
      const absoluteUrl = generateAbsoluteUrl(relativePath);
      const shareUrl = generateSocialShareUrl('facebook', {
        url: absoluteUrl,
      });
      openShareWindow(shareUrl);
    } catch {
      toast.error('Failed to open share window. Please try again.');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align={'end'}>
        <DropdownMenuItem onClick={handleCopyLink}>Copy Link</DropdownMenuItem>
        <DropdownMenuItem onClick={handleShareToTwitter}>Share on X</DropdownMenuItem>
        <DropdownMenuItem onClick={handleShareToFacebook}>Share on Facebook</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
