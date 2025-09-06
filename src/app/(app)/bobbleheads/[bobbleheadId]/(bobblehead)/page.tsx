import type { Metadata } from 'next';

import { withParamValidation } from 'next-typesafe-url/app/hoc';

import type { PageProps } from '@/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/route-type';

import { Bobblehead } from '@/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/components/bobblehead';
import { Route } from '@/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/route-type';

type ItemPageProps = PageProps;

export function generateMetadata(): Metadata {
  return {
    description: '',
    title: 'Bobblehead Details',
  };
}

async function ItemPage({ routeParams }: ItemPageProps) {
  const { bobbleheadId } = await routeParams;

  return <Bobblehead bobbleheadId={bobbleheadId} />;
}

export default withParamValidation(ItemPage, Route);
