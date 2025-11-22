import { type Api, createApiClient, EndpointType } from '@neondatabase/api-client';

// Configuration constants from the infrastructure plan
const NEON_CONFIG = {
  compute: {
    maxCu: 0.25,
    minCu: 0.25,
  },
  databaseName: 'head-shakers',
  developBranchId: 'br-dark-forest-adf48tll',
  projectId: 'misty-boat-49919732',
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

    // Get connection string
    const connectionResponse = await client.getConnectionUri({
      branch_id: branchId,
      database_name: NEON_CONFIG.databaseName,
      projectId: NEON_CONFIG.projectId,
      role_name: NEON_CONFIG.roleName,
    });

    const connectionString = connectionResponse.data?.uri;

    if (!connectionString) {
      throw new Error('Failed to get connection string');
    }

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

export { NEON_CONFIG };
