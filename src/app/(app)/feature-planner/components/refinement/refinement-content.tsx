'use client';

import { Fragment } from 'react';

import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';
import { Textarea } from '@/components/ui/textarea';

interface RefinementContentProps {
  isEditing: boolean;
  onEditToggle: () => void;
  onReset: () => void;
  onTextChange: (text: string) => void;
  text: string;
}

export const RefinementContent = ({
  isEditing,
  onEditToggle,
  onReset,
  onTextChange,
  text,
}: RefinementContentProps) => {
  return (
    <div className={'space-y-2'}>
      {/* Editing Mode */}
      <Conditional
        fallback={
          <div className={'rounded-lg border bg-muted/50 p-4'}>
            <p className={'text-sm leading-relaxed whitespace-pre-wrap'}>{text}</p>
          </div>
        }
        isCondition={isEditing}
      >
        <Fragment>
          <Textarea
            className={'min-h-[200px] font-mono text-sm'}
            onChange={(e) => {
              onTextChange(e.target.value);
            }}
            placeholder={'Enter refined request...'}
            value={text}
          />
          <div className={'flex gap-2'}>
            <Button onClick={onEditToggle} size={'sm'} variant={'outline'}>
              Done Editing
            </Button>
            <Button onClick={onReset} size={'sm'} variant={'ghost'}>
              Reset
            </Button>
          </div>
        </Fragment>
      </Conditional>
    </div>
  );
};
