/**
 * Seed test users in the E2E database branch.
 *
 * This script creates database records for test users that exist in Clerk.
 * It fetches user details from Clerk API and creates corresponding records in the database.
 *
 * Prerequisites:
 * 1. Test users must exist in Clerk (create them in Clerk Dashboard first)
 * 2. CLERK_SECRET_KEY must be set in .env.e2e
 * 3. E2E database branch must exist (run setup-e2e-branch.ts first)
 *
 * Usage:
 *   npx tsx tests/e2e/scripts/seed-test-users.ts
 */

import { createClerkClient } from '@clerk/backend';
import { Pool } from '@neondatabase/serverless';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.e2e' });
dotenv.config({ path: '.env.local' });

// Test user configuration - matches .env.e2e.example
const TEST_USERS = [
  {
    displayName: 'Test Admin',
    email: process.env.E2E_CLERK_ADMIN_USERNAME || 'admin@test.headshakers.com',
    role: 'admin' as const,
    username: 'testadmin',
  },
  {
    displayName: 'Test User',
    email: process.env.E2E_CLERK_USER_USERNAME || 'user@test.headshakers.com',
    role: 'user' as const,
    username: 'testuser',
  },
  {
    displayName: 'New Test User',
    email: process.env.E2E_CLERK_NEW_USER_USERNAME || 'newuser@test.headshakers.com',
    role: 'user' as const,
    username: 'testnewuser',
  },
];

interface BranchInfo {
  branchId: string;
  branchName: string;
  connectionString: string;
  endpointId: string;
}

interface ClerkUser {
  emailAddresses: Array<{ emailAddress: string }>;
  firstName: null | string;
  id: string;
  imageUrl: string;
  lastName: null | string;
  username: null | string;
}

interface UserRow {
  clerk_id: string;
  email: string;
  id: string;
  role: string;
  username: string;
}

async function getClerkUserByEmail(
  clerk: ReturnType<typeof createClerkClient>,
  email: string,
): Promise<ClerkUser | null> {
  try {
    const users = await clerk.users.getUserList({
      emailAddress: [email],
      limit: 1,
    });

    if (users.data.length === 0) {
      return null;
    }

    const user = users.data[0];
    if (!user) {
      return null;
    }

    return {
      emailAddresses: user.emailAddresses.map((e) => ({ emailAddress: e.emailAddress })),
      firstName: user.firstName,
      id: user.id,
      imageUrl: user.imageUrl,
      lastName: user.lastName,
      username: user.username,
    };
  } catch (error) {
    console.error(`Failed to fetch Clerk user for email ${email}:`, error);
    return null;
  }
}

async function main() {
  // Validate environment
  if (!process.env.CLERK_SECRET_KEY) {
    console.error('Error: CLERK_SECRET_KEY is not set.');
    console.error('Please set it in .env.e2e or .env.local');
    process.exit(1);
  }

  // Get database connection string
  // First try to read from branch info file (if setup was run)
  let connectionString: string | undefined;

  const fs = await import('fs');
  const path = await import('path');
  const branchInfoFile = path.resolve(process.cwd(), 'playwright/.e2e-branch.json');

  if (fs.existsSync(branchInfoFile)) {
    try {
      const branchInfo = JSON.parse(fs.readFileSync(branchInfoFile, 'utf-8')) as BranchInfo;
      connectionString = branchInfo.connectionString;
      console.log(`Using E2E branch: ${branchInfo.branchName}`);
    } catch {
      // Fall through to use env var
    }
  }

  // Fall back to getting connection string from dedicated branch
  if (!connectionString && process.env.NEON_E2E_BRANCH_ID) {
    console.log('Getting connection string for dedicated E2E branch...');
    const { getE2EBranch } = await import('../utils/neon-branch');
    const branchInfo = await getE2EBranch();
    connectionString = branchInfo.connectionString;
    console.log(`Using E2E branch: ${branchInfo.branchName}`);
  }

  if (!connectionString) {
    console.error('Error: No E2E database connection available.');
    console.error('Either run setup-e2e-branch.ts first, or set NEON_E2E_BRANCH_ID in .env.e2e');
    process.exit(1);
  }

  // Initialize Clerk client
  const clerk = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
  });

  // Initialize database connection
  const pool = new Pool({ connectionString });

  console.log('\nSeeding test users in E2E database...\n');

  let successCount = 0;
  let failCount = 0;

  for (const testUser of TEST_USERS) {
    console.log(`\nProcessing: ${testUser.email}`);

    // Fetch user from Clerk
    const clerkUser = await getClerkUserByEmail(clerk, testUser.email);

    if (!clerkUser) {
      console.log(`  ⚠ User not found in Clerk: ${testUser.email}`);
      console.log('    Please create this user in the Clerk Dashboard first.');
      failCount++;
      continue;
    }

    console.log(`  Found Clerk user: ${clerkUser.id}`);

    // Seed user in database
    const success = await seedUser(
      pool,
      clerkUser.id,
      testUser.email,
      testUser.username,
      testUser.displayName,
      testUser.role,
      clerkUser.imageUrl,
    );

    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }

  await pool.end();

  console.log('\n========================================');
  console.log('Seeding Complete!');
  console.log('========================================');
  console.log(`✓ Succeeded: ${successCount}`);
  console.log(`✗ Failed: ${failCount}`);

  if (failCount > 0) {
    console.log('\nNote: Some users could not be seeded.');
    console.log('Make sure all test users exist in Clerk Dashboard with matching emails.');
    process.exit(1);
  }

  console.log('\nTest users are ready for E2E testing!');
}

async function seedUser(
  pool: Pool,
  clerkId: string,
  email: string,
  username: string,
  displayName: string,
  role: 'admin' | 'user',
  avatarUrl?: string,
): Promise<boolean> {
  const query = `
    INSERT INTO users (clerk_id, email, username, display_name, role, avatar_url, is_verified)
    VALUES ($1, $2, $3, $4, $5::user_role, $6, true)
    ON CONFLICT (clerk_id) DO UPDATE SET
      email = EXCLUDED.email,
      username = EXCLUDED.username,
      display_name = EXCLUDED.display_name,
      role = EXCLUDED.role,
      avatar_url = EXCLUDED.avatar_url,
      updated_at = now()
    RETURNING id, clerk_id, email, username, role;
  `;

  try {
    const result = await pool.query<UserRow>(query, [
      clerkId,
      email,
      username,
      displayName,
      role,
      avatarUrl || null,
    ]);
    const row = result.rows[0];
    if (row) {
      console.log(`  ✓ Seeded user: ${row.email} (${row.role})`);
      console.log(`    ID: ${row.id}`);
      console.log(`    Clerk ID: ${row.clerk_id}`);
    }
    return true;
  } catch (error) {
    console.error(`  ✗ Failed to seed user ${email}:`, error);
    return false;
  }
}

main().catch((error) => {
  console.error('Seed script failed:', error);
  process.exit(1);
});
