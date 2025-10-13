import { FeaturePlannerClient } from '@/app/(app)/feature-planner/components/feature-planner-client';
import { FeaturePlannerFacade } from '@/lib/facades/feature-planner/feature-planner.facade';
import { getUserId } from '@/utils/user-utils';

export default async function FeaturePlannerPage() {
  const userId = await getUserId();
  const agents = await FeaturePlannerFacade.getAvailableAgentsAsync(userId);

  return <FeaturePlannerClient agents={agents} />;
}
