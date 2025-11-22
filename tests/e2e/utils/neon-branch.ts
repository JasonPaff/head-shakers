import { type Api, createApiClient, EndpointType } from '@neondatabase/api-client';

// Configuration constants from the infrastructure plan
const NEON_CONFIG = {
  compute: {
    maxCu: 0.25,
    minCu: 0.25,
  },
  databaseName: 'head-shakers',
  developBranchId: process.env.NEON_DEVELOP_BRANCH_ID || 'br-dark-forest-adf48tll',
  // Dedicated E2E branch - set via environment variable
  e2eBranchId: process.env.NEON_E2E_BRANCH_ID || '',
  projectId: process.env.NEON_PROJECT_ID || 'misty-boat-49919732',
  roleName: 'neondb_owner',
} as const;

export interface E2EBranchInfo {
  branchId: string;
  branchName: string;
  connectionString: string;
  endpointId: string;
}

let neonClient: Api<unknown> | null = null;

export async function cleanupOldE2EBranches(maxAgeMs = 24 * 60 * 60 * 1000): Promise<void> {
  const client = getClient();

  console.log('Cleaning up old E2E branches...');

  try {
    const response = await client.listProjectBranches({ projectId: NEON_CONFIG.projectId });
    const branches = response.data?.branches || [];

    const e2eBranches = branches.filter(
      (branch) => branch.name.startsWith('e2e-local-') || branch.name.startsWith('e2e-ci-'),
    );

    const now = Date.now();
    let deletedCount = 0;

    for (const branch of e2eBranches) {
      const createdAt = new Date(branch.created_at).getTime();
      const age = now - createdAt;

      if (age > maxAgeMs) {
        console.log(`Deleting old E2E branch: ${branch.name} (age: ${Math.round(age / 1000 / 60)} minutes)`);
        await deleteE2EBranch(branch.id);
        deletedCount++;
      }
    }

    console.log(`Cleaned up ${deletedCount} old E2E branches`);
  } catch (error) {
    console.error('Failed to cleanup old E2E branches:', error);
  }
}

/**
 * Create a dedicated E2E branch if it doesn't exist.
 * This should be run once during initial setup.
 */
export async function createDedicatedE2EBranch(branchName = 'e2e-testing'): Promise<E2EBranchInfo> {
  const client = getClient();

  console.log(`Creating dedicated E2E branch: ${branchName}`);
  console.log(`Parent branch: ${NEON_CONFIG.developBranchId}`);

  try {
    // Create branch with endpoint
    const response = await client.createProjectBranch(NEON_CONFIG.projectId, {
      branch: {
        name: branchName,
        parent_id: NEON_CONFIG.developBranchId,
      },
      endpoints: [
        {
          autoscaling_limit_max_cu: NEON_CONFIG.compute.maxCu,
          autoscaling_limit_min_cu: NEON_CONFIG.compute.minCu,
          type: EndpointType.ReadWrite,
        },
      ],
    });

    const branch = response.data?.branch;
    const endpoints = response.data?.endpoints;

    if (!branch || !endpoints || endpoints.length === 0) {
      throw new Error('Failed to create branch or endpoint');
    }

    const branchId = branch.id;
    const firstEndpoint = endpoints[0];
    if (!firstEndpoint) {
      throw new Error('No endpoint created');
    }
    const endpointId = firstEndpoint.id;

    console.log(`Branch created: ${branchId}`);
    console.log(`Endpoint created: ${endpointId}`);
    console.log(`\nAdd this to your .env.e2e file:`);
    console.log(`NEON_E2E_BRANCH_ID=${branchId}`);

    // Wait for endpoint to be ready
    await waitForEndpointReady(NEON_CONFIG.projectId, endpointId);

    // Get pooled connection string
    const connectionResponse = await client.getConnectionUri({
      branch_id: branchId,
      database_name: NEON_CONFIG.databaseName,
      pooled: true,
      projectId: NEON_CONFIG.projectId,
      role_name: NEON_CONFIG.roleName,
    });

    const connectionString = connectionResponse.data?.uri;

    if (!connectionString) {
      throw new Error('Failed to get connection string');
    }

    // Warmup the connection
    await warmupConnection(connectionString);

    console.log(`Dedicated E2E branch ready: ${branchName}`);

    return {
      branchId,
      branchName,
      connectionString,
      endpointId,
    };
  } catch (error) {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data?: unknown; status?: number } };
      console.error('Neon API Error:', {
        data: axiosError.response?.data,
        status: axiosError.response?.status,
      });
    }
    console.error('Failed to create dedicated E2E branch:', error);
    throw error;
  }
}

export async function createE2EBranch(): Promise<E2EBranchInfo> {
  const client = getClient();
  const branchName = generateBranchName();

  console.log(`Creating E2E branch: ${branchName}`);
  console.log(`Parent branch: ${NEON_CONFIG.developBranchId}`);

  try {
    // Create branch with endpoint
    const response = await client.createProjectBranch(NEON_CONFIG.projectId, {
      branch: {
        name: branchName,
        parent_id: NEON_CONFIG.developBranchId,
      },
      endpoints: [
        {
          autoscaling_limit_max_cu: NEON_CONFIG.compute.maxCu,
          autoscaling_limit_min_cu: NEON_CONFIG.compute.minCu,
          type: EndpointType.ReadWrite,
        },
      ],
    });

    const branch = response.data?.branch;
    const endpoints = response.data?.endpoints;

    if (!branch || !endpoints || endpoints.length === 0) {
      throw new Error('Failed to create branch or endpoint');
    }

    const branchId = branch.id;
    const firstEndpoint = endpoints[0];
    if (!firstEndpoint) {
      throw new Error('No endpoint created');
    }
    const endpointId = firstEndpoint.id;

    console.log(`Branch created: ${branchId}`);
    console.log(`Endpoint created: ${endpointId}`);

    // Wait for endpoint to be ready
    await waitForEndpointReady(NEON_CONFIG.projectId, endpointId);

    // Get pooled connection string (recommended by Neon for serverless stability)
    const connectionResponse = await client.getConnectionUri({
      branch_id: branchId,
      database_name: NEON_CONFIG.databaseName,
      pooled: true,
      projectId: NEON_CONFIG.projectId,
      role_name: NEON_CONFIG.roleName,
    });

    const connectionString = connectionResponse.data?.uri;

    if (!connectionString) {
      throw new Error('Failed to get connection string');
    }

    // Warmup the connection to ensure it's fully ready (recommended by Neon)
    await warmupConnection(connectionString);

    console.log(`E2E branch ready: ${branchName}`);

    return {
      branchId,
      branchName,
      connectionString,
      endpointId,
    };
  } catch (error) {
    // Log detailed error information for debugging
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data?: unknown; status?: number } };
      console.error('Neon API Error:', {
        data: axiosError.response?.data,
        status: axiosError.response?.status,
      });
    }
    console.error('Failed to create E2E branch:', error);
    throw error;
  }
}

export async function deleteE2EBranch(branchId: string): Promise<void> {
  const client = getClient();

  console.log(`Deleting E2E branch: ${branchId}`);

  try {
    await client.deleteProjectBranch(NEON_CONFIG.projectId, branchId);
    console.log(`E2E branch deleted: ${branchId}`);
  } catch (error) {
    // Log but don't throw - cleanup should not fail the test suite
    console.error(`Failed to delete E2E branch ${branchId}:`, error);
  }
}

// Legacy functions for backward compatibility

export async function getConnectionString(branchId: string): Promise<string> {
  const client = getClient();

  const response = await client.getConnectionUri({
    branch_id: branchId,
    database_name: NEON_CONFIG.databaseName,
    projectId: NEON_CONFIG.projectId,
    role_name: NEON_CONFIG.roleName,
  });

  const connectionString = response.data?.uri;

  if (!connectionString) {
    throw new Error(`Failed to get connection string for branch ${branchId}`);
  }

  return connectionString;
}

/**
 * Get the E2E branch connection info.
 * If NEON_E2E_BRANCH_ID is set, uses the dedicated branch.
 * Otherwise, creates a new dynamic branch (legacy behavior).
 */
export async function getE2EBranch(options?: { reset?: boolean }): Promise<E2EBranchInfo> {
  // Check if we should use a dedicated E2E branch
  if (NEON_CONFIG.e2eBranchId) {
    console.log('Using dedicated E2E branch:', NEON_CONFIG.e2eBranchId);

    // Optionally reset the branch to parent state
    if (options?.reset) {
      await resetE2EBranch();
    }

    return getDedicatedBranchInfo();
  }

  // Fall back to dynamic branch creation (legacy behavior)
  console.log('No dedicated E2E branch configured, creating dynamic branch...');
  return createE2EBranch();
}

/**
 * Reset the dedicated E2E branch to match its parent's current state.
 * This discards all changes and gives a fresh database state.
 */
export async function resetE2EBranch(): Promise<void> {
  if (!NEON_CONFIG.e2eBranchId) {
    console.log('No dedicated E2E branch configured, skipping reset');
    return;
  }

  const client = getClient();

  console.log(`Resetting E2E branch ${NEON_CONFIG.e2eBranchId} from parent...`);

  try {
    await client.restoreProjectBranch(NEON_CONFIG.projectId, NEON_CONFIG.e2eBranchId, {
      source_branch_id: NEON_CONFIG.developBranchId,
    });

    console.log('E2E branch reset successfully');

    // Wait a moment for the reset to propagate
    await new Promise((resolve) => setTimeout(resolve, 2000));
  } catch (error) {
    console.error('Failed to reset E2E branch:', error);
    throw error;
  }
}

function generateBranchName(): string {
  const timestamp = Date.now();
  const isCI = process.env.CI === 'true';
  const prefix = isCI ? 'e2e-ci' : 'e2e-local';
  return `${prefix}-${timestamp}`;
}

function getClient(): Api<unknown> {
  if (!neonClient) {
    const apiKey = process.env.NEON_API_KEY;
    if (!apiKey) {
      throw new Error('NEON_API_KEY environment variable is required for E2E branch management');
    }
    neonClient = createApiClient({ apiKey });
  }
  return neonClient;
}

/**
 * Get info for the dedicated E2E branch
 */
async function getDedicatedBranchInfo(): Promise<E2EBranchInfo> {
  const client = getClient();

  try {
    // Get branch details
    const branchResponse = await client.getProjectBranch(NEON_CONFIG.projectId, NEON_CONFIG.e2eBranchId);
    const branch = branchResponse.data?.branch;

    if (!branch) {
      throw new Error(`E2E branch not found: ${NEON_CONFIG.e2eBranchId}`);
    }

    // Get endpoints for the branch
    const endpointsResponse = await client.listProjectBranchEndpoints(
      NEON_CONFIG.projectId,
      NEON_CONFIG.e2eBranchId,
    );
    const endpoints = endpointsResponse.data?.endpoints || [];

    let endpointId: string;

    if (endpoints.length === 0) {
      // Create an endpoint if none exists
      console.log('No endpoint found for E2E branch, creating one...');
      const createResponse = await client.createProjectEndpoint(NEON_CONFIG.projectId, {
        endpoint: {
          autoscaling_limit_max_cu: NEON_CONFIG.compute.maxCu,
          autoscaling_limit_min_cu: NEON_CONFIG.compute.minCu,
          branch_id: NEON_CONFIG.e2eBranchId,
          type: EndpointType.ReadWrite,
        },
      });
      const newEndpoint = createResponse.data?.endpoint;
      if (!newEndpoint) {
        throw new Error('Failed to create endpoint for E2E branch');
      }
      endpointId = newEndpoint.id;
    } else {
      const firstEndpoint = endpoints[0];
      if (!firstEndpoint) {
        throw new Error('Endpoint array is empty');
      }
      endpointId = firstEndpoint.id;
    }

    // Wait for endpoint to be ready
    await waitForEndpointReady(NEON_CONFIG.projectId, endpointId);

    // Get pooled connection string
    const connectionResponse = await client.getConnectionUri({
      branch_id: NEON_CONFIG.e2eBranchId,
      database_name: NEON_CONFIG.databaseName,
      pooled: true,
      projectId: NEON_CONFIG.projectId,
      role_name: NEON_CONFIG.roleName,
    });

    const connectionString = connectionResponse.data?.uri;

    if (!connectionString) {
      throw new Error('Failed to get connection string for E2E branch');
    }

    // Warmup the connection
    await warmupConnection(connectionString);

    console.log(`E2E branch ready: ${branch.name}`);

    return {
      branchId: branch.id,
      branchName: branch.name,
      connectionString,
      endpointId,
    };
  } catch (error) {
    console.error('Failed to get dedicated E2E branch info:', error);
    throw error;
  }
}

async function waitForEndpointReady(
  projectId: string,
  endpointId: string,
  maxAttempts = 30,
  delayMs = 2000,
): Promise<void> {
  const client = getClient();

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const response = await client.getProjectEndpoint(projectId, endpointId);
    const endpoint = response.data?.endpoint;

    if (endpoint?.current_state === 'active') {
      return;
    }

    if (endpoint?.current_state === 'idle') {
      // Endpoint is ready but suspended, that's fine for our purposes
      return;
    }

    console.log(`Waiting for endpoint ${endpointId} to be ready... (attempt ${attempt + 1}/${maxAttempts})`);
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  throw new Error(
    `Endpoint ${endpointId} did not become ready within ${(maxAttempts * delayMs) / 1000} seconds`,
  );
}

/**
 * Warmup the database connection by running a simple query
 * This ensures the connection is fully established before tests run
 */
async function warmupConnection(connectionString: string, maxAttempts = 5): Promise<void> {
  const { Pool } = await import('@neondatabase/serverless');

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const pool = new Pool({ connectionString });
      await pool.query('SELECT 1');
      await pool.end();
      console.log('Database connection warmed up successfully');
      return;
    } catch (error) {
      console.log(`Connection warmup attempt ${attempt + 1}/${maxAttempts} failed, retrying...`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  console.warn('Connection warmup failed after all attempts, proceeding anyway...');
}

export { NEON_CONFIG };
