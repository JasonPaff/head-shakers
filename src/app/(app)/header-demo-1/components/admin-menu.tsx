'use client';

import { $path } from 'next-typesafe-url';
import Link from 'next/link';
import { ChevronDownIcon, ShieldIcon } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

export function AdminMenu() {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='group gap-1 font-light tracking-wide transition-all hover:tracking-wider hover:text-primary'
        >
          <ShieldIcon className='h-4 w-4' />
          Admin
          <ChevronDownIcon
            className={`h-3 w-3 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-56 animate-in fade-in slide-in-from-top-2 duration-200'>
        <DropdownMenuItem asChild>
          <Link
            href={$path({ route: '/admin/featured-content' })}
            className='cursor-pointer font-light tracking-wide transition-all hover:tracking-wider'
          >
            Featured Content
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href={$path({ route: '/admin/analytics' })}
            className='cursor-pointer font-light tracking-wide transition-all hover:tracking-wider'
          >
            Analytics
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href={$path({ route: '/admin/launch-notifications' })}
            className='cursor-pointer font-light tracking-wide transition-all hover:tracking-wider'
          >
            Launch Notifications
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            href={$path({ route: '/admin/reports' })}
            className='cursor-pointer font-light tracking-wide transition-all hover:tracking-wider'
          >
            Reports
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href={$path({ route: '/admin/users' })}
            className='cursor-pointer font-light tracking-wide transition-all hover:tracking-wider'
          >
            Users
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
