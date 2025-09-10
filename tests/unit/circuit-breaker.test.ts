import { describe, expect, it, vi } from 'vitest';

import { CircuitBreaker, CircuitState, getCircuitHealth } from '@/lib/utils/circuit-breaker';
import { getCircuitBreakerRegistry } from '@/lib/utils/circuit-breaker-registry';

describe('Circuit Breaker', () => {
  it('should start in CLOSED state', () => {
    const breaker = new CircuitBreaker('test-breaker');
    expect(breaker.getState()).toBe(CircuitState.CLOSED);
  });
  
  it('should execute operation successfully in CLOSED state', async () => {
    const breaker = new CircuitBreaker('test-breaker');
    const mockOperation = vi.fn().mockResolvedValue('success');
    
    const result = await breaker.execute(mockOperation);
    
    expect(result.result).toBe('success');
    expect(result.wasExecuted).toBe(true);
    expect(result.wasRejected).toBe(false);
    expect(mockOperation).toHaveBeenCalledTimes(1);
  });
  
  it('should open circuit after failure threshold', async () => {
    const breaker = new CircuitBreaker('test-breaker', {
      failureThreshold: 2
    });
    
    const mockOperation = vi.fn().mockRejectedValue(new Error('Operation failed'));
    
    // First failure
    await expect(breaker.execute(mockOperation)).rejects.toThrow('Operation failed');
    expect(breaker.getState()).toBe(CircuitState.CLOSED);
    
    // Second failure should open the circuit
    await expect(breaker.execute(mockOperation)).rejects.toThrow('Operation failed');
    expect(breaker.getState()).toBe(CircuitState.OPEN);
  });
  
  it('should reject requests immediately when OPEN', async () => {
    const breaker = new CircuitBreaker('test-breaker', {
      failureThreshold: 1
    });
    
    const mockOperation = vi.fn().mockRejectedValue(new Error('Operation failed'));
    
    // Trigger circuit to open
    await expect(breaker.execute(mockOperation)).rejects.toThrow('Operation failed');
    expect(breaker.getState()).toBe(CircuitState.OPEN);
    
    // Next request should be rejected immediately
    await expect(breaker.execute(mockOperation)).rejects.toThrow('Circuit breaker test-breaker is OPEN');
    expect(mockOperation).toHaveBeenCalledTimes(1); // Should not call operation again
  });
  
  it('should reset to CLOSED state', async () => {
    const breaker = new CircuitBreaker('test-breaker', {
      failureThreshold: 1
    });
    
    const mockOperation = vi.fn().mockRejectedValue(new Error('Operation failed'));
    
    // Open the circuit
    await expect(breaker.execute(mockOperation)).rejects.toThrow();
    
    // Reset should close the circuit
    breaker.reset();
    expect(breaker.getState()).toBe(CircuitState.CLOSED);
  });
  
  it('should provide health status', () => {
    const breaker = new CircuitBreaker('test-breaker');
    
    const health = getCircuitHealth(breaker);
    
    expect(health.name).toBe('test-breaker');
    expect(health.state).toBe(CircuitState.CLOSED);
    expect(health.isHealthy).toBe(true);
    expect(health.totalRequests).toBe(0);
  });
});

describe('Circuit Breaker Registry', () => {
  it('should create and retrieve circuit breakers', () => {
    const registry = getCircuitBreakerRegistry();
    
    const breaker1 = registry.getDatabaseBreaker('test-db');
    const breaker2 = registry.getDatabaseBreaker('test-db');
    
    expect(breaker1).toBe(breaker2); // Should return same instance
    expect(breaker1.getName()).toBe('test-db');
  });
  
  it('should provide registry statistics', () => {
    const registry = getCircuitBreakerRegistry();
    
    registry.getDatabaseBreaker('db-test');
    registry.getExternalServiceBreaker('service-test');
    
    const stats = registry.getStats();
    
    expect(stats.breakersCount).toBeGreaterThanOrEqual(2);
    expect(stats.healthSummary.total).toBeGreaterThanOrEqual(2);
    expect(stats.overallHealthPercentage).toBe(100);
  });
  
  it('should reset all breakers', () => {
    const registry = getCircuitBreakerRegistry();
    
    const breaker = registry.getDatabaseBreaker('reset-test');
    
    registry.resetAllBreakers();
    
    expect(breaker.getState()).toBe(CircuitState.CLOSED);
  });
});