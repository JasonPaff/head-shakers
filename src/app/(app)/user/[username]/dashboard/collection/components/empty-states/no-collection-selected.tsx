import { LayersIcon } from 'lucide-react';

/**
 * Displayed in the main content area when user has no collections.
 * The sidebar already shows NoCollections with a create button,
 * so this is a simpler message for the main panel.
 */
export const NoCollectionSelected = () => {
  return (
    <div
      className={
        'flex h-full min-h-100 w-full flex-col items-center justify-center rounded-lg border border-dashed bg-card p-8 text-center'
      }
      data-slot={'no-collection-selected'}
    >
      <LayersIcon aria-hidden className={'mb-4 size-12 text-muted-foreground/50'} />
      <h3 className={'mb-2 text-lg font-semibold'}>No Collection Selected</h3>
      <p className={'max-w-sm text-sm text-muted-foreground'}>
        Create your first collection using the sidebar to get started
      </p>
    </div>
  );
};
