import type { BobbleheadsFacade } from '@/lib/facades/bobbleheads-facade';

export type BobbleheadWithCollections = NonNullable<
  Awaited<ReturnType<typeof BobbleheadsFacade.getBobbleheadWithRelations>>
>;
