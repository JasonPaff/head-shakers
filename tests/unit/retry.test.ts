import { describe, expect, it, vi } from 'vitest';

import { withDatabaseRetry, withRetry, withServiceRetry } from '@/lib/utils/retry';

describe('Retry Utilities', () => {
  it('should succeed on first attempt', async () => {
    const mockOperation = vi.fn().mockResolvedValue('success');

    const result = await withRetry(mockOperation, {
      maxAttempts: 3,
      operationName: 'test-operation',
    });

    expect(result.result).toBe('success');
    expect(result.attempts).toBe(1);
    expect(result.wasRetried).toBe(false);
    expect(mockOperation).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure and succeed', async () => {
    const retryableError = new Error('Connection timeout') as Error & { code?: string };
    retryableError.code = 'ECONNRESET';

    const mockOperation = vi.fn().mockRejectedValueOnce(retryableError).mockResolvedValue('success');

    const result = await withRetry(mockOperation, {
      maxAttempts: 3,
      operationName: 'test-operation',
      shouldRetry: () => true,
    });

    expect(result.result).toBe('success');
    expect(result.attempts).toBe(2);
    expect(result.wasRetried).toBe(true);
    expect(mockOperation).toHaveBeenCalledTimes(2);
  });

  it('should fail after max attempts', async () => {
    const retryableError = new Error('Operation failed') as Error & { code?: string };
    retryableError.code = 'ECONNRESET';

    const mockOperation = vi.fn().mockRejectedValue(retryableError);

    await expect(
      withRetry(mockOperation, {
        maxAttempts: 2,
        operationName: 'test-operation',
        shouldRetry: () => true,
      }),
    ).rejects.toThrow('Operation failed');

    expect(mockOperation).toHaveBeenCalledTimes(2);
  });

  it('should use database-specific retry settings', async () => {
    const mockOperation = vi.fn().mockResolvedValue('success');

    const result = await withDatabaseRetry(mockOperation);

    expect(result.result).toBe('success');
    expect(result.attempts).toBe(1);
    expect(mockOperation).toHaveBeenCalledTimes(1);
  });

  it('should use service-specific retry settings', async () => {
    const mockOperation = vi.fn().mockResolvedValue('success');

    const result = await withServiceRetry(mockOperation, 'test-service');

    expect(result.result).toBe('success');
    expect(result.attempts).toBe(1);
    expect(mockOperation).toHaveBeenCalledTimes(1);
  });

  it('should call onRetry callback', async () => {
    const retryableError = new Error('First failed') as Error & { code?: string };
    retryableError.code = 'ECONNRESET';

    const mockOperation = vi.fn().mockRejectedValueOnce(retryableError).mockResolvedValue('success');

    const onRetry = vi.fn();

    await withRetry(mockOperation, {
      maxAttempts: 3,
      onRetry,
      operationName: 'test-operation',
      shouldRetry: () => true,
    });

    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledWith(expect.any(Error), 1, expect.any(Number));
  });
});
