import type { Metadata } from 'next';

import { withParamValidation } from 'next-typesafe-url/app/hoc';

import type { PageProps } from '@/app/(app)/browse/categories/[category]/route-type';

import { Route } from '@/app/(app)/browse/categories/[category]/route-type';
type CategoryPageProps = PageProps;

export function generateMetadata(): Metadata {
  return {
    description: '',
    title: 'Category',
  };
}

export default withParamValidation(CategoryPage, Route);

async function CategoryPage({ routeParams }: CategoryPageProps) {
  const { category } = await routeParams;

  return <div>Category Page - {category}</div>;
}
