import { test as teardown } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { deleteE2EBranch, type E2EBranchInfo } from '../utils/neon-branch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const branchInfoFile = path.join(__dirname, '../../../playwright/.e2e-branch.json');

teardown('delete E2E database branch', async () => {
  // Read branch info from setup
  if (!fs.existsSync(branchInfoFile)) {
    console.log('No E2E branch info found, skipping teardown');
    return;
  }

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
});
