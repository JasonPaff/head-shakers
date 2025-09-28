/**
 * Shared types for feature planner streaming functionality
 */

/**
 * Ably channel connection status states
 */
export enum AblyChannelStatus {
  CLOSED = 'closed',
  CONNECTED = 'connected',
  CONNECTING = 'connecting',
  DISCONNECTED = 'disconnected',
  FAILED = 'failed',
  SUSPENDED = 'suspended',
}

/**
 * Agent thinking stages during feature request refinement
 */
export enum AgentThinkingStage {
  ANALYZING_REQUEST = 'analyzing_request',
  COMPLETED = 'completed',
  ENHANCING_CONTEXT = 'enhancing_context',
  ERROR = 'error',
  FINALIZING = 'finalizing',
  FINDING_INTEGRATION_POINTS = 'finding_integration_points',
  GENERATING_REFINEMENT = 'generating_refinement',
  IDENTIFYING_TECHNOLOGIES = 'identifying_technologies',
  INITIALIZING = 'initializing',
}

/**
 * Ably-specific message types for real-time agent communication
 */
export interface AblyRefinementMessage {
  agentId: string;
  content: string;
  messageId: string;
  metadata?: {
    context?: Record<string, unknown>;
    duration?: number;
    progress?: number;
  };
  sessionId: string;
  stage: AgentThinkingStage;
  timestamp: Date;
}

/**
 * Progress indicators for UI display
 */
export interface AgentProgressIndicator {
  description: string;
  isActive: boolean;
  isCompleted: boolean;
  label: string;
  progress?: number;
  stage: AgentThinkingStage;
}

export interface ProgressEntry {
  agentId?: string;
  id: string;
  message: string;
  timestamp: Date;
  type: 'error' | 'info' | 'success' | 'warning';
}

/**
 * Real-time progress entry extending base ProgressEntry with Ably metadata
 */
export interface RealTimeProgressEntry extends ProgressEntry {
  messageId: string;
  metadata?: {
    context?: Record<string, unknown>;
    duration?: number;
    progress?: number;
  };
  sessionId: string;
  stage: AgentThinkingStage;
}
