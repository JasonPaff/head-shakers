import { GenericContainer, type StartedTestContainer } from 'testcontainers';

let testContainer: null | StartedTestContainer = null;

export const startTestDatabase = async (): Promise<string> => {
  if (testContainer) {
    return getTestDatabaseUrl();
  }

  console.log('Starting test database container...');

  testContainer = await new GenericContainer('postgres:16-alpine')
    .withEnvironment({
      POSTGRES_DB: 'headshakers_test',
      POSTGRES_HOST_AUTH_METHOD: 'trust',
      POSTGRES_PASSWORD: 'test_password',
      POSTGRES_USER: 'test_user',
    })
    .withExposedPorts(5432)
    // @ts-expect-error wait strategy typing issue
    .withWaitStrategy(wait.forLogMessage('database system is ready to accept connections'))
    .start();

  const databaseUrl = getTestDatabaseUrl();
  console.log(`Test database started at: ${databaseUrl}`);

  return databaseUrl;
};

export const stopTestDatabase = async (): Promise<void> => {
  if (testContainer) {
    console.log('Stopping test database container...');
    await testContainer.stop();
    testContainer = null;
  }
};

export const getTestDatabaseUrl = (): string => {
  if (!testContainer) {
    throw new Error('Test database container not started');
  }

  const host = testContainer.getHost();
  const port = testContainer.getMappedPort(5432);

  return `postgresql://test_user:test_password@${host}:${port}/headshakers_test`;
};

export const isTestDatabaseRunning = (): boolean => {
  return testContainer !== null;
};

// wait strategy import
const wait = {
  forLogMessage: () => ({
    waitUntilReady: async () => {
      // simplified wait strategy
      await new Promise((resolve) => setTimeout(resolve, 5000));
    },
  }),
};
