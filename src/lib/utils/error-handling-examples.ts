/**
 * Examples demonstrating how to use the new error handling system
 * in server actions and business logic
 */

import { createBusinessRuleViolation, createNotFoundError, handleActionError } from './action-error-handler';
import { ActionError, ErrorType } from './errors';

// Example 4: Database operation with specific constraint handling
export async function createUniqueResource(data: { email: string; name: string }, userId: string) {
  try {
    // This would be your actual database call
    // const result = await db.insert(resources).values({ ...data, userId });

    // Simulate unique constraint violation
    const error = new Error('duplicate key value violates unique constraint');
    (error as unknown as { code: string }).code = '23505';
    throw error;
  } catch (error) {
    // The error handler will automatically detect and classify database errors
    handleActionError(error, {
      input: { name: data.name }, // Don't log email for privacy
      operation: 'create_unique_resource',
      userId,
    });
  }
}

// Example 1: Basic action with comprehensive error handling
export function exampleAction() {
  return async (input: { id: string; name: string }) => {
    try {
      // Simulate business logic
      const resource = await getResource(input.id);

      if (!resource) {
        throw createNotFoundError('Resource', 'example_action', input.id);
      }

      if (resource.locked) {
        throw createBusinessRuleViolation(
          'resource_locked',
          'Cannot modify a locked resource',
          'example_action',
          { resourceId: input.id },
        );
      }

      // Simulate database operation that might fail
      const result = await updateResource(resource.id, input);

      return {
        data: result,
        success: true,
      };
    } catch (error) {
      // Use the comprehensive error handler
      handleActionError(error, {
        input: { resourceId: input.id }, // Don't log sensitive data
        metadata: { resourceType: 'example' },
        operation: 'example_action',
      });
    }
  };
}

// Example 3: External service integration with proper error handling
export async function uploadToExternalService(file: File, userId: string) {
  try {
    // Simulate external API call
    const response = await fetch('/api/external-service', {
      body: file,
      method: 'POST',
    });

    if (!response.ok) {
      throw new ActionError(
        ErrorType.EXTERNAL_SERVICE,
        'UPLOAD_FAILED',
        'Failed to upload file to external service',
        {
          httpStatus: response.status,
          operation: 'external_upload',
          service: 'file-upload',
          userId,
        },
        response.status >= 500, // Retryable for 5xx errors
        response.status,
      );
    }

    return await response.json();
  } catch (error) {
    // Let the action error handler classify and handle the error
    handleActionError(error, {
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      },
      operation: 'external_upload',
      userId,
    });
  }
}

// Example 2: Handling specific business rules
export function validateOwnership(resourceId: string, userId: string, operation: string) {
  // This would typically be an async database call
  const resource = { id: resourceId, userId: 'different-user' };

  if (resource.userId !== userId) {
    throw new ActionError(
      ErrorType.AUTHORIZATION,
      'INSUFFICIENT_PERMISSIONS',
      'You do not have permission to access this resource',
      {
        operation,
        ownedBy: resource.userId,
        requestedBy: userId,
        resourceId,
      },
      false,
      403,
    );
  }

  return resource;
}

// Mock functions for examples (these would be your actual business logic)
async function getResource(id: string) {
  return { id, locked: false, userId: 'owner-123' };
}

async function updateResource(id: string, data: { name: string }) {
  return { id, ...data, updatedAt: new Date() };
}

// Example usage patterns for different scenarios:

/**
 * 1. For simple not found cases:
 * throw createNotFoundError('User', 'get_user_profile', userId);
 *
 * 2. For business rule violations:
 * throw createBusinessRuleViolation(
 *   'max_collections_exceeded',
 *   'User has reached maximum number of collections',
 *   'create_collection'
 * );
 *
 * 3. For authorization issues:
 * throw new ActionError(
 *   ErrorType.AUTHORIZATION,
 *   'INSUFFICIENT_PERMISSIONS',
 *   'Access denied',
 *   { operation: 'delete_collection', userId, resourceId },
 *   false,
 *   403
 * );
 *
 * 4. For external service issues:
 * throw new ActionError(
 *   ErrorType.EXTERNAL_SERVICE,
 *   'CLOUDINARY_UPLOAD_FAILED',
 *   'Image upload failed',
 *   { operation: 'upload_image', service: 'cloudinary' },
 *   true, // Retryable
 *   503
 * );
 */
