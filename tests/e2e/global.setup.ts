import { clerkSetup } from '@clerk/testing/playwright';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

import { cleanupOldE2EBranches, getE2EBranch, NEON_CONFIG } from './utils/neon-branch';

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

  // Verify Upstash credentials for caching
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.warn('WARNING: Upstash Redis credentials not set. Caching may fail.');
    console.warn('Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in .env.e2e');
  }

  // Step 1: Get or create E2E database branch
  console.log('Setting up E2E database branch...');
  try {
    // Check if using dedicated branch or dynamic branches
    const isDedicatedBranch = !!NEON_CONFIG.e2eBranchId;

    if (isDedicatedBranch) {
      console.log('Using dedicated E2E branch (no reset - preserving test data)');
      // For dedicated branch, we don't reset by default to preserve seeded test data
      // Set E2E_RESET_BRANCH=true to force reset if needed
      const shouldReset = process.env.E2E_RESET_BRANCH === 'true';
      const branchInfo = await getE2EBranch({ reset: shouldReset });

      // Ensure playwright directory exists
      const branchInfoDir = path.dirname(branchInfoFile);
      if (!fs.existsSync(branchInfoDir)) {
        fs.mkdirSync(branchInfoDir, { recursive: true });
      }

      // Save branch info for web server
      fs.writeFileSync(branchInfoFile, JSON.stringify(branchInfo, null, 2));

      console.log('E2E Database Setup Complete (dedicated branch)');
      console.log(`Branch: ${branchInfo.branchName}`);
      console.log(`Branch ID: ${branchInfo.branchId}`);
    } else {
      // Legacy: Dynamic branch creation
      console.log('No dedicated E2E branch configured, using dynamic branches...');

      // Clean up any old branches first (older than 24 hours)
      await cleanupOldE2EBranches();

      // Create a new E2E branch
      const branchInfo = await getE2EBranch();

      // Ensure playwright directory exists
      const branchInfoDir = path.dirname(branchInfoFile);
      if (!fs.existsSync(branchInfoDir)) {
        fs.mkdirSync(branchInfoDir, { recursive: true });
      }

      // Save branch info for teardown and web server
      fs.writeFileSync(branchInfoFile, JSON.stringify(branchInfo, null, 2));

      console.log('E2E Database Setup Complete (dynamic branch)');
      console.log(`Branch: ${branchInfo.branchName}`);
      console.log(`Branch ID: ${branchInfo.branchId}`);
    }
  } catch (error) {
    console.error('Failed to setup E2E database branch:', error);
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
