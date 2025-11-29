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
 * Failed action response for soft failures (business logic failures that
 * don't throw exceptions). Use this when you want to return a failure
 * state that the client handles differently than a thrown error.
 *
 * For unexpected errors or validation failures, prefer throwing ActionError
 * which flows through next-safe-action's error handling.
 */
export interface ActionFailureResponse {
  data: null;
  message: string;
  wasSuccess: false;
}

/**
 * Unified action response type.
 *
 * Uses a discriminated union on `wasSuccess` for easy type narrowing:
 * ```ts
 * const result = await someAction(input);
 * if (result.wasSuccess) {
 *   // TypeScript knows result.data is T here
 *   console.log(result.data);
 * } else {
 *   // TypeScript knows result is ActionFailureResponse
 *   console.log(result.message);
 * }
 * ```
 */
export type ActionResponse<T = null> = ActionFailureResponse | ActionSuccessResponse<T>;

/**
 * Successful action response with data
 */
export interface ActionSuccessResponse<T> {
  data: T;
  message?: string;
  wasSuccess: true;
}

/**
 * Create a failed action response for soft failures.
 *
 * Use this for business logic failures that should be handled by the client
 * differently than thrown errors (which appear in next-safe-action's serverError).
 *
 * @param message - User-friendly error message
 * @returns ActionFailureResponse with wasSuccess: false
 *
 * @example
 * if (!result.isSuccessful) {
 *   return actionFailure('Unable to process your request.');
 * }
 */
export function actionFailure(message: string): ActionFailureResponse {
  return { data: null, message, wasSuccess: false };
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
 * Type guard to check if a response is a failure.
 *
 * @example
 * const result = await someAction(input);
 * if (isActionFailure(result)) {
 *   toast.error(result.message);
 * }
 */
export function isActionFailure<T>(response: ActionResponse<T>): response is ActionFailureResponse {
  return !response.wasSuccess;
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
 * @throws Error if response is not successful (includes the failure message)
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
    throw new Error(response.message);
  }
  return response.data;
}
