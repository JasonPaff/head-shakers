/**
 * Shared types for feature planner streaming functionality
 */

export interface ProgressEntry {
  agentId?: string;
  id: string;
  message: string;
  timestamp: Date;
  type: 'error' | 'info' | 'success' | 'warning';
}