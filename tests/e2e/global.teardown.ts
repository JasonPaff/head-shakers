import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

import { deleteE2EBranch, type E2EBranchInfo, NEON_CONFIG } from './utils/neon-branch';

// Load env vars to check for dedicated branch config
dotenv.config({ path: '.env.e2e' });
dotenv.config({ path: '.env.local' });

const branchInfoFile = path.resolve(process.cwd(), 'playwright/.e2e-branch.json');
const authDir = path.resolve(process.cwd(), 'playwright/.auth');

export default async function globalTeardown() {
  console.log('Running E2E global teardown...');

  // Check if using dedicated branch
  const isDedicatedBranch = !!NEON_CONFIG.e2eBranchId;

  // Clean up database branch (only for dynamic branches)
  if (fs.existsSync(branchInfoFile)) {
    try {
      const branchInfo: E2EBranchInfo = JSON.parse(fs.readFileSync(branchInfoFile, 'utf-8'));

      if (isDedicatedBranch) {
        console.log(`Dedicated E2E branch preserved: ${branchInfo.branchName}`);
        console.log('(Branch will be reused in next test run)');
      } else {
        // Only delete dynamic branches
        console.log(`Cleaning up dynamic E2E branch: ${branchInfo.branchName}`);
        await deleteE2EBranch(branchInfo.branchId);
        console.log('E2E Database Teardown Complete');
      }

      // Remove the branch info file (always, to ensure fresh connection on next run)
      fs.unlinkSync(branchInfoFile);
    } catch (error) {
      console.error('Failed to read branch info or cleanup:', error);
      // Don't throw - teardown should not fail the test suite
    }
  } else {
    console.log('No E2E branch info found, skipping database teardown');
  }

  // Clean up auth state files (optional but helps prevent stale sessions)
  if (fs.existsSync(authDir)) {
    try {
      const authFiles = fs.readdirSync(authDir);
      for (const file of authFiles) {
        if (file.endsWith('.json')) {
          fs.unlinkSync(path.join(authDir, file));
          console.log(`Cleaned up auth file: ${file}`);
        }
      }
    } catch (error) {
      console.error('Failed to cleanup auth files:', error);
      // Don't throw - cleanup failures shouldn't fail the suite
    }
  }

  console.log('E2E Global Teardown Complete');
}
