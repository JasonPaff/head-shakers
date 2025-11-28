'use client';

import { useState } from 'react';
import { SearchIcon, XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SearchIslandProps {
  expanded: boolean;
  onToggle: () => void;
}

export function SearchIsland({ expanded, onToggle }: SearchIslandProps) {
  const [searchValue, setSearchValue] = useState('');

  const handleClear = () => {
    setSearchValue('');
  };

  return (
    <div className='pointer-events-auto absolute right-48 top-0 transition-all duration-300'>
      <div
        className={`flex items-center gap-2 rounded-2xl bg-card shadow-xl ring-1 ring-border/50 transition-all duration-300 ${
          expanded ? 'w-80 px-4 py-2.5' : 'w-12 p-2.5'
        }`}
      >
        {!expanded ?
          <Button
            variant='ghost'
            size='sm'
            onClick={onToggle}
            className='h-7 w-7 p-0 hover:bg-accent'
            aria-label='Open search'
          >
            <SearchIcon className='h-4 w-4' />
          </Button>
        : <>
            <SearchIcon className='h-4 w-4 shrink-0 text-muted-foreground' />
            <Input
              type='search'
              placeholder='Search collections, bobbleheads...'
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className='h-7 flex-1 border-0 bg-transparent px-0 py-0 text-sm focus-visible:ring-0 focus-visible:ring-offset-0'
              autoFocus
            />
            {searchValue && (
              <Button
                variant='ghost'
                size='sm'
                onClick={handleClear}
                className='h-7 w-7 shrink-0 p-0 hover:bg-accent'
                aria-label='Clear search'
              >
                <XIcon className='h-4 w-4' />
              </Button>
            )}
            <Button
              variant='ghost'
              size='sm'
              onClick={onToggle}
              className='h-7 w-7 shrink-0 p-0 hover:bg-accent'
              aria-label='Close search'
            >
              <XIcon className='h-4 w-4' />
            </Button>
          </>
        }
      </div>
    </div>
  );
}
