import { glob } from 'glob';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const searchSchema = z.object({
  q: z.string().min(1).max(100),
});

/**
 * GET /api/feature-planner/files/search
 * Search for files in the project using glob
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    // Validate query
    const validation = searchSchema.safeParse({ q: query });
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid search query', message: validation.error.message },
        { status: 400 },
      );
    }

    // Use glob to search for files, excluding common directories
    const allFiles = await glob('**/*', {
      cwd: process.cwd(),
      ignore: ['node_modules/**', '.next/**', '.git/**', 'dist/**', 'build/**', '.playwright-mcp/**'],
      nodir: true,
    });

    // Filter files by query (case-insensitive) and limit results
    const files = allFiles.filter((f) => f.toLowerCase().includes(query.toLowerCase())).slice(0, 20); // Limit to 20 results for performance

    return NextResponse.json({ files }, { status: 200 });
  } catch (error) {
    console.error('File search error:', error);
    return NextResponse.json({ error: 'Failed to search files', files: [] }, { status: 500 });
  }
}
