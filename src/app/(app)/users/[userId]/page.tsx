import type { Metadata } from 'next';

import { Settings } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import { withParamValidation } from 'next-typesafe-url/app/hoc';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import type { PageProps } from '@/app/(app)/users/[userId]/route-type';

import { Route } from '@/app/(app)/users/[userId]/route-type';
import { ViewTracker } from '@/components/analytics/view-tracker';
import { ContentLayout } from '@/components/layout/content-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UsersFacade } from '@/lib/facades/users/users.facade';
import { generateBreadcrumbSchema, generatePersonSchema } from '@/lib/seo/jsonld.utils';
import { generatePageMetadata, serializeJsonLd } from '@/lib/seo/metadata.utils';
import { DEFAULT_SITE_METADATA, FALLBACK_METADATA } from '@/lib/seo/seo.constants';
import { extractPublicIdFromCloudinaryUrl, generateOpenGraphImageUrl } from '@/lib/utils/cloudinary.utils';
import { checkIsOwnerAsync } from '@/utils/optional-auth-utils';
import { cn } from '@/utils/tailwind-utils';

type UserPageProps = PageProps;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ userId: string }>;
}): Promise<Metadata> {
  const { userId } = await params;

  // Fetch user data
  const user = await UsersFacade.getUserByClerkIdAsync(userId);

  // Handle user not found
  if (!user) {
    return {
      description: 'User not found',
      robots: 'noindex, nofollow',
      title: 'User Not Found | Head Shakers',
    };
  }

  // Generate canonical URL for this user profile
  const canonicalUrl = `${DEFAULT_SITE_METADATA.url}${$path({ route: '/users/[userId]', routeParams: { userId } })}`;

  // Prepare profile image URL for social sharing
  let profileImage: string = FALLBACK_METADATA.imageUrl;

  if (user.avatarUrl) {
    // Extract Cloudinary public ID from avatar URL and optimize for Open Graph
    const publicId = extractPublicIdFromCloudinaryUrl(user.avatarUrl);
    profileImage = generateOpenGraphImageUrl(publicId);
  }

  // Use bio as description or fallback to a default
  const description =
    user.bio || `${user.username}'s profile on Head Shakers - Bobblehead Collection Platform`;

  // Generate page metadata with OG and Twitter cards
  return generatePageMetadata(
    'profile',
    {
      description,
      images: [profileImage],
      title: user.username,
      url: canonicalUrl,
      userId: user.id,
    },
    {
      isPublic: true,
      shouldIncludeOpenGraph: true,
      shouldIncludeTwitterCard: true,
      shouldUseTitleTemplate: true,
    },
  );
}

async function UserPage({ routeParams }: UserPageProps) {
  const { userId } = await routeParams;

  // fetch user data
  const user = await UsersFacade.getUserByClerkIdAsync(userId);

  if (!user) {
    notFound();
  }

  // Check if current user is viewing their own profile
  const isOwner = await checkIsOwnerAsync(user.id);

  // Generate canonical URL for JSON-LD schemas
  const profileUrl = `${DEFAULT_SITE_METADATA.url}${$path({ route: '/users/[userId]', routeParams: { userId } })}`;

  // Generate Person schema for user profile
  const personSchema = generatePersonSchema({
    description: user.bio || undefined,
    image: user.avatarUrl || undefined,
    name: user.username,
    url: profileUrl,
    userId: user.id,
  });

  // Generate Breadcrumb schema for navigation context
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: DEFAULT_SITE_METADATA.url },
    { name: 'Users', url: `${DEFAULT_SITE_METADATA.url}/users` },
    { name: user.username }, // Current page - no URL
  ]);

  return (
    <ViewTracker targetId={userId} targetType={'profile'}>
      {/* JSON-LD structured data */}
      <script
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(personSchema) }}
        type={'application/ld+json'}
      />
      <script
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbSchema) }}
        type={'application/ld+json'}
      />

      <div className={'py-8'}>
        <ContentLayout>
          <div className={'mx-auto max-w-4xl'}>
            {/* Profile Header */}
            <Card className={'mb-8'}>
              <CardHeader>
                <div className={'flex items-start justify-between'}>
                  <div className={'flex items-center gap-6'}>
                    <div
                      className={cn(
                        'flex h-24 w-24 items-center justify-center',
                        'rounded-full bg-primary text-primary-foreground',
                      )}
                    >
                      <span className={'text-2xl font-semibold'}>
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <CardTitle className={'mb-2 text-3xl'}>{user.username}</CardTitle>
                      {user.username && (
                        <p className={'mb-2 text-sm text-muted-foreground'}>@{user.username}</p>
                      )}
                      <p className={'text-muted-foreground'}>{user.email}</p>
                      {user.bio && <p className={'mt-2 text-sm'}>{user.bio}</p>}
                    </div>
                  </div>
                  {isOwner && (
                    <Button asChild size={'sm'} variant={'outline'}>
                      <Link href={$path({ route: '/settings/profile' })}>
                        <Settings className={'mr-2 h-4 w-4'} />
                        Edit Profile
                      </Link>
                    </Button>
                  )}
                </div>
              </CardHeader>
            </Card>

            {/* Profile Stats */}
            <div className={'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'}>
              <Card>
                <CardHeader>
                  <CardTitle>Member Since</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={'text-lg font-semibold'}>
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Profile Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={'text-lg font-semibold text-green-600'}>Active</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Role</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={'text-lg font-semibold capitalize'}>{user.role || 'user'}</p>
                </CardContent>
              </Card>
            </div>

            {/* Additional Content Placeholder */}
            <Card className={'mt-8'}>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                {user.bio ?
                  <p className={'text-muted-foreground'}>{user.bio}</p>
                : <p className={'text-muted-foreground italic'}>No bio available.</p>}
              </CardContent>
            </Card>
          </div>
        </ContentLayout>
      </div>
    </ViewTracker>
  );
}

export default withParamValidation(UserPage, Route);
