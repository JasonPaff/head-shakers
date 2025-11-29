/**
 * Unified server action response types and helpers.
 *
 * All server actions should return ActionResponse<T> for consistent
 * client-side handling and type inference.
 *
 * @example
 * // Success with data
 * return actionSuccess(user);
 *
 * // Success with message
 * return actionSuccess(user, 'Profile updated successfully');
 *
 * // Success without data (for delete operations)
 * return actionSuccess(null, 'Item deleted');
 */

/**
 * Unified action response type.
 *
 * Uses a discriminated union on `success` for easy type narrowing:
 * ```ts
 * const result = await someAction(input);
 * if (result.wasSuccess) {
 *   // TypeScript knows result.data is T here
 *   console.log(result.data);
 * }
 * ```
 *
 * Note: Error responses are handled by next-safe-action's error handling
 * and the handleActionError utility, which throws ActionError instances.
 * The client receives errors through the `serverError` field from next-safe-action.
 */
export type ActionResponse<T = null> = ActionSuccessResponse<T>;

/**
 * Successful action response with data
 */
export interface ActionSuccessResponse<T> {
  data: T;
  message?: string;
  wasSuccess: true;
}

/**
 * Create a successful action response with data.
 *
 * @param data - The response data
 * @param message - Optional success message for user feedback
 * @returns ActionResponse with success: true
 *
 * @example
 * // With data only
 * return actionSuccess({ id: 1, name: 'Test' });
 *
 * // With data and message
 * return actionSuccess(newUser, 'Account created successfully');
 *
 * // For void operations (delete, etc.)
 * return actionSuccess(null, 'Item deleted');
 */
export function actionSuccess<T>(data: T, message?: string): ActionSuccessResponse<T> {
  if (message !== undefined) {
    return { data, message, wasSuccess: true };
  }
  return { data, wasSuccess: true };
}

/**
 * Type guard to check if a response is successful.
 *
 * Useful when working with responses from multiple actions
 * or when type narrowing is needed.
 *
 * @example
 * const result = await someAction(input);
 * if (isActionSuccess(result)) {
 *   // result.data is available here
 * }
 */
export function isActionSuccess<T>(response: ActionResponse<T>): response is ActionSuccessResponse<T> {
  return response.wasSuccess;
}

/**
 * Extract data from an action response, throwing if not successful.
 *
 * Useful in contexts where you want to handle errors at a higher level
 * and just need the data.
 *
 * @throws Error if response is not successful
 *
 * @example
 * try {
 *   const data = unwrapActionResponse(await someAction(input));
 *   // Use data directly
 * } catch (error) {
 *   // Handle error
 * }
 */
export function unwrapActionResponse<T>(response: ActionResponse<T>): T {
  if (!response.wasSuccess) {
    // This shouldn't happen with the current type, but provides runtime safety
    throw new Error('Action response was not successful');
  }
  return response.data;
}
