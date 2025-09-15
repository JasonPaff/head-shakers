'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type SubcollectionShareMenuProps = Children;

export function SubcollectionShareMenu({ children }: SubcollectionShareMenuProps) {
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