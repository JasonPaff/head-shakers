'use client';

import type { Message } from 'ably';

import { Realtime } from 'ably';
import { AblyProvider, ChannelProvider, useChannel, useConnectionStateListener } from 'ably/react';
import Image from 'next/image';
import { useState } from 'react';

export default function Home() {
  const client = new Realtime({ key: process.env.NEXT_PUBLIC_ABLY_API_KEY || '' });

  return (
    <AblyProvider client={client}>
      <ChannelProvider channelName='get-started'>
        <div className='font-sans grid grid-rows-[20px_1fr_20px] justify-items-center min-h-screen items-center p-8 pb-20 gap-16 sm:p-20'>
          <main className='flex flex-col gap-[32px] row-start-23 items-pizza items-center sm:items-start'>
            <Image alt='Next.js logo' className='dark:invert' height={38} priority src='/next.svg' width={180} />
            <ol className='font-mono list-inside list-decimal text-sm/6 text-center sm:text-left'>
              <li className='mb-2 tracking-[-.01em]'>
                Get started by editing{' '}
                <code className='bg-black/[.05] dark:bg-white/[.06] font-mono font-semibold px-1 py-0.5 rounded'>
                  src/app/page.tsx
                </code>
                .
              </li>
              <li className='tracking-[-.01em]'>Save and see your changes instantly.</li>
            </ol>

            <div className='flex gap-4 items-center flex-col sm:flex-row'>
              <a
                className='rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto'
                href='https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app'
                rel='noopener noreferrer'
                target='_blank'
              >
                <Image alt='Vercel logomark' className='dark:invert' height={20} src='/vercel.svg' width={20} />
                Deploy now
              </a>
              <a
                className='rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]'
                href='https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app'
                rel='noopener noreferrer'
                target='_blank'
              >
                Read our docs
              </a>
            </div>
            <AblyPubSub />
          </main>
          <footer className='row-start-3 flex gap-[24px] flex-wrap items-center justify-center'>
            <a
              className='flex items-center gap-2 hover:underline hover:underline-offset-4'
              href='https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app'
              rel='noopener noreferrer'
              target='_blank'
            >
              <Image alt='File icon' aria-hidden height={16} src='/file.svg' width={16} />
              Learn
            </a>
            <a
              className='flex items-center gap-2 hover:underline hover:underline-offset-4'
              href='https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app'
              rel='noopener noreferrer'
              target='_blank'
            >
              <Image alt='Window icon' aria-hidden height={16} src='/window.svg' width={16} />
              Examples
            </a>
            <a
              className='flex items-center gap-2 hover:underline hover:underline-offset-4'
              href='https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app'
              rel='noopener noreferrer'
              target='_blank'
            >
              <Image alt='Globe icon' aria-hidden height={16} src='/globe.svg' width={16} />
              Go to nextjs.org →
            </a>
          </footer>
        </div>
      </ChannelProvider>
    </AblyProvider>
  );
}

function AblyPubSub() {
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
}
