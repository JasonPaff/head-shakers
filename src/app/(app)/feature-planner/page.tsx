import type { Metadata } from 'next';

import { FeaturePlannerForm } from '@/app/(app)/feature-planner/components/feature-planner-form';
import { PageContent } from '@/components/layout/page-content';

export default function FeaturePlannerPage() {
  return (
    <PageContent>
      {/* Header */}
      <div className={'mb-8'}>
        <h1 className={'text-3xl font-bold'}>Feature Planner</h1>
        <p className={'mt-2 text-muted-foreground'}>
          Enter a feature description to generate a detailed implementation plan with real-time AI progress
          updates
        </p>
      </div>

      {/* Feature Planning Form */}
      <FeaturePlannerForm />
    </PageContent>
  );
}

export function generateMetadata(): Metadata {
  return {
    description: 'Generate implementation plans for new features',
    title: 'Feature Planner',
  };
}
