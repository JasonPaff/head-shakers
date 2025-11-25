'use client';

import * as Ably from 'ably';
import { AblyProvider as Provider } from 'ably/react';

const ablyClient = new Ably.Realtime({ key: process.env.NEXT_PUBLIC_ABLY_API_KEY || '' });

type AblyProviderProps = RequiredChildren;

export const AblyProvider = ({ children }: AblyProviderProps) => {
  return <Provider client={ablyClient}>{children}</Provider>;
};
