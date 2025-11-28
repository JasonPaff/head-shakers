'use client';

import Link from 'next/link';
import { $path } from 'next-typesafe-url';
import { HomeIcon } from 'lucide-react';

export function LogoIsland() {
  return (
    <div className='pointer-events-auto absolute left-0 top-0'>
      <Link
        href={$path({ route: '/' })}
        className='group flex items-center gap-2 rounded-2xl bg-card px-5 py-3.5 shadow-xl ring-1 ring-border/50 transition-all hover:shadow-2xl hover:ring-primary/20'
        aria-label='Head Shakers Home'
      >
        <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-transform group-hover:scale-110'>
          <HomeIcon className='h-5 w-5' />
        </div>
        <span className='text-lg font-bold tracking-tight'>
          Head <span className='text-primary'>Shakers</span>
        </span>
      </Link>
    </div>
  );
}
