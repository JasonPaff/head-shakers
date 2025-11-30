import { BoxIcon, PlusIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

type NoBobbleheadsProps = {
  onAddClick?: () => void;
};

export const NoBobbleheads = ({ onAddClick }: NoBobbleheadsProps) => {
  return (
    <div
      className={
        'flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed bg-card p-8 text-center'
      }
      data-slot={'no-bobbleheads'}
    >
      <BoxIcon aria-hidden className={'mb-4 size-12 text-muted-foreground/50'} />
      <h3 className={'mb-2 text-lg font-semibold'}>No Bobbleheads Yet</h3>
      <p className={'mb-4 max-w-sm text-sm text-muted-foreground'}>
        Start building this collection by adding your first bobblehead
      </p>
      <Button onClick={onAddClick}>
        <PlusIcon aria-hidden className={'size-4'} />
        Add Your First Bobblehead
      </Button>
    </div>
  );
};
