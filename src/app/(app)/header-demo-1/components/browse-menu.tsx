'use client';

import { $path } from 'next-typesafe-url';
import Link from 'next/link';
import { ChevronDownIcon } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function BrowseMenu() {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='group gap-1 font-light tracking-wide transition-all hover:tracking-wider hover:text-primary'
        >
          Browse
          <ChevronDownIcon
            className={`h-3 w-3 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='w-48 animate-in fade-in slide-in-from-top-2 duration-200'>
        <DropdownMenuItem asChild>
          <Link
            href={$path({ route: '/browse' })}
            className='cursor-pointer font-light tracking-wide transition-all hover:tracking-wider'
          >
            Collections
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href={$path({ route: '/browse/featured' })}
            className='cursor-pointer font-light tracking-wide transition-all hover:tracking-wider'
          >
            Featured
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href={$path({ route: '/browse/search' })}
            className='cursor-pointer font-light tracking-wide transition-all hover:tracking-wider'
          >
            Search
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href={$path({ route: '/browse/categories' })}
            className='cursor-pointer font-light tracking-wide transition-all hover:tracking-wider'
          >
            Categories
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
