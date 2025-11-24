import { sql } from 'drizzle-orm';

import { db } from '@/lib/db';

export async function checkContentReportStats() {
  // Get count of all records
  const countResult = await db.execute(sql`
    SELECT COUNT(*) as count FROM content_reports
  `);
  const recordCount = (countResult[0] as any).count;

  // Get count by status
  const statusCounts = await db.execute(sql`
    SELECT status, COUNT(*) as count
    FROM content_reports
    GROUP BY status
    ORDER BY count DESC
  `);

  // Get sample records
  const samples = await db.execute(sql`
    SELECT
      cr.id,
      cr.created_at,
      cr.status,
      cr.reason,
      cr.target_type,
      cr.target_id,
      cr.description,
      u_reporter.display_name as reporter_name,
      u_reporter.email as reporter_email,
      u_moderator.display_name as moderator_name,
      cr.resolved_at,
      cr.moderator_notes
    FROM content_reports cr
    LEFT JOIN users u_reporter ON cr.reporter_id = u_reporter.id
    LEFT JOIN users u_moderator ON cr.moderator_id = u_moderator.id
    ORDER BY cr.created_at DESC
    LIMIT 5
  `);

  return {
    sampleRecords: samples,
    statusBreakdown: statusCounts,
    totalCount: recordCount,
  };
}
