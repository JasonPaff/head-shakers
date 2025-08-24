'use client';

import type { Message } from 'ably';

import { Realtime } from 'ably';
import { AblyProvider, ChannelProvider, useChannel, useConnectionStateListener } from 'ably/react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

export default function AblyExamplePage() {
  const client = new Realtime({ key: process.env.NEXT_PUBLIC_ABLY_API_KEY || '' });

  return (
    <AblyProvider client={client}>
      <ChannelProvider channelName={'get-started'}>
        <main>
          Hello, Ably!
          <Button variant={'default'}>Click Me</Button>
          <AblyPubSub />
        </main>
      </ChannelProvider>
    </AblyProvider>
  );
}

const AblyPubSub = () => {
  const [messages, setMessages] = useState<Array<Message>>([]);

  useConnectionStateListener('connected', () => {
    console.log('Connected to Ably!');
  });

  // Create a channel called 'get-started' and subscribe to all messages with the name 'first' using the useChannel hook
  const { channel } = useChannel('get-started', 'first', (message) => {
    setMessages((previousMessages) => [...previousMessages, message]);
  });

  return (
    // Publish a message with the name 'first' and the contents 'Here is my first message!' when the 'Publish' button is clicked
    <div>
      <button
        onClick={() => {
          void channel.publish('first', 'Here is my first message!');
        }}
      >
        Publish
      </button>
      {messages.map((message) => {
        return <p key={message.id}>{message.data}</p>;
      })}
    </div>
  );
};
