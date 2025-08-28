import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';

let testContainer: null | StartedPostgreSqlContainer = null;

export const startTestDatabase = async (): Promise<string> => {
  if (testContainer) {
    return getTestDatabaseUrl();
  }

  console.log('Starting PostgreSQL test container...');

  try {
    testContainer = await new PostgreSqlContainer('postgres:16-alpine')
      .withDatabase('headshakers_test')
      .withUsername('test_user')
      .withPassword('test_password')
      .withStartupTimeout(120000)
      .withReuse() // reuse container if available
      .start();

    const databaseUrl = getTestDatabaseUrl();
    console.log(`Test database started at: ${databaseUrl}`);

    return databaseUrl;
  } catch (error) {
    console.error('Failed to start test container:', error);
    throw new Error(
      'Could not start test database container. ' +
        'Ensure Docker Desktop is running and you have permission to create containers. ' +
        'Alternative: set DATABASE_URL_TEST in .env for manual database connection.',
    );
  }
};

export const stopTestDatabase = async (): Promise<void> => {
  if (testContainer) {
    console.log('Stopping PostgreSQL test container...');
    await testContainer.stop();
    testContainer = null;
    console.log('Test container stopped');
  }
};

export const getTestDatabaseUrl = (): string => {
  if (!testContainer) {
    throw new Error('Test database container not started');
  }

  return testContainer.getConnectionUri();
};
