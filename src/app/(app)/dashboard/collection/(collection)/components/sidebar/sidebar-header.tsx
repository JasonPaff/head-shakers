import { PlusIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

type SidebarHeaderProps = {
  onCreateClick?: () => void;
};

export const SidebarHeader = ({ onCreateClick }: SidebarHeaderProps) => {
  return (
    <div
      className={'flex items-center justify-between border-b bg-background/50 p-4 backdrop-blur-md'}
      data-slot={'sidebar-header'}
    >
      <h2
        className={
          'bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-lg font-bold text-transparent'
        }
      >
        Collections
      </h2>
      <Button onClick={onCreateClick} size={'sm'}>
        <PlusIcon aria-hidden className={'size-4'} />
        New
      </Button>
    </div>
  );
};
