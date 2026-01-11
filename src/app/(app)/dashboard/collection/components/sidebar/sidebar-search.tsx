import {
  ArrowDownAZIcon,
  ArrowUpAZIcon,
  ArrowUpDownIcon,
  EyeIcon,
  LayoutListIcon,
  SearchIcon,
  SquareIcon,
} from 'lucide-react';

import type { CollectionSortOption } from '@/hooks/use-user-preferences';

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
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export type CollectionCardStyle = 'compact' | 'cover' | 'detailed';

type SidebarSearchProps = {
  cardStyle: CollectionCardStyle;
  isDisabled?: boolean;
  isHoverCardEnabled: boolean;
  onCardStyleChange: (style: CollectionCardStyle) => void;
  onHoverCardToggle: () => void;
  onSearchChange?: (value: string) => void;
  onSearchClear?: () => void;
  onSortChange: (sort: CollectionSortOption) => void;
  searchValue?: string;
  sortOption: CollectionSortOption;
};

export const SidebarSearch = ({
  cardStyle,
  isDisabled = false,
  isHoverCardEnabled,
  onCardStyleChange,
  onHoverCardToggle,
  onSearchChange,
  onSearchClear,
  onSortChange,
  searchValue = '',
  sortOption,
}: SidebarSearchProps) => {
  const cardStyleLabel = {
    compact: 'Compact View',
    cover: 'Cover View',
    detailed: 'Detailed View',
  };

  const sortOptionLabel: Record<CollectionSortOption, string> = {
    'comments-desc': 'Comments (High to Low)',
    'count-asc': 'Item Count (Low to High)',
    'count-desc': 'Item Count (High to Low)',
    'likes-desc': 'Likes (High to Low)',
    'name-asc': 'Name (A-Z)',
    'name-desc': 'Name (Z-A)',
    'value-asc': 'Total Value (Low to High)',
    'value-desc': 'Total Value (High to Low)',
    'views-desc': 'Views (High to Low)',
  };

  const SortIcon =
    sortOption.startsWith('name') ?
      sortOption === 'name-asc' ?
        ArrowDownAZIcon
      : ArrowUpAZIcon
    : ArrowUpDownIcon;
  const CardStyleIcon = cardStyle === 'cover' ? SquareIcon : LayoutListIcon;

  return (
    <div className={'space-y-2 border-b bg-background/30 p-3 backdrop-blur-sm'} data-slot={'sidebar-search'}>
      <Input
        disabled={isDisabled}
        isClearable
        leftIcon={<SearchIcon aria-hidden className={'size-4'} />}
        onChange={(e) => {
          onSearchChange?.(e.target.value);
        }}
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
            onValueChange={(value) => {
              onCardStyleChange(value as CollectionCardStyle);
            }}
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

      {/* Sort Picker */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className={'w-full justify-between'} size={'sm'} variant={'outline'}>
            <span className={'flex items-center gap-2'}>
              <SortIcon aria-hidden className={'size-4'} />
              <span className={'text-xs'}>{sortOptionLabel[sortOption]}</span>
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={'start'} className={'w-56'}>
          <DropdownMenuLabel>Sort By</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            onValueChange={(value) => {
              onSortChange(value as CollectionSortOption);
            }}
            value={sortOption}
          >
            <DropdownMenuRadioItem value={'name-asc'}>
              <ArrowDownAZIcon aria-hidden className={'mr-2 size-4'} />
              Name (A-Z)
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value={'name-desc'}>
              <ArrowUpAZIcon aria-hidden className={'mr-2 size-4'} />
              Name (Z-A)
            </DropdownMenuRadioItem>
            <DropdownMenuSeparator />
            <DropdownMenuRadioItem value={'count-desc'}>Item Count (High to Low)</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value={'count-asc'}>Item Count (Low to High)</DropdownMenuRadioItem>
            <DropdownMenuSeparator />
            <DropdownMenuRadioItem value={'value-desc'}>Total Value (High to Low)</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value={'value-asc'}>Total Value (Low to High)</DropdownMenuRadioItem>
            <DropdownMenuSeparator />
            <DropdownMenuRadioItem value={'likes-desc'}>Likes (High to Low)</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value={'views-desc'}>Views (High to Low)</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value={'comments-desc'}>Comments (High to Low)</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Hover Card Toggle */}
      <div className={'flex items-center justify-between rounded-md border bg-background/50 px-3 py-2'}>
        <Label
          className={'flex cursor-pointer items-center gap-2 text-xs'}
          htmlFor={'collection-hovercard-toggle'}
        >
          <EyeIcon aria-hidden className={'size-4 text-muted-foreground'} />
          Quick preview on hover
        </Label>
        <Switch
          checked={isHoverCardEnabled}
          id={'collection-hovercard-toggle'}
          onCheckedChange={onHoverCardToggle}
        />
      </div>
    </div>
  );
};
