import type { NextRequest } from 'next/server';

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { generateSignedUploadUrl } from '@/lib/services/cloudinary';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { folder, publicId } = body;

    // Generate the folder path for the user's temp uploads
    const userFolder = folder || `users/${userId}/temp`;

    const signedParams = generateSignedUploadUrl({
      folder: userFolder,
      publicId,
    });

    return NextResponse.json({
      ...signedParams,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    });
  } catch (error) {
    console.error('Error generating signed upload URL:', error);
    return NextResponse.json({ error: 'Failed to generate signed upload URL' }, { status: 500 });
  }
}
