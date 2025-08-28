import { execSync } from 'child_process';

export const isDockerAvailable = (): boolean => {
  try {
    execSync('docker --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
};

export const isDockerRunning = (): boolean => {
  try {
    execSync('docker info', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
};

interface CheckDockerRequirementsResult {
  error?: string;
  isAvailable: boolean;
  isRunning: boolean;
}

export const checkDockerRequirements = (): CheckDockerRequirementsResult => {
  const available = isDockerAvailable();

  if (!available) {
    return {
      error: 'Docker not installed. Install Docker Desktop from https://docker.com',
      isAvailable: false,
      isRunning: false,
    };
  }

  const running = isDockerRunning();

  if (!running) {
    return {
      error: 'Docker installed but not running. Start Docker Desktop.',
      isAvailable: true,
      isRunning: false,
    };
  }

  return { isAvailable: true, isRunning: true };
};
