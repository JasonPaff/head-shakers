'use client';

import type { ChangeEvent, ComponentProps } from 'react';

import { SearchIcon, XIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/utils/tailwind-utils';

import { Conditional } from './conditional';

type InputProps = ComponentProps<'input'> & {
  isClearable?: boolean;
  isSearch?: boolean;
  onClear?: () => void;
};

export const Input = ({ className, isClearable, isSearch, onClear, type, ...props }: InputProps) => {
  const handleInputClear = () => {
    props.onChange?.({ target: { value: '' } } as ChangeEvent<HTMLInputElement>);
    onClear?.();
  };

  return (
    <div className={'relative'}>
      {/* Input */}
      <input
        className={cn(
          'flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent',
          'px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none',
          'selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
          'placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed',
          'disabled:opacity-50 md:text-sm dark:bg-input/30',
          'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
          'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
          'dark:aria-invalid:ring-destructive/40',
          isSearch ? 'pl-8' : '',
          className,
        )}
        data-slot={'input'}
        type={type}
        {...props}
      />

      {/* Search Icon */}
      <Conditional isCondition={isSearch}>
        <SearchIcon
          aria-hidden
          className={'absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground'}
        />
      </Conditional>

      {/* Clear Button */}
      <Conditional isCondition={isClearable && !!props.value}>
        <Button
          className={'absolute top-1/2 right-2 size-6 -translate-y-1/2'}
          onClick={handleInputClear}
          size={'icon'}
          variant={'ghost'}
        >
          <XIcon aria-hidden aria-label={'clear input'} className={'size-4.5'} />
        </Button>
      </Conditional>
    </div>
  );
};
