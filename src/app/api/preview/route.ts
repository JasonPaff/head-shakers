import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';

import { validatePreviewToken } from '@/lib/seo/preview.utils';

/**
 * Preview Mode API Endpoint
 *
 * Enables preview mode for content editors to verify metadata and content
 * before publishing. Uses Next.js 16 draftMode() API for session-based
 * preview state management.
 *
 * Security:
 * - Requires valid preview token (PREVIEW_SECRET)
 * - Tokens validated using timing-safe comparison
 * - Preview state stored in secure httpOnly cookies
 *
 * Workflow:
 * 1. Editor generates preview URL with token
 * 2. GET /api/preview?token=xxx&slug=/path enables preview mode
 * 3. Editor reviews content with accurate metadata
 * 4. DELETE /api/preview disables preview mode
 *
 * @see https://nextjs.org/docs/app/building-your-application/configuring/draft-mode
 */

/**
 * Disable preview mode
 *
 * DELETE /api/preview
 *
 * No authentication required for disabling preview mode since it only
 * affects the current user's session.
 *
 * @example
 * ```
 * // Disable preview mode
 * DELETE /api/preview
 * ```
 */
export async function DELETE() {
  try {
    // disable draft mode (clears preview cookie)
    const draft = await draftMode();
    draft.disable();

    return NextResponse.json(
      {
        message: 'Preview mode disabled',
        previewMode: false,
      },
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
        status: 200,
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to disable preview mode',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 },
    );
  }
}

/**
 * Enable preview mode
 *
 * GET /api/preview?token=SECRET&slug=/path/to/preview
 *
 * Query parameters:
 * - token (required): Preview secret token for authentication
 * - slug (optional): Path to redirect to after enabling preview mode
 *
 * @example
 * ```
 * // Enable preview and redirect to bobblehead page
 * GET /api/preview?token=secret123&slug=/bobbleheads/funko-pop-batman
 * ```
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const slug = searchParams.get('slug');

    // validate preview token
    if (!token || !validatePreviewToken(token)) {
      return NextResponse.json(
        {
          error: 'Invalid or missing preview token',
          message: 'Preview mode requires a valid authentication token',
        },
        { status: 401 },
      );
    }

    // enable draft mode (sets secure httpOnly cookie)
    const draft = await draftMode();
    draft.enable();

    // redirect to content being previewed if slug provided
    if (slug) {
      // ensure slug starts with /
      const redirectPath = slug.startsWith('/') ? slug : `/${slug}`;
      redirect(redirectPath);
    }

    // return success response if no redirect
    return NextResponse.json(
      {
        message: 'Preview mode enabled',
        previewMode: true,
      },
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
        status: 200,
      },
    );
  } catch (error) {
    // handle redirect errors (redirect() throws)
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      throw error;
    }

    return NextResponse.json(
      {
        error: 'Failed to enable preview mode',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 },
    );
  }
}
