import { test as setup } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { cleanupOldE2EBranches, createE2EBranch } from '../utils/neon-branch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// File to store branch info between setup and teardown
const branchInfoFile = path.join(__dirname, '../../../playwright/.e2e-branch.json');

setup('create E2E database branch', async () => {
  // Clean up any old branches first (older than 24 hours)
  await cleanupOldE2EBranches();

  // Create a new E2E branch
  const branchInfo = await createE2EBranch();

  // Save branch info for teardown and other tests
  const branchInfoDir = path.dirname(branchInfoFile);
  if (!fs.existsSync(branchInfoDir)) {
    fs.mkdirSync(branchInfoDir, { recursive: true });
  }
  fs.writeFileSync(branchInfoFile, JSON.stringify(branchInfo, null, 2));

  // Set the DATABASE_URL environment variable for the web server
  // This will be picked up by the Next.js app
  process.env.E2E_DATABASE_URL = branchInfo.connectionString;
  process.env.DATABASE_URL = branchInfo.connectionString;

  console.log('E2E Database Setup Complete');
  console.log(`Branch: ${branchInfo.branchName}`);
  console.log(`Branch ID: ${branchInfo.branchId}`);
});
