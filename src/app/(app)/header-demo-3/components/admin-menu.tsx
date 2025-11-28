'use client';

import { $path } from 'next-typesafe-url';
import { ChevronDownIcon, ShieldIcon } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export function AdminMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='group relative text-sm font-bold uppercase tracking-wide text-primary hover:text-primary'
        >
          <ShieldIcon className='mr-2 h-4 w-4' />
          Admin
          <ChevronDownIcon className='ml-1 h-4 w-4 transition-transform group-data-[state=open]:rotate-180' />
          <span className='absolute bottom-0 left-0 h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-full' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='w-56'>
        <DropdownMenuItem asChild>
          <a href={$path({ route: '/admin/featured-content' })} className='cursor-pointer font-medium'>
            Featured Content
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={$path({ route: '/admin/analytics' })} className='cursor-pointer font-medium'>
            Analytics
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={$path({ route: '/admin/launch-notifications' })} className='cursor-pointer font-medium'>
            Launch Notifications
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={$path({ route: '/admin/reports' })} className='cursor-pointer font-medium'>
            Reports
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={$path({ route: '/admin/users' })} className='cursor-pointer font-medium'>
            Users
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
