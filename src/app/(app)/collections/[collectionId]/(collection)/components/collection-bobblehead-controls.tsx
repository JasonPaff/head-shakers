'use client';

import { parseAsString, parseAsStringEnum, useQueryStates } from 'nuqs';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/utils/tailwind-utils';

const viewOptions = ['all', 'collection'] as const;
const sortOptions = ['newest', 'oldest', 'name_asc', 'name_desc'] as const;

export function CollectionBobbleheadControls() {
  const [{ q, sort, view }, setParams] = useQueryStates({
    q: parseAsString.withDefault(''),
    sort: parseAsStringEnum([...sortOptions]).withDefault('newest'),
    view: parseAsStringEnum([...viewOptions]).withDefault('collection'),
  });

  const handleViewChange = (newView: 'all' | 'collection') => {
    void setParams({ view: newView });
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchQuery = formData.get('q') as string;
    const sortValue = formData.get('sort') as typeof sortOptions[number];

    void setParams({
      q: searchQuery || null,
      sort: sortValue || 'newest'
    });
  };

  return (
    <div className={"space-y-4"}>
      {/* View Toggle */}
      <div className={"flex gap-2"}>
        <button
          className={cn(
            'inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
            view === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          )}
          onClick={() => handleViewChange('all')}
        >
          All Bobbleheads
        </button>
        <button
          className={cn(
            'inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
            view === 'collection'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          )}
          onClick={() => handleViewChange('collection')}
        >
          In Collection Only
        </button>
      </div>

      {/* Search/Sort Form */}
      <form className={"flex flex-col gap-4 sm:flex-row sm:items-end"} onSubmit={handleSearchSubmit}>
        <div className={"flex-1"}>
          <Input
            className={"w-full"}
            defaultValue={q}
            name={"q"}
            placeholder={"Search bobbleheads..."}
            type={"search"}
          />
        </div>

        <div className={"min-w-[200px]"}>
          <Select defaultValue={sort} name={"sort"}>
            <SelectTrigger>
              <SelectValue placeholder={"Sort by..."} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={"newest"}>Date Added (Newest)</SelectItem>
              <SelectItem value={"oldest"}>Date Added (Oldest)</SelectItem>
              <SelectItem value={"name_asc"}>Name (A-Z)</SelectItem>
              <SelectItem value={"name_desc"}>Name (Z-A)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button type={"submit"}>Apply Filters</Button>
      </form>
    </div>
  );
}