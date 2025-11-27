import type { Metadata } from 'next';

import { notFound } from 'next/navigation';

import { UsernameEditForm } from '@/components/feature/users/username-edit-form';
import { ContentLayout } from '@/components/layout/content-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UsersFacade } from '@/lib/facades/users/users.facade';
import { getRequiredUserIdAsync } from '@/utils/auth-utils';

export function generateMetadata(): Metadata {
  return {
    description: 'Manage your profile settings and username',
    title: 'Profile Settings',
  };
}

export const dynamic = 'force-dynamic';

export default async function ProfileSettingsPage() {
  // Get current user ID
  const userId = await getRequiredUserIdAsync();

  // Fetch current user data
  const user = await UsersFacade.getUserByIdAsync(userId);

  if (!user) {
    notFound();
  }

  // Check if user can change username
  const canChange = await UsersFacade.canChangeUsername(userId);

  // Calculate days until username can be changed
  const daysUntilChange = canChange ? 0 : UsersFacade.getDaysUntilUsernameChangeAllowed(user);

  return (
    <ContentLayout>
      <div className={'mx-auto max-w-4xl py-8'}>
        <div className={'mb-6'}>
          <h1 className={'text-3xl font-bold'}>Profile Settings</h1>
          <p className={'mt-2 text-muted-foreground'}>Manage your profile information and preferences</p>
        </div>

        {/* Username Settings Card */}
        <Card className={'mb-6'}>
          <CardHeader>
            <CardTitle>Username</CardTitle>
            <CardDescription>
              Your unique username identifies you on the platform. You can change it once every 90 days.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className={'space-y-4'}>
              {/* Current username display */}
              <div className={'rounded-lg bg-muted p-4'}>
                <p className={'text-sm text-muted-foreground'}>Current Username</p>
                <p className={'text-lg font-semibold'}>@{user.username}</p>
                {user.usernameChangedAt && (
                  <p className={'mt-2 text-xs text-muted-foreground'}>
                    Last changed on{' '}
                    {new Date(user.usernameChangedAt).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                )}
              </div>

              {/* Username edit form */}
              <UsernameEditForm
                canChange={canChange}
                currentUsername={user.username}
                daysUntilChange={daysUntilChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* Profile Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>View your profile details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={'space-y-4'}>
              {/* Username */}
              <div>
                <p className={'text-sm font-medium text-muted-foreground'}>Username</p>
                <p className={'mt-1 text-base'}>{user.username}</p>
              </div>

              {/* Email */}
              <div>
                <p className={'text-sm font-medium text-muted-foreground'}>Email</p>
                <p className={'mt-1 text-base'}>{user.email}</p>
              </div>

              {/* Bio */}
              {user.bio && (
                <div>
                  <p className={'text-sm font-medium text-muted-foreground'}>Bio</p>
                  <p className={'mt-1 text-base'}>{user.bio}</p>
                </div>
              )}

              {/* Location */}
              {user.location && (
                <div>
                  <p className={'text-sm font-medium text-muted-foreground'}>Location</p>
                  <p className={'mt-1 text-base'}>{user.location}</p>
                </div>
              )}

              {/* Member Since */}
              <div>
                <p className={'text-sm font-medium text-muted-foreground'}>Member Since</p>
                <p className={'mt-1 text-base'}>
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ContentLayout>
  );
}
