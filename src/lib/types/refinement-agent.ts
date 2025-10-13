/**
 * Refinement agent interface for feature request refinement
 * Represents a specialized agent with specific role, focus, and configuration
 */
export interface RefinementAgent {
  agentId: string;
  focus: string;
  name: string;
  role: string;
  systemPrompt: string;
  temperature: number;
  tools: Array<string>;
}
