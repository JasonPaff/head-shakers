'use client';

import { UserIcon } from 'lucide-react';
import { $path } from 'next-typesafe-url';

import { CollectionListItem } from '@/components/layout/app-header/components/app-header-link-item';
import { NavigationMenuContent, NavigationMenuItem, NavigationMenuTrigger } from '@/components/ui/navigation-menu';

export const AppHeaderMyCollection = () => {
  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger>
        <UserIcon className={'mr-2 h-4 w-4'} />
        My Collection
      </NavigationMenuTrigger>
      <NavigationMenuContent>
        <ul className={'grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]'}>
          <CollectionListItem href={$path({ route: '/dashboard' })} title={'Dashboard'}>
            Overview of your collection and recent activity
          </CollectionListItem>
          <CollectionListItem href={$path({ route: '/dashboard/collection' })} title={'My Bobbleheads'}>
            View and manage your complete collection
          </CollectionListItem>
          <CollectionListItem href={$path({ route: '/items/add' })} title={'Add New Item'}>
            Add a new bobblehead to your collection
          </CollectionListItem>
          <CollectionListItem href={$path({ route: '/dashboard/collection/organize' })} title={'Organize'}>
            Create sub-collections and manage tags
          </CollectionListItem>
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
};
