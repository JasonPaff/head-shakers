'use client';

import { AlertCircle, CheckCircle2, Lightbulb, ListChecks } from 'lucide-react';

import { Conditional } from '@/components/ui/conditional';

interface RefinementInsightsProps {
  assumptions?: Array<string> | null;
  focus?: null | string;
  keyRequirements?: Array<string> | null;
  risks?: Array<string> | null;
}

export const RefinementInsights = ({
  assumptions,
  focus,
  keyRequirements,
  risks,
}: RefinementInsightsProps) => {
  const hasAnyInsights = focus || keyRequirements?.length || assumptions?.length || risks?.length;

  if (!hasAnyInsights) {
    return null;
  }

  return (
    <div className={'space-y-3 rounded-lg border bg-muted/30 p-4'}>
      {/* Focus Area */}
      <Conditional isCondition={!!focus}>
        <div className={'space-y-1'}>
          <div className={'flex items-center gap-2 text-sm font-medium'}>
            <Lightbulb aria-hidden className={'size-4 text-blue-500'} />
            Focus Area
          </div>
          <p className={'pl-6 text-sm text-muted-foreground'}>{focus}</p>
        </div>
      </Conditional>

      {/* Key Requirements */}
      <Conditional isCondition={!!(keyRequirements && keyRequirements.length > 0)}>
        <div className={'space-y-2'}>
          <div className={'flex items-center gap-2 text-sm font-medium'}>
            <ListChecks aria-hidden className={'size-4 text-green-600'} />
            Key Requirements ({keyRequirements?.length})
          </div>
          <ul className={'space-y-1 pl-6'}>
            {keyRequirements?.map((req, index) => (
              <li className={'flex gap-2 text-sm text-muted-foreground'} key={index}>
                <CheckCircle2 aria-hidden className={'size-4 shrink-0 text-green-600'} />
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </div>
      </Conditional>

      {/* Assumptions */}
      <Conditional isCondition={!!(assumptions && assumptions.length > 0)}>
        <div className={'space-y-2'}>
          <div className={'flex items-center gap-2 text-sm font-medium'}>
            <Lightbulb aria-hidden className={'size-4 text-amber-500'} />
            Assumptions ({assumptions?.length})
          </div>
          <ul className={'space-y-1 pl-6'}>
            {assumptions?.map((assumption, index) => (
              <li className={'text-sm text-muted-foreground'} key={index}>
                • {assumption}
              </li>
            ))}
          </ul>
        </div>
      </Conditional>

      {/* Risks */}
      <Conditional isCondition={!!(risks && risks.length > 0)}>
        <div className={'space-y-2'}>
          <div className={'flex items-center gap-2 text-sm font-medium'}>
            <AlertCircle aria-hidden className={'size-4 text-red-500'} />
            Potential Risks ({risks?.length})
          </div>
          <ul className={'space-y-1 pl-6'}>
            {risks?.map((risk, index) => (
              <li className={'flex gap-2 text-sm text-muted-foreground'} key={index}>
                <AlertCircle aria-hidden className={'size-4 shrink-0 text-red-500'} />
                <span>{risk}</span>
              </li>
            ))}
          </ul>
        </div>
      </Conditional>
    </div>
  );
};
