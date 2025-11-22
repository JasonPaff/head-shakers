import fs from 'fs';
import path from 'path';

import { deleteE2EBranch, type E2EBranchInfo } from './utils/neon-branch';

const branchInfoFile = path.resolve(process.cwd(), 'playwright/.e2e-branch.json');
const authDir = path.resolve(process.cwd(), 'playwright/.auth');

export default async function globalTeardown() {
  console.log('Running E2E global teardown...');

  // Clean up database branch
  if (fs.existsSync(branchInfoFile)) {
    try {
      const branchInfo: E2EBranchInfo = JSON.parse(fs.readFileSync(branchInfoFile, 'utf-8'));

      console.log(`Cleaning up E2E branch: ${branchInfo.branchName}`);

      // Delete the branch
      await deleteE2EBranch(branchInfo.branchId);

      // Remove the branch info file
      fs.unlinkSync(branchInfoFile);

      console.log('E2E Database Teardown Complete');
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
