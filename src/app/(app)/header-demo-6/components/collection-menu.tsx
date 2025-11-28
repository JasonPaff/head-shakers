'use client';

import { useState } from 'react';
import { $path } from 'next-typesafe-url';
import { ChevronDownIcon } from 'lucide-react';

export function CollectionMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className='relative'>
      <button
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className='flex h-12 items-center gap-2 rounded-lg border-4 border-slate-900 bg-amber-100 px-4 font-black uppercase text-slate-900 shadow-[4px_4px_0_0_theme(colors.slate.900)] transition-all hover:shadow-[6px_6px_0_0_theme(colors.slate.900)] xl:px-6'
      >
        Collection
        <ChevronDownIcon className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className='absolute left-0 top-full mt-2 w-56 rounded-lg border-4 border-slate-900 bg-amber-100 shadow-[8px_8px_0_0_theme(colors.slate.900)]'
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className='p-2 space-y-1'>
            <a
              href={$path({ route: '/dashboard/collection' })}
              className='block rounded-lg border-2 border-transparent p-3 font-bold text-slate-900 transition-all hover:border-slate-900 hover:bg-amber-200 hover:shadow-[2px_2px_0_0_theme(colors.slate.900)]'
            >
              Dashboard
            </a>
            <a
              href={$path({ route: '/bobbleheads/add' })}
              className='block rounded-lg border-2 border-transparent p-3 font-bold text-slate-900 transition-all hover:border-slate-900 hover:bg-amber-200 hover:shadow-[2px_2px_0_0_theme(colors.slate.900)]'
            >
              Add Bobblehead
            </a>
            <a
              href={$path({ route: '/dashboard/collection' })}
              className='block rounded-lg border-2 border-transparent p-3 font-bold text-slate-900 transition-all hover:border-slate-900 hover:bg-amber-200 hover:shadow-[2px_2px_0_0_theme(colors.slate.900)]'
            >
              My Collections
            </a>
            <a
              href={$path({ route: '/settings/data/import' })}
              className='block rounded-lg border-2 border-transparent p-3 font-bold text-slate-900 transition-all hover:border-slate-900 hover:bg-amber-200 hover:shadow-[2px_2px_0_0_theme(colors.slate.900)]'
            >
              Import Data
            </a>
            <a
              href={$path({ route: '/settings' })}
              className='block rounded-lg border-2 border-transparent p-3 font-bold text-slate-900 transition-all hover:border-slate-900 hover:bg-amber-200 hover:shadow-[2px_2px_0_0_theme(colors.slate.900)]'
            >
              Settings
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
