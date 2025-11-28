'use client';

import { useState } from 'react';
import { $path } from 'next-typesafe-url';
import { ChevronDownIcon } from 'lucide-react';

export function AdminMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className='relative'>
      <button
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className='flex h-12 items-center gap-2 rounded-lg border-4 border-slate-900 bg-pink-400 px-4 font-black uppercase text-slate-900 shadow-[4px_4px_0_0_theme(colors.slate.900)] transition-all hover:shadow-[6px_6px_0_0_theme(colors.slate.900)] xl:px-6'
      >
        Admin
        <ChevronDownIcon className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className='absolute left-0 top-full mt-2 w-64 rounded-lg border-4 border-slate-900 bg-pink-400 shadow-[8px_8px_0_0_theme(colors.slate.900)]'
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className='p-2 space-y-1'>
            <a
              href={$path({ route: '/admin/featured-content' })}
              className='block rounded-lg border-2 border-transparent p-3 font-bold text-slate-900 transition-all hover:border-slate-900 hover:bg-pink-300 hover:shadow-[2px_2px_0_0_theme(colors.slate.900)]'
            >
              Featured Content
            </a>
            <a
              href={$path({ route: '/admin/analytics' })}
              className='block rounded-lg border-2 border-transparent p-3 font-bold text-slate-900 transition-all hover:border-slate-900 hover:bg-pink-300 hover:shadow-[2px_2px_0_0_theme(colors.slate.900)]'
            >
              Analytics
            </a>
            <a
              href={$path({ route: '/admin/launch-notifications' })}
              className='block rounded-lg border-2 border-transparent p-3 font-bold text-slate-900 transition-all hover:border-slate-900 hover:bg-pink-300 hover:shadow-[2px_2px_0_0_theme(colors.slate.900)]'
            >
              Launch Notifications
            </a>
            <a
              href={$path({ route: '/admin/reports' })}
              className='block rounded-lg border-2 border-transparent p-3 font-bold text-slate-900 transition-all hover:border-slate-900 hover:bg-pink-300 hover:shadow-[2px_2px_0_0_theme(colors.slate.900)]'
            >
              Reports
            </a>
            <a
              href={$path({ route: '/admin/users' })}
              className='block rounded-lg border-2 border-transparent p-3 font-bold text-slate-900 transition-all hover:border-slate-900 hover:bg-pink-300 hover:shadow-[2px_2px_0_0_theme(colors.slate.900)]'
            >
              Users
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
