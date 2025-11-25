'use client';

import { ChannelProvider } from 'ably/react';

import { ABLY_CHANNELS } from '@/lib/constants/ably-channels';

type TestProviderProps = RequiredChildren;

export const TestProvider = ({ children }: TestProviderProps) => {
  return <ChannelProvider channelName={ABLY_CHANNELS.ADMIN_NEWSLETTER_SIGNUPS}>{children}</ChannelProvider>;
};
