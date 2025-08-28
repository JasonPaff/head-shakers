# Testing Guide

## Database Testing Setup

### Environment Configuration

1. **Copy test environment template:**
   ```bash
   cp tests/test.env.example .env.test
   ```

2. **Set DATABASE_URL_TEST** (choose one option):

   **Option A: Local Docker (Recommended)**
   ```bash
   # Start test database
   npm run test:db:docker
   
   # Set in .env.test
   DATABASE_URL_TEST=postgresql://test_user:test_password@localhost:5433/headshakers_test
   ```

   **Option B: Neon Test Branch**
   ```bash
   # Create separate Neon branch for testing
   DATABASE_URL_TEST=postgresql://user:pass@host/db_test
   ```

   **Option C: Testcontainers (Automatic)**
   ```typescript
   // Will automatically manage container lifecycle
   import { startTestDatabase } from './helpers/test-container';
   const url = await startTestDatabase();
   ```

### Test Isolation Patterns

**Use `withTestIsolation` for database tests:**
```typescript
import { withTestIsolation } from '../helpers/database';

it('should create data', async () => {
  await withTestIsolation(async (db) => {
    // All database changes are automatically rolled back
    const user = await createUser(db);
    const collection = await createCollection(user.id, db);
    
    expect(collection.userId).toBe(user.id);
    // No cleanup needed - transaction auto-rolls back
  });
});
```

**Benefits:**
- ✅ Complete isolation between tests
- ✅ No manual cleanup required
- ✅ Fast execution (no table truncation)
- ✅ Parallel test execution safe

### Available Scripts

```bash
# Run all tests
npm run test

# Database-specific tests
npm run test:db

# Test categories
npm run test:unit
npm run test:integration  
npm run test:e2e
npm run test:security
npm run test:performance

# Coverage reports
npm run test:coverage
npm run test:coverage:open

# Database management
npm run test:db:docker      # Start test database
npm run test:db:docker:down # Stop test database
npm run test:db:setup       # Run migrations
npm run test:db:reset       # Reset and migrate
```

### Test Organization

```
tests/
├── setup.ts              # Global test setup
├── docker-compose.test.yml # Test database container
├── test.env.example      # Environment template
├── helpers/              # Test utilities
│   ├── database.ts       # Database isolation helpers
│   ├── factories.ts      # Test data factories  
│   ├── test-db.ts        # Test database connection
│   └── test-container.ts # Container management
├── unit/                 # Unit tests
├── integration/          # Integration tests  
├── e2e/                  # End-to-end tests
├── database/            # Database-specific tests
├── security/            # Security tests
└── performance/         # Performance tests
```

### Writing Database Tests

1. **Use test isolation:**
   ```typescript
   import { withTestIsolation } from '../helpers/database';
   ```

2. **Use data factories:**
   ```typescript
   import { TestDataFactory } from '../helpers/factories';
   
   const { user, collection } = await TestDataFactory.createCollection();
   ```

3. **Follow test patterns:**
   ```typescript
   describe('ServiceName.method', () => {
     it.skipIf(!process.env.DATABASE_URL_TEST)('should do something', async () => {
       await withTestIsolation(async (db) => {
         // Test logic here
       });
     });
   });
   ```

### Troubleshooting

**Database connection issues:**
- Ensure `DATABASE_URL_TEST` is set in `.env.test`
- Check test database is running: `npm run test:db:docker`
- Verify migrations are applied: `npm run test:db:setup`

**MSW warnings:**
- Add request handlers for external API calls
- Or mock the external services in your tests

**Transaction errors:**
- Use `withTestIsolation` instead of direct database calls
- Ensure test database supports transactions