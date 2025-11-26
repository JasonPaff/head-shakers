import { SCHEMA_LIMITS } from '@/lib/constants';

/**
 * Check if a comment is still within the edit window
 * Comments can only be edited within EDIT_WINDOW_MINUTES of creation
 *
 * @param createdAt - The comment's creation timestamp (Date or ISO string)
 * @returns true if the comment can still be edited, false if the window has expired
 */
export function isCommentEditable(createdAt: Date | string): boolean {
  const createdDate = createdAt instanceof Date ? createdAt : new Date(createdAt);
  const now = new Date();
  const editWindowMs = SCHEMA_LIMITS.COMMENT.EDIT_WINDOW_MINUTES * 60 * 1000;
  const timeSinceCreation = now.getTime() - createdDate.getTime();

  return timeSinceCreation <= editWindowMs;
}
