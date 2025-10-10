import { NextResponse } from 'next/server';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { z } from 'zod';

const execAsync = promisify(exec);

const searchSchema = z.object({
  q: z.string().min(1).max(100),
});

/**
 * GET /api/feature-planner/files/search
 * Search for files in the project using git ls-files
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

    // Use git ls-files to get tracked files
    const { stdout } = await execAsync('git ls-files', {
      cwd: process.cwd(),
      maxBuffer: 1024 * 1024 * 10, // 10MB buffer
    });

    // Filter files by query and limit results
    const files = stdout
      .split('\n')
      .filter((f) => f.trim().length > 0)
      .filter((f) => f.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 20); // Limit to 20 results for performance

    return NextResponse.json({ files }, { status: 200 });
  } catch (error) {
    console.error('File search error:', error);
    return NextResponse.json({ error: 'Failed to search files', files: [] }, { status: 500 });
  }
}
