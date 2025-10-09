import { eq } from 'drizzle-orm';
import 'dotenv/config';

import { db } from '@/lib/db';
import { planStepTemplates, users } from '@/lib/db/schema';

const SYSTEM_ADMIN_CLERK_ID = 'user_seed_admin';

const defaultStepTemplates = [
  {
    category: 'Quality Assurance',
    commands: ['npm run lint:fix', 'npm run typecheck'],
    confidenceLevel: 'high',
    content:
      'Run linting with auto-fix enabled and perform type checking to ensure code quality and type safety.',
    description: 'Runs ESLint with auto-fix and TypeScript type checking',
    estimatedDuration: '2-3 minutes',
    isPublic: true,
    name: 'Lint & Type Check',
    title: 'Run Linting and Type Checking',
    usageCount: 0,
    validationCommands: ['echo "Linting and type checking completed successfully"'],
  },
  {
    category: 'Testing',
    commands: ['npm run test'],
    confidenceLevel: 'high',
    content:
      'Execute the full test suite including unit, integration, and E2E tests to verify functionality.',
    description: 'Runs the complete test suite',
    estimatedDuration: '5-10 minutes',
    isPublic: true,
    name: 'Run Tests',
    title: 'Execute Test Suite',
    usageCount: 0,
    validationCommands: ['echo "All tests passed successfully"'],
  },
  {
    category: 'Database',
    commands: ['npm run db:generate', 'npm run db:migrate'],
    confidenceLevel: 'medium',
    content:
      'Generate database migration files from schema changes and apply them to the database. Review migration files before applying.',
    description: 'Generates and applies database migrations',
    estimatedDuration: '3-5 minutes',
    isPublic: true,
    name: 'Database Migration',
    title: 'Generate and Apply Database Migrations',
    usageCount: 0,
    validationCommands: ['echo "Database migration completed successfully"'],
  },
  {
    category: 'Build & Deploy',
    commands: ['npm run build'],
    confidenceLevel: 'high',
    content:
      'Build the Next.js application for production to verify there are no build errors and all optimizations are applied.',
    description: 'Builds the application for production',
    estimatedDuration: '3-5 minutes',
    isPublic: true,
    name: 'Build Check',
    title: 'Production Build Verification',
    usageCount: 0,
    validationCommands: ['echo "Build completed successfully"'],
  },
];

async function main() {
  console.log('🌱 Starting step templates seeding...\n');

  try {
    // find or create a system admin user
    const systemAdmin = await findOrCreateSystemAdmin();

    // create default step templates
    await seedDefaultStepTemplates(systemAdmin.id);

    console.log('\n🎉 Step templates seeding completed successfully!');
    console.log(`
📊 Seeding Summary:
   📋 Default Step Templates: ${defaultStepTemplates.length}
    `);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

async function findOrCreateSystemAdmin() {
  console.log('👤 Finding or creating system admin user...');

  // try to find existing system admin
  const existingAdmin = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, SYSTEM_ADMIN_CLERK_ID))
    .limit(1);

  if (existingAdmin.length > 0) {
    console.log('✅ System admin user found');
    return existingAdmin[0]!;
  }

  // create system admin if not exists
  const newAdmin = await db
    .insert(users)
    .values({
      bio: 'System administrator account for default templates and system operations',
      clerkId: SYSTEM_ADMIN_CLERK_ID,
      displayName: 'System Admin',
      email: 'admin@headshakers.com',
      isVerified: true,
      username: 'system_admin',
    })
    .returning();

  console.log('✅ System admin user created');
  return newAdmin[0]!;
}

async function seedDefaultStepTemplates(adminUserId: string) {
  console.log('📋 Seeding default step templates...');

  // check for existing templates to avoid duplicates
  const existingTemplates = await db
    .select()
    .from(planStepTemplates)
    .where(eq(planStepTemplates.isPublic, true));

  const existingTemplateNames = new Set(existingTemplates.map((t) => t.name));

  // filter out templates that already exist
  const newTemplates = defaultStepTemplates
    .filter((template) => !existingTemplateNames.has(template.name))
    .map((template) => ({
      ...template,
      userId: adminUserId,
    }));

  if (newTemplates.length > 0) {
    const insertedTemplates = await db.insert(planStepTemplates).values(newTemplates).returning();
    console.log(`✅ Created ${insertedTemplates.length} new step templates`);
  } else {
    console.log('✅ All default templates already exist, skipping insertion');
  }

  // return count of all templates
  const allTemplates = await db.select().from(planStepTemplates).where(eq(planStepTemplates.isPublic, true));
  console.log(`✅ Total public templates in database: ${allTemplates.length}`);
}

void main();
