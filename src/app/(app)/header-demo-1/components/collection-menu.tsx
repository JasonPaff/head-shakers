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
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

export function CollectionMenu() {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='group gap-1 font-light tracking-wide transition-all hover:tracking-wider hover:text-primary'
        >
          Collection
          <ChevronDownIcon
            className={`h-3 w-3 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='w-48 animate-in fade-in slide-in-from-top-2 duration-200'>
        <DropdownMenuItem asChild>
          <Link
            href={$path({ route: '/dashboard/collection' })}
            className='cursor-pointer font-light tracking-wide transition-all hover:tracking-wider'
          >
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href={$path({ route: '/bobbleheads/add' })}
            className='cursor-pointer font-light tracking-wide transition-all hover:tracking-wider'
          >
            Add Bobblehead
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href={$path({ route: '/dashboard/collection' })}
            className='cursor-pointer font-light tracking-wide transition-all hover:tracking-wider'
          >
            My Collections
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            href={$path({ route: '/settings/data/import' })}
            className='cursor-pointer font-light tracking-wide transition-all hover:tracking-wider'
          >
            Import Data
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href={$path({ route: '/settings' })}
            className='cursor-pointer font-light tracking-wide transition-all hover:tracking-wider'
          >
            Settings
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
