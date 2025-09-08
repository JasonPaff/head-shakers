import type { Metadata } from 'next';

import { withParamValidation } from 'next-typesafe-url/app/hoc';

import type { PageProps } from '@/app/(app)/users/[userId]/route-type';

import { Route } from '@/app/(app)/users/[userId]/route-type';

type UserPageProps = PageProps;

export function generateMetadata(): Metadata {
  return {
    description: '',
    title: 'User',
  };
}

async function UserPage({ routeParams }: UserPageProps) {
  console.log(await routeParams);
  return <div>User Page</div>;
}

export default withParamValidation(UserPage, Route);
