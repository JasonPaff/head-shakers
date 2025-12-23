'use client';

import type { ChangeEvent, ComponentProps, ReactElement } from 'react';

import { XIcon } from 'lucide-react';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { Button } from '@/components/ui/button';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

import { Conditional } from './conditional';

export type InputProps = ComponentProps<'input'> &
  ComponentTestIdProps & {
    isClearable?: boolean;
    leftIcon?: ReactElement;
    onClear?: () => void;
  };

export const Input = ({
  className,
  isClearable,
  leftIcon,
  onClear,
  ref,
  testId,
  type,
  ...props
}: InputProps) => {
  const handleInputClear = () => {
    props.onChange?.({ target: { value: '' } } as ChangeEvent<HTMLInputElement>);
    onClear?.();
  };

  const inputTestId = testId || generateTestId('ui', 'input');
  const clearButtonTestId = generateTestId('ui', 'button', 'clear');

  const _hasLeftIcon = !!leftIcon;
  const _hasClearButton = isClearable && !!props.value;

  return (
    <div className={'relative'}>
      {/* Input */}
      <input
        className={cn(
          'flex h-9 w-full min-w-0 rounded-sm border border-input bg-transparent',
          'px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none',
          'selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
          'placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed',
          'disabled:opacity-50 md:text-sm dark:bg-input/30',
          'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
          'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
          'dark:aria-invalid:ring-destructive/40',
          _hasLeftIcon ? 'pl-8' : '',
          className,
        )}
        data-slot={'input'}
        data-testid={inputTestId}
        ref={ref}
        type={type}
        {...props}
      />

      {/* Left Icon */}
      <Conditional isCondition={_hasLeftIcon}>
        <div className={'pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground'}>
          {leftIcon}
        </div>
      </Conditional>

      {/* Clear Button */}
      <Conditional isCondition={_hasClearButton}>
        <Button
          className={'absolute top-1/2 right-2 size-6 -translate-y-1/2'}
          onClick={handleInputClear}
          size={'icon'}
          testId={clearButtonTestId}
          variant={'ghost'}
        >
          <XIcon aria-hidden aria-label={'clear input'} className={'size-4.5'} />
        </Button>
      </Conditional>
    </div>
  );
};
