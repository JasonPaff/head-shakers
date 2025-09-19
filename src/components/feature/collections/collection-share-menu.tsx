'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type CollectionShareMenuProps = Children;

export function CollectionShareMenu({ children }: CollectionShareMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align={'end'}>
        <DropdownMenuItem>Copy Link</DropdownMenuItem>
        <DropdownMenuItem>Share on X</DropdownMenuItem>
        <DropdownMenuItem>Share on Facebook</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
