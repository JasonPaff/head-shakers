'use client';

import type { Message } from 'ably';
import type { ChannelResult } from 'ably/react';

import { useChannel, useConnectionStateListener } from 'ably/react';
import { useCallback, useEffect, useState } from 'react';

import type { AblyRefinementMessage, RealTimeProgressEntry } from '../types/streaming';

import { AblyChannelStatus, AgentThinkingStage } from '../types/streaming';

interface UseAblyRefinementOptions {
  onError?: (error: Error) => void;
  onMessage?: (message: RealTimeProgressEntry) => void;
  sessionId: string;
}

interface UseAblyRefinementReturn {
  channel: ChannelResult['channel'];
  clearMessages: () => void;
  connectionStatus: AblyChannelStatus;
  error: Error | null;
  isConnected: boolean;
  messages: Array<RealTimeProgressEntry>;
  publishMessage: (
    content: string,
    stage: AgentThinkingStage,
    metadata?: Record<string, unknown>,
  ) => Promise<void>;
}

/**
 * Custom hook for managing Ably channel subscription and message publishing
 * for feature planner real-time refinement updates
 */
export function useAblyRefinement({
  onError,
  onMessage,
  sessionId,
}: UseAblyRefinementOptions): UseAblyRefinementReturn {
  const [messages, setMessages] = useState<Array<RealTimeProgressEntry>>([]);
  const [connectionStatus, setConnectionStatus] = useState<AblyChannelStatus>(AblyChannelStatus.CONNECTING);
  const [error, setError] = useState<Error | null>(null);

  const channelName = `feature-planner:${sessionId}`;

  useConnectionStateListener('connected', () => {
    setConnectionStatus(AblyChannelStatus.CONNECTED);
    setError(null);
  });

  useConnectionStateListener('disconnected', () => {
    setConnectionStatus(AblyChannelStatus.DISCONNECTED);
  });

  useConnectionStateListener('suspended', () => {
    setConnectionStatus(AblyChannelStatus.SUSPENDED);
  });

  useConnectionStateListener('failed', (stateChange) => {
    setConnectionStatus(AblyChannelStatus.FAILED);
    const connectionError = new Error(
      `Ably connection failed: ${stateChange.reason?.message || 'Unknown error'}`,
    );
    setError(connectionError);
    onError?.(connectionError);
  });

  useConnectionStateListener('closed', () => {
    setConnectionStatus(AblyChannelStatus.CLOSED);
  });

  const { channel } = useChannel(channelName, 'refinement-update', (message: Message) => {
    try {
      const ablyMessage = message.data as AblyRefinementMessage;

      // convert the Ably message to RealTimeProgressEntry
      const progressEntry: RealTimeProgressEntry = {
        agentId: ablyMessage.agentId,
        id: ablyMessage.messageId,
        message: ablyMessage.content,
        messageId: ablyMessage.messageId,
        metadata: ablyMessage.metadata,
        sessionId: ablyMessage.sessionId,
        stage: ablyMessage.stage,
        timestamp: new Date(ablyMessage.timestamp),
        type:
          ablyMessage.stage === AgentThinkingStage.ERROR ? 'error'
          : ablyMessage.stage === AgentThinkingStage.COMPLETED ? 'success'
          : 'info',
      };

      setMessages((prev) => [...prev, progressEntry]);
      onMessage?.(progressEntry);
    } catch (err) {
      const parseError = err instanceof Error ? err : new Error('Failed to parse message');
      setError(parseError);
      onError?.(parseError);
    }
  });

  const publishMessage = useCallback(
    async (content: string, stage: AgentThinkingStage, metadata?: Record<string, unknown>): Promise<void> => {
      try {
        const message: AblyRefinementMessage = {
          agentId: 'feature-planner-agent',
          content,
          messageId: crypto.randomUUID(),
          metadata,
          sessionId,
          stage,
          timestamp: new Date(),
        };

        await channel.publish('refinement-update', message);
      } catch (err) {
        const publishError = err instanceof Error ? err : new Error('Failed to publish message');
        setError(publishError);
        onError?.(publishError);
        throw publishError;
      }
    },
    [channel, sessionId, onError],
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  useEffect(() => {
    return () => {
      setMessages([]);
      setError(null);
    };
  }, []);

  return {
    channel,
    clearMessages,
    connectionStatus,
    error,
    isConnected: connectionStatus === AblyChannelStatus.CONNECTED,
    messages,
    publishMessage,
  };
}
