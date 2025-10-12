'use client';

interface PriorityStatsGridProps {
  criticalCount: number;
  highCount: number;
  lowCount: number;
  manualCriticalCount: number;
  manualHighCount: number;
  manualLowCount: number;
  manualMediumCount: number;
  mediumCount: number;
}

export const PriorityStatsGrid = ({
  criticalCount,
  highCount,
  lowCount,
  manualCriticalCount,
  manualHighCount,
  manualLowCount,
  manualMediumCount,
  mediumCount,
}: PriorityStatsGridProps) => {
  return (
    <div className={'grid grid-cols-4 gap-4'}>
      {/* Critical Priority */}
      <div className={'rounded-lg border bg-red-50 p-3'}>
        <p className={'text-sm font-medium text-red-900'}>Critical</p>
        <p className={'text-2xl font-bold text-red-600'}>
          {criticalCount}
          {manualCriticalCount > 0 && <span className={'text-sm'}> +{manualCriticalCount}</span>}
        </p>
      </div>

      {/* High Priority */}
      <div className={'rounded-lg border bg-orange-50 p-3'}>
        <p className={'text-sm font-medium text-orange-900'}>High</p>
        <p className={'text-2xl font-bold text-orange-600'}>
          {highCount}
          {manualHighCount > 0 && <span className={'text-sm'}> +{manualHighCount}</span>}
        </p>
      </div>

      {/* Medium Priority */}
      <div className={'rounded-lg border bg-yellow-50 p-3'}>
        <p className={'text-sm font-medium text-yellow-900'}>Medium</p>
        <p className={'text-2xl font-bold text-yellow-600'}>
          {mediumCount}
          {manualMediumCount > 0 && <span className={'text-sm'}> +{manualMediumCount}</span>}
        </p>
      </div>

      {/* Low Priority */}
      <div className={'rounded-lg border bg-gray-50 p-3'}>
        <p className={'text-sm font-medium text-gray-900'}>Low</p>
        <p className={'text-2xl font-bold text-gray-600'}>
          {lowCount}
          {manualLowCount > 0 && <span className={'text-sm'}> +{manualLowCount}</span>}
        </p>
      </div>
    </div>
  );
};
