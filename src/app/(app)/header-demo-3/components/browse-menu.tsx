'use client';

import { $path } from 'next-typesafe-url';
import { ChevronDownIcon } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export function BrowseMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='group relative text-sm font-bold uppercase tracking-wide'>
          Browse
          <ChevronDownIcon className='ml-1 h-4 w-4 transition-transform group-data-[state=open]:rotate-180' />
          <span className='absolute bottom-0 left-0 h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-full' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='w-56'>
        <DropdownMenuItem asChild>
          <a href={$path({ route: '/browse' })} className='cursor-pointer font-medium'>
            All Collections
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={$path({ route: '/browse/featured' })} className='cursor-pointer font-medium'>
            Featured
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={$path({ route: '/browse/search' })} className='cursor-pointer font-medium'>
            Search
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={$path({ route: '/browse/categories' })} className='cursor-pointer font-medium'>
            Categories
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
