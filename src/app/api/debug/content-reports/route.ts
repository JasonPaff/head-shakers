import { checkContentReportStats } from '@/lib/queries/content-reports.query';

export async function GET() {
  try {
    const stats = await checkContentReportStats();
    return Response.json(stats);
  } catch (error) {
    console.error('Error checking content reports:', error);
    return Response.json(
      { details: String(error), error: 'Failed to check content reports' },
      { status: 500 },
    );
  }
}
