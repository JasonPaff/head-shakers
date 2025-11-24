import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

import * as schema from '@/lib/db/schema';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function checkContentReports() {
  console.log('Checking content_reports table...\n');

  // Get count of records
  const countResult = await db.execute('SELECT COUNT(*) as count FROM content_reports');
  const recordCount = (countResult[0] as any).count;
  console.log(`Total records in content_reports: ${recordCount}\n`);

  if (recordCount > 0) {
    // Get a few sample records with related user info
    const samples = await db.execute(`
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

    console.log('Sample records:\n');
    samples.forEach((record: any, index: number) => {
      console.log(`Record ${index + 1}:`);
      console.log(`  ID: ${record.id}`);
      console.log(`  Created: ${record.created_at}`);
      console.log(`  Status: ${record.status}`);
      console.log(`  Reason: ${record.reason}`);
      console.log(`  Target: ${record.target_type} (ID: ${record.target_id})`);
      console.log(`  Reporter: ${record.reporter_name} (${record.reporter_email})`);
      console.log(`  Description: ${record.description}`);
      console.log(`  Moderator: ${record.moderator_name || 'Unassigned'}`);
      console.log(`  Resolved: ${record.resolved_at || 'Pending'}`);
      console.log(`  Notes: ${record.moderator_notes || 'None'}\n`);
    });
  } else {
    console.log('No records found in content_reports table.');
  }
}

checkContentReports().catch(console.error);
