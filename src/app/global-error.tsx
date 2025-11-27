'use client';

import * as Sentry from '@sentry/nextjs';
import NextError from 'next/error';
import { useEffect } from 'react';

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error, {
      contexts: {
        error_details: {
          digest: error.digest,
          route: 'global',
        },
      },
      level: 'fatal',
      tags: {
        error_boundary: 'global',
        has_digest: String(!!error.digest),
      },
    });
  }, [error]);

  return (
    <html lang={'en'}>
      <body>
        {/* `NextError` is the default Next.js error page component. Its type
        definition requires a `statusCode` prop. However, since the App Router
        does not expose status codes for errors, we simply pass 0 to render a
        generic error message. */}
        <NextError statusCode={0} />
      </body>
    </html>
  );
}
