import { clerkSetup } from '@clerk/testing/playwright';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

import { cleanupOldE2EBranches, createE2EBranch } from './utils/neon-branch';

// Ensure environment variables are loaded
dotenv.config({ path: '.env.e2e' });
dotenv.config({ path: '.env.local' });

// File to store branch info between setup and teardown
const branchInfoFile = path.resolve(process.cwd(), 'playwright/.e2e-branch.json');

export default async function globalSetup() {
  // Verify required env vars are present
  if (!process.env.CLERK_SECRET_KEY) {
    console.error('CLERK_SECRET_KEY is not set. Make sure .env.e2e has the correct Clerk keys.');
    throw new Error('CLERK_SECRET_KEY is required for E2E testing');
  }

  if (!process.env.NEON_API_KEY) {
    console.error('NEON_API_KEY is not set. Make sure .env.e2e has the Neon API key.');
    throw new Error('NEON_API_KEY is required for E2E database branching');
  }

  // Step 1: Create E2E database branch (must happen before web server starts)
  console.log('Creating E2E database branch...');
  try {
    // Clean up any old branches first (older than 24 hours)
    await cleanupOldE2EBranches();

    // Create a new E2E branch
    const branchInfo = await createE2EBranch();

    // Ensure playwright directory exists
    const branchInfoDir = path.dirname(branchInfoFile);
    if (!fs.existsSync(branchInfoDir)) {
      fs.mkdirSync(branchInfoDir, { recursive: true });
    }

    // Save branch info for teardown and web server
    fs.writeFileSync(branchInfoFile, JSON.stringify(branchInfo, null, 2));

    console.log('E2E Database Setup Complete');
    console.log(`Branch: ${branchInfo.branchName}`);
    console.log(`Branch ID: ${branchInfo.branchId}`);
  } catch (error) {
    console.error('Failed to create E2E database branch:', error);
    throw error;
  }

  // Step 2: Setup Clerk testing token
  console.log('Setting up Clerk testing token...');
  try {
    await clerkSetup();
    console.log('Clerk testing token obtained successfully');
  } catch (error) {
    console.error('Failed to setup Clerk testing:', error);
    console.error('Make sure your Clerk instance has testing enabled and the API keys are correct.');
    throw error;
  }
}
