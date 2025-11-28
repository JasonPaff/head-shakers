'use client';

import { $path } from 'next-typesafe-url';
import { ChevronDownIcon } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export function CollectionMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='group relative text-sm font-bold uppercase tracking-wide'>
          Collection
          <ChevronDownIcon className='ml-1 h-4 w-4 transition-transform group-data-[state=open]:rotate-180' />
          <span className='absolute bottom-0 left-0 h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-full' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='w-56'>
        <DropdownMenuItem asChild>
          <a href={$path({ route: '/dashboard/collection' })} className='cursor-pointer font-medium'>
            Dashboard
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={$path({ route: '/bobbleheads/add' })} className='cursor-pointer font-medium'>
            Add Bobblehead
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={$path({ route: '/dashboard/collection' })} className='cursor-pointer font-medium'>
            My Collections
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href={$path({ route: '/settings/data/import' })} className='cursor-pointer font-medium'>
            Import Data
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={$path({ route: '/settings' })} className='cursor-pointer font-medium'>
            Settings
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
