'use client';

interface ValidationError {
  message: string;
}

interface ValidationErrorsDisplayProps {
  errors: Array<ValidationError>;
}

export const ValidationErrorsDisplay = ({ errors }: ValidationErrorsDisplayProps) => {
  if (!errors || errors.length === 0) {
    return null;
  }

  return (
    <div className={'rounded-lg border border-yellow-200 bg-yellow-50 p-3'}>
      <p className={'text-sm font-medium text-yellow-900'}>Validation Issues:</p>
      <ul className={'mt-1 list-inside list-disc text-sm text-yellow-800'}>
        {errors.map((error, index) => (
          <li key={index}>{error.message}</li>
        ))}
      </ul>
    </div>
  );
};
