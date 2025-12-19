import { describe, expect, it } from 'vitest';

import {
  actionFailure,
  type ActionResponse,
  actionSuccess,
  isActionFailure,
  isActionSuccess,
  unwrapActionResponse,
} from '@/lib/utils/action-response';

describe('action response helpers', () => {
  describe('actionSuccess', () => {
    it('should create success response with data only', () => {
      // Arrange
      const data = { id: '123', name: 'Test' };

      // Act
      const result = actionSuccess(data);

      // Assert
      expect(result).toEqual({
        data: { id: '123', name: 'Test' },
        wasSuccess: true,
      });
      expect(result).not.toHaveProperty('message');
      expect(result.wasSuccess).toBe(true);
    });

    it('should create success response with data and message', () => {
      // Arrange
      const data = { id: '123', name: 'Test' };
      const message = 'Success!';

      // Act
      const result = actionSuccess(data, message);

      // Assert
      expect(result).toEqual({
        data: { id: '123', name: 'Test' },
        message: 'Success!',
        wasSuccess: true,
      });
      expect(result.message).toBe('Success!');
      expect(result.wasSuccess).toBe(true);
    });

    it('should handle null data for void operations', () => {
      // Arrange
      const data = null;
      const message = 'Item deleted';

      // Act
      const result = actionSuccess(data, message);

      // Assert
      expect(result).toEqual({
        data: null,
        message: 'Item deleted',
        wasSuccess: true,
      });
    });
  });

  describe('actionFailure', () => {
    it('should create failure response with message', () => {
      // Arrange
      const message = 'Error occurred';

      // Act
      const result = actionFailure(message);

      // Assert
      expect(result).toEqual({
        data: null,
        message: 'Error occurred',
        wasSuccess: false,
      });
      expect(result.data).toBeNull();
      expect(result.wasSuccess).toBe(false);
    });

    it('should handle various error messages', () => {
      // Arrange
      const messages = ['Validation failed', 'User not found', 'Permission denied'];

      // Act & Assert
      messages.forEach((msg) => {
        const result = actionFailure(msg);
        expect(result.message).toBe(msg);
        expect(result.wasSuccess).toBe(false);
      });
    });
  });

  describe('isActionSuccess', () => {
    it('should identify success response', () => {
      // Arrange
      const successResponse = actionSuccess({ id: '123' });

      // Act
      const result = isActionSuccess(successResponse);

      // Assert
      expect(result).toBe(true);
    });

    it('should identify failure response as not success', () => {
      // Arrange
      const failureResponse = actionFailure('Error');

      // Act
      const result = isActionSuccess(failureResponse);

      // Assert
      expect(result).toBe(false);
    });

    it('should narrow type to ActionSuccessResponse when true', () => {
      // Arrange
      const response: ActionResponse<{ id: string }> = actionSuccess({ id: '123' });

      // Act & Assert
      expect(isActionSuccess(response)).toBe(true);
      // TypeScript should know response.data exists here after the guard
      expect(response.data).toEqual({ id: '123' });
      expect(response.wasSuccess).toBe(true);
    });
  });

  describe('isActionFailure', () => {
    it('should identify failure response', () => {
      // Arrange
      const failureResponse = actionFailure('Error');

      // Act
      const result = isActionFailure(failureResponse);

      // Assert
      expect(result).toBe(true);
    });

    it('should identify success response as not failure', () => {
      // Arrange
      const successResponse = actionSuccess({ id: '123' });

      // Act
      const result = isActionFailure(successResponse);

      // Assert
      expect(result).toBe(false);
    });

    it('should narrow type to ActionFailureResponse when true', () => {
      // Arrange
      const response: ActionResponse<{ id: string }> = actionFailure('Something went wrong');

      // Act & Assert
      expect(isActionFailure(response)).toBe(true);
      // TypeScript should know response is ActionFailureResponse here after the guard
      expect(response.message).toBe('Something went wrong');
      expect(response.data).toBeNull();
      expect(response.wasSuccess).toBe(false);
    });
  });

  describe('unwrapActionResponse', () => {
    it('should return data for successful response', () => {
      // Arrange
      const successResponse = actionSuccess({ id: '123', name: 'Test' });

      // Act
      const result = unwrapActionResponse(successResponse);

      // Assert
      expect(result).toEqual({ id: '123', name: 'Test' });
    });

    it('should throw error for failure response', () => {
      // Arrange
      const failureResponse = actionFailure('Operation failed');

      // Act & Assert
      expect(() => unwrapActionResponse(failureResponse)).toThrow('Operation failed');
    });

    it('should throw error with correct message', () => {
      // Arrange
      const errorMessage = 'Custom error message';
      const failureResponse = actionFailure(errorMessage);

      // Act & Assert
      expect(() => unwrapActionResponse(failureResponse)).toThrow(errorMessage);
    });

    it('should handle null data in successful response', () => {
      // Arrange
      const successResponse = actionSuccess(null);

      // Act
      const result = unwrapActionResponse(successResponse);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('discriminated union type narrowing', () => {
    it('should properly narrow types based on wasSuccess property', () => {
      // Arrange
      const responses: Array<ActionResponse<{ id: string }>> = [
        actionSuccess({ id: '1' }),
        actionFailure('Error 1'),
        actionSuccess({ id: '2' }, 'Success message'),
        actionFailure('Error 2'),
      ];

      // Act
      const successResults = responses.filter((r) => r.wasSuccess);
      const failureResults = responses.filter((r) => !r.wasSuccess);

      // Assert
      expect(successResults).toHaveLength(2);
      expect(failureResults).toHaveLength(2);

      // Type narrowing verification - success results
      successResults.forEach((r) => {
        expect(r.wasSuccess).toBe(true);
        expect(r.data).toBeDefined();
        expect(r.data).toHaveProperty('id');
      });

      // Type narrowing verification - failure results
      failureResults.forEach((r) => {
        expect(r.wasSuccess).toBe(false);
        expect(r.data).toBeNull();
        expect(r.message).toBeDefined();
      });
    });

    it('should handle conditional logic with type guards', () => {
      // Arrange
      const response: ActionResponse<string> = actionSuccess('test-data');

      // Act & Assert
      expect(isActionSuccess(response)).toBe(true);
      expect(response.data).toBe('test-data');
      expect(response.wasSuccess).toBe(true);
    });
  });
});
