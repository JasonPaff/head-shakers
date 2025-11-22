/**
 * One-time setup script to create the dedicated E2E testing branch.
 *
 * Run this script once to create the branch, then add the branch ID
 * to your .env.e2e file.
 *
 * Usage:
 *   npx tsx tests/e2e/scripts/setup-e2e-branch.ts
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.e2e' });
dotenv.config({ path: '.env.local' });

async function main() {
  // Verify NEON_API_KEY is set
  if (!process.env.NEON_API_KEY) {
    console.error('Error: NEON_API_KEY is not set.');
    console.error('Please set it in .env.e2e or .env.local');
    process.exit(1);
  }

  console.log('Creating dedicated E2E testing branch...\n');

  // Dynamic import to ensure env vars are loaded first
  const { createDedicatedE2EBranch } = await import('../utils/neon-branch');

  try {
    const branchInfo = await createDedicatedE2EBranch('e2e-testing');

    console.log('\n========================================');
    console.log('E2E Branch Created Successfully!');
    console.log('========================================\n');
    console.log('Branch Details:');
    console.log(`  Name: ${branchInfo.branchName}`);
    console.log(`  ID: ${branchInfo.branchId}`);
    console.log(`  Endpoint: ${branchInfo.endpointId}`);
    console.log('\nNext Steps:');
    console.log('1. Add the following to your .env.e2e file:');
    console.log(`   NEON_E2E_BRANCH_ID=${branchInfo.branchId}`);
    console.log('\n2. Seed test users in the branch (see tests/e2e/scripts/seed-test-users.ts)');
    console.log('\n3. Run E2E tests with: npm run test:e2e');
  } catch (error) {
    console.error('Failed to create E2E branch:', error);
    process.exit(1);
  }
}

main();
