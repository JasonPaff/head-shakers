'use client';

import { LayoutListIcon, SearchIcon, SquareIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

export type CollectionCardStyle = 'compact' | 'cover' | 'detailed';

type SidebarSearchProps = {
  cardStyle: CollectionCardStyle;
  onCardStyleChange: (style: CollectionCardStyle) => void;
  onSearchChange?: (value: string) => void;
  onSearchClear?: () => void;
  searchValue?: string;
};

export const SidebarSearch = ({
  cardStyle,
  onCardStyleChange,
  onSearchChange,
  onSearchClear,
  searchValue = '',
}: SidebarSearchProps) => {
  const cardStyleLabel = {
    compact: 'Compact View',
    cover: 'Cover View',
    detailed: 'Detailed View',
  };

  const CardStyleIcon = cardStyle === 'cover' ? SquareIcon : LayoutListIcon;

  return (
    <div className={'space-y-2 border-b bg-background/30 p-3 backdrop-blur-sm'} data-slot={'sidebar-search'}>
      <Input
        isClearable
        leftIcon={<SearchIcon className={'size-4'} />}
        onChange={(e) => onSearchChange?.(e.target.value)}
        onClear={onSearchClear}
        placeholder={'Search collections...'}
        value={searchValue}
      />

      {/* Card Style Picker */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className={'w-full justify-between'} size={'sm'} variant={'outline'}>
            <span className={'flex items-center gap-2'}>
              <CardStyleIcon aria-hidden className={'size-4'} />
              <span className={'text-xs'}>{cardStyleLabel[cardStyle]}</span>
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={'start'} className={'w-56'}>
          <DropdownMenuLabel>Card Style</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            onValueChange={(value) => onCardStyleChange(value as CollectionCardStyle)}
            value={cardStyle}
          >
            <DropdownMenuRadioItem value={'compact'}>
              <LayoutListIcon aria-hidden className={'mr-2 size-4'} />
              Compact
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value={'detailed'}>
              <LayoutListIcon aria-hidden className={'mr-2 size-4'} />
              Detailed
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value={'cover'}>
              <SquareIcon aria-hidden className={'mr-2 size-4'} />
              Cover
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
