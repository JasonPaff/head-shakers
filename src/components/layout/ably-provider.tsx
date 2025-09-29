'use client';

import { Realtime } from 'ably';
import { AblyProvider as Ably } from 'ably/react';

const ablyClient = new Realtime({ key: process.env.NEXT_PUBLIC_ABLY_API_KEY || '' });

type AblyProviderProps = RequiredChildren;

export const AblyProvider = ({ children }: AblyProviderProps) => {
  return <Ably client={ablyClient}>{children}</Ably>;
};
