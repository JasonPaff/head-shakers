'use client';

import type { KeyboardEvent } from 'react';

import { CheckIcon, ChevronsUpDownIcon, PlusIcon } from 'lucide-react';
import { useEffect } from 'react';
import { useRef } from 'react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Conditional } from '@/components/ui/conditional';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToggle } from '@/hooks/use-toggle';
import { cn } from '@/utils/tailwind-utils';

interface ComboboxItem {
  id: string;
  name: string;
}

interface ComboboxProps {
  createNewLabel?: string;
  isDisabled?: boolean;
  isRequired?: boolean;
  items: Array<ComboboxItem>;
  label: string;
  onCreateNew?: (name: string) => void;
  onCreateNewSelect?: (name: string) => void;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  triggerClassName?: string;
  value?: string;
}

export const Combobox = ({
  createNewLabel = 'New item name',
  isDisabled,
  isRequired = false,
  items,
  label,
  onCreateNew,
  onCreateNewSelect,
  onValueChange,
  placeholder = 'Select an item...',
  searchPlaceholder = 'Search items...',
  triggerClassName,
  value,
}: ComboboxProps) => {
  const [isOpen, setIsOpen] = useToggle();
  const [isShowCreateNew, setIsShowCreateNew] = useToggle(false);
  const [newCollectionName, setNewCollectionName] = useState('');

  const createNewInputRef = useRef<HTMLInputElement>(null);

  const selectedCollection = useMemo(
    () => items.find((collection) => collection.id === value),
    [items, value],
  );

  // focus the input when showing the create new item section
  useEffect(() => {
    if (!isShowCreateNew) return;
    if (!createNewInputRef.current) return;
    createNewInputRef.current.focus();
  }, [isShowCreateNew]);

  const handleCancel = () => {
    setNewCollectionName('');
    setIsShowCreateNew.off();
  };

  const handleCreateNew = () => {
    if (newCollectionName.trim()) {
      onCreateNew?.(newCollectionName.trim());
      setNewCollectionName('');
      setIsShowCreateNew.off();
      setIsOpen.off();
    }
  };

  const handleCreateNewSelect = () => {
    if (onCreateNewSelect) {
      onCreateNewSelect?.(newCollectionName.trim());
      return;
    } else {
      setIsShowCreateNew.on();
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && newCollectionName.trim()) {
      e.preventDefault();
      handleCreateNew();
    }
    if (e.key === 'Escape') {
      setIsShowCreateNew.off();
      setNewCollectionName('');
    }
  };

  return (
    <div className={'space-y-2'}>
      <Label variant={isRequired ? 'required' : undefined}>{label}</Label>
      <Popover onOpenChange={setIsOpen.update} open={isOpen}>
        <PopoverTrigger asChild>
          <Button
            aria-expanded={isOpen}
            className={cn('w-full justify-between', triggerClassName)}
            disabled={isDisabled}
            role={'combobox'}
            variant={'outline'}
          >
            {selectedCollection ? selectedCollection.name : placeholder}
            <ChevronsUpDownIcon aria-hidden className={'ml-2 size-4 shrink-0 opacity-50'} />
          </Button>
        </PopoverTrigger>
        <PopoverContent align={'start'} className={'w-full p-0'}>
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>No items found.</CommandEmpty>
              <CommandGroup>
                <CommandItem className={'text-primary'} onSelect={handleCreateNewSelect}>
                  <PlusIcon aria-hidden className={'mr-2 size-4'} />
                  {createNewLabel}
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup>
                {items.map((collection) => (
                  <CommandItem
                    key={collection.id}
                    onSelect={() => {
                      onValueChange(collection.id === value ? '' : collection.id);
                      setIsOpen.off();
                    }}
                    value={collection.name}
                  >
                    <CheckIcon
                      aria-hidden
                      className={cn('mr-2 size-4', value === collection.id ? 'opacity-100' : 'opacity-0')}
                    />
                    {collection.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>

          {/* Create New Item */}
          <Conditional isCondition={isShowCreateNew}>
            <div className={'space-y-3 border-t p-3'}>
              <Label className={'text-sm font-medium'}>{createNewLabel}</Label>
              <Input
                onChange={(e) => {
                  setNewCollectionName(e.target.value);
                }}
                onKeyDown={handleKeyDown}
                placeholder={'Enter collection name...'}
                ref={createNewInputRef}
                value={newCollectionName}
              />
              <div className={'flex gap-2'}>
                <Button
                  className={'flex-1'}
                  disabled={!newCollectionName.trim()}
                  onClick={handleCreateNew}
                  size={'sm'}
                >
                  Create
                </Button>
                <Button className={'flex-1'} onClick={handleCancel} size={'sm'} variant={'outline'}>
                  Cancel
                </Button>
              </div>
            </div>
          </Conditional>
        </PopoverContent>
      </Popover>
    </div>
  );
};
