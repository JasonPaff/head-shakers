'use client';

import { CheckCircle2, Edit2 } from 'lucide-react';
import { Fragment, useCallback } from 'react';

import type { FeatureRefinement } from '@/lib/db/schema/feature-planner.schema';

import { RefinementContent } from '@/app/(app)/feature-planner/components/refinement/refinement-content';
import { RefinementMetadata } from '@/app/(app)/feature-planner/components/refinement/refinement-metadata';
import { ValidationErrorsDisplay } from '@/app/(app)/feature-planner/components/refinement/validation-errors-display';
import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';
import { useToggle } from '@/hooks/use-toggle';
import { cn } from '@/utils/tailwind-utils';

interface RefinementCardProps {
  editedTexts: Record<string, string>;
  isSelectingRefinement: boolean;
  onEditedTextChange: (refinementId: string, text: string) => void;
  onProceedToNextStep?: () => void;
  onResetEdit: (refinementId: string) => void;
  onSelectRefinement?: (refinementId: string, refinedRequest: string) => void;
  refinement: FeatureRefinement;
  selectedRefinementId?: string;
}

export const RefinementCard = ({
  editedTexts,
  isSelectingRefinement,
  onEditedTextChange,
  onProceedToNextStep,
  onResetEdit,
  onSelectRefinement,
  refinement,
  selectedRefinementId,
}: RefinementCardProps) => {
  // useState hooks
  const [isEditing, setIsEditing] = useToggle();

  // Utility functions
  const getCurrentText = useCallback((): string => {
    return editedTexts[refinement.id] || refinement.refinedRequest || '';
  }, [editedTexts, refinement.id, refinement.refinedRequest]);

  // Event handlers
  const handleEditToggle = useCallback(() => {
    if (!isEditing && !editedTexts[refinement.id]) {
      onEditedTextChange(refinement.id, refinement.refinedRequest || '');
    }
    setIsEditing.toggle();
  }, [isEditing, editedTexts, refinement.id, refinement.refinedRequest, setIsEditing, onEditedTextChange]);

  const handleReset = useCallback(() => {
    onResetEdit(refinement.id);
    setIsEditing.off();
  }, [onResetEdit, refinement.id, setIsEditing]);

  const handleSelect = useCallback(() => {
    const currentText = getCurrentText();
    if (currentText && onSelectRefinement) {
      onSelectRefinement(refinement.id, currentText);
    }
  }, [getCurrentText, onSelectRefinement, refinement.id]);

  const handleTextChange = useCallback(
    (text: string) => {
      onEditedTextChange(refinement.id, text);
    },
    [refinement.id, onEditedTextChange],
  );

  // Derived variables
  const _isSelected = selectedRefinementId === refinement.id;
  const _isEdited = !!editedTexts[refinement.id];
  const _hasValidationErrors =
    refinement.validationErrors && (refinement.validationErrors as Array<{ message: string }>).length > 0;
  const _currentText = getCurrentText();

  return (
    <div className={'space-y-4'}>
      {/* Metadata Section */}
      <RefinementMetadata
        executionTimeMs={refinement.executionTimeMs}
        isEdited={_isEdited}
        isSelected={_isSelected}
        totalTokens={refinement.totalTokens}
        wordCount={refinement.wordCount}
      />

      {/* Content Section */}
      <RefinementContent
        isEditing={isEditing}
        onEditToggle={handleEditToggle}
        onReset={handleReset}
        onTextChange={handleTextChange}
        text={_currentText}
      />

      {/* Validation Errors Section */}
      <Conditional isCondition={_hasValidationErrors}>
        <ValidationErrorsDisplay errors={refinement.validationErrors as Array<{ message: string }>} />
      </Conditional>

      {/* Action Buttons Section */}
      <div className={'flex gap-2'}>
        <Conditional isCondition={!isEditing}>
          <Button onClick={handleEditToggle} size={'sm'} variant={'outline'}>
            <Edit2 aria-hidden className={'mr-1 size-4'} />
            Edit
          </Button>
        </Conditional>

        <Conditional isCondition={_isSelected && !isEditing && !!onProceedToNextStep}>
          <Button disabled={isSelectingRefinement} onClick={onProceedToNextStep} size={'sm'}>
            Proceed to File Discovery →
          </Button>
        </Conditional>

        <Conditional isCondition={!_isSelected && !!onSelectRefinement}>
          <Button
            className={cn(_isSelected && 'bg-green-600 hover:bg-green-700')}
            disabled={isEditing || isSelectingRefinement}
            onClick={handleSelect}
            size={'sm'}
          >
            <Conditional fallback={'Selecting...'} isCondition={!isSelectingRefinement}>
              <Conditional fallback={'Use This Refinement'} isCondition={_isSelected}>
                <Fragment>
                  <CheckCircle2 aria-hidden className={'mr-1 size-4'} />
                  Selected
                </Fragment>
              </Conditional>
            </Conditional>
          </Button>
        </Conditional>
      </div>
    </div>
  );
};
