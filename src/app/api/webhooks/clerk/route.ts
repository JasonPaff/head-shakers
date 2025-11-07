import type { WebhookEvent } from '@clerk/nextjs/server';

import { verifyWebhook } from '@clerk/backend/webhooks';
import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';

import { UserSyncService } from '@/lib/services/user-sync.service';

/**
 * Clerk webhook endpoint
 * handles user lifecycle events: created, updated, deleted
 *
 * @see https://clerk.com/docs/guides/development/webhooks/syncing
 */
export async function POST(request: Request) {
  try {
    // verify webhook signature from Clerk
    const evt: WebhookEvent = await verifyWebhook(request);

    // handle different event types
    switch (evt.type) {
      case 'user.created': {
        await UserSyncService.syncUserFromClerk(evt.data);

        Sentry.addBreadcrumb({
          category: 'webhook',
          data: {
            clerkId: evt.data.id,
            eventType: 'user.created',
          },
          level: 'info',
          message: 'User created via webhook',
        });

        return NextResponse.json({ message: 'User created successfully' }, { status: 200 });
      }

      case 'user.deleted': {
        if (!evt.data.id) {
          return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
        }

        await UserSyncService.deleteUserFromClerk(evt.data.id);

        Sentry.addBreadcrumb({
          category: 'webhook',
          data: {
            clerkId: evt.data.id,
            eventType: 'user.deleted',
          },
          level: 'info',
          message: 'User deleted via webhook',
        });

        return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
      }

      case 'user.updated': {
        const updatedUser = await UserSyncService.updateUserFromClerk(evt.data);

        if (!updatedUser) {
          // user doesn't exist in database, create it
          await UserSyncService.syncUserFromClerk(evt.data);

          Sentry.addBreadcrumb({
            category: 'webhook',
            data: {
              clerkId: evt.data.id,
              eventType: 'user.updated',
              reason: 'user_not_found_created',
            },
            level: 'warning',
            message: 'User not found on update, created instead',
          });
        }

        return NextResponse.json({ message: 'User updated successfully' }, { status: 200 });
      }

      default: {
        // unhandled event type
        Sentry.addBreadcrumb({
          category: 'webhook',
          data: {
            eventType: evt.type,
          },
          level: 'info',
          message: 'Unhandled webhook event type',
        });

        return NextResponse.json({ message: 'Event type not handled' }, { status: 200 });
      }
    }
  } catch (error) {
    // webhook verification failed or processing error
    const isVerificationError =
      error instanceof Error &&
      (error.message.includes('verification') || error.message.includes('signature'));

    Sentry.captureException(error, {
      tags: {
        component: 'ClerkWebhook',
        errorType: isVerificationError ? 'verification_failed' : 'processing_error',
      },
    });

    if (isVerificationError) {
      return NextResponse.json({ error: 'Webhook verification failed' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
