import type { ComponentProps, ElementType } from 'react';

import { FacebookIcon, InstagramIcon, LinkedinIcon, TwitterIcon } from 'lucide-react';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { seoConfig } from '@/lib/config/config';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

/**
 * Social platform configuration with icon and label
 */
type SocialPlatform = {
  icon: ElementType;
  label: string;
  name: string;
  url: string;
};

/**
 * Social platforms available for display
 */
const socialPlatformConfigs: Array<{
  icon: ElementType;
  label: string;
  name: 'facebook' | 'instagram' | 'linkedin' | 'twitter';
}> = [
  { icon: FacebookIcon, label: 'Follow us on Facebook', name: 'facebook' },
  { icon: TwitterIcon, label: 'Follow us on Twitter', name: 'twitter' },
  { icon: InstagramIcon, label: 'Follow us on Instagram', name: 'instagram' },
  { icon: LinkedinIcon, label: 'Connect with us on LinkedIn', name: 'linkedin' },
];

/**
 * Get active social platforms from config
 * Returns only platforms with non-empty URLs
 */
const getActiveSocialPlatforms = (): Array<SocialPlatform> => {
  const result: Array<SocialPlatform> = [];

  for (const config of socialPlatformConfigs) {
    const url = seoConfig.socialProfiles[config.name];
    if (url) {
      result.push({
        icon: config.icon,
        label: config.label,
        name: config.name,
        url,
      });
    }
  }

  return result;
};

type FooterSocialLinksProps = ComponentProps<'div'> & ComponentTestIdProps;

export const FooterSocialLinks = ({ className, testId, ...props }: FooterSocialLinksProps) => {
  const containerTestId = testId || generateTestId('layout', 'app-footer', 'social-links');

  // Get active platforms with non-empty URLs
  const _activePlatforms = getActiveSocialPlatforms();

  // Early return if no social profiles are configured
  const _hasNoActivePlatforms = _activePlatforms.length === 0;

  if (_hasNoActivePlatforms) {
    return null;
  }

  return (
    <div
      className={cn('flex items-center gap-4', className)}
      data-slot={'footer-social-links'}
      data-testid={containerTestId}
      {...props}
    >
      {/* Social Media Links */}
      {_activePlatforms.map((platform) => {
        const Icon = platform.icon;
        const linkTestId = generateTestId('layout', 'app-footer', `social-${platform.name}`);

        return (
          <a
            aria-label={platform.label}
            className={cn(
              'text-muted-foreground transition-colors',
              'hover:text-foreground focus:text-foreground',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'rounded-sm',
            )}
            data-slot={'footer-social-link'}
            data-testid={linkTestId}
            href={platform.url}
            key={platform.name}
            rel={'noopener noreferrer'}
            target={'_blank'}
          >
            <Icon aria-hidden className={'size-5'} />
          </a>
        );
      })}
    </div>
  );
};
