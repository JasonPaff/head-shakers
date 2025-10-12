/**
 * Determines the Tailwind CSS color class based on complexity level
 */
export const getComplexityColor = (complexity: null | string): string => {
  switch (complexity) {
    case 'complex':
      return 'text-orange-600';
    case 'moderate':
      return 'text-yellow-600';
    case 'simple':
      return 'text-green-600';
    case 'very-complex':
      return 'text-red-600';
    default:
      return 'text-muted-foreground';
  }
};

/**
 * Determines the Tailwind CSS color class based on risk level
 */
export const getRiskLevelColor = (riskLevel: null | string): string => {
  switch (riskLevel) {
    case 'critical':
      return 'text-red-600';
    case 'high':
      return 'text-orange-600';
    case 'low':
      return 'text-green-600';
    case 'medium':
      return 'text-yellow-600';
    default:
      return 'text-muted-foreground';
  }
};
