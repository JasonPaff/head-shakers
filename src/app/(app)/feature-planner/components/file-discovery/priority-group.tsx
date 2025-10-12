'use client';

import { ChevronDown, ChevronRight } from 'lucide-react';
import { useCallback, useState } from 'react';

import { DiscoveredFileItem } from '@/app/(app)/feature-planner/components/file-discovery/discovered-file-item';
import { ManualFileItem } from '@/app/(app)/feature-planner/components/file-discovery/manual-file-item';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';

type BadgeVariant = 'default' | 'destructive' | 'outline' | 'secondary';

interface DiscoveredFile {
  description?: null | string;
  filePath: string;
  integrationPoint?: null | string;
  isFileExists?: boolean;
  priority: 'critical' | 'high' | 'low' | 'medium';
  reasoning?: null | string;
  relevanceScore: number;
  role?: null | string;
}

interface ManualFile {
  description: string;
  filePath: string;
  priority: 'critical' | 'high' | 'low' | 'medium';
}

interface PriorityGroupProps {
  files: Array<DiscoveredFile>;
  label: string;
  manualFiles: Array<ManualFile>;
  onRemoveManualFile?: (filePath: string) => void;
  onSelectFiles: (fileKeys: Array<string>) => void;
  selectedFiles: Array<string>;
  variant: BadgeVariant;
}

export const PriorityGroup = ({
  files,
  label,
  manualFiles,
  onRemoveManualFile,
  onSelectFiles,
  selectedFiles,
  variant,
}: PriorityGroupProps) => {
  // useState hooks
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Utility functions
  const getFileKeys = useCallback((): Array<string> => {
    const discoveredKeys = files.map((file, index) => `${file.filePath}-${index}`);
    const manualKeys = manualFiles.map((file) => `manual-${file.filePath}`);
    return [...discoveredKeys, ...manualKeys];
  }, [files, manualFiles]);

  // Event handlers
  const handleToggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  const handleSelectGroup = useCallback(() => {
    const groupKeys = getFileKeys();
    const newSelection = [...new Set([...groupKeys, ...selectedFiles])];
    onSelectFiles(newSelection);
  }, [getFileKeys, selectedFiles, onSelectFiles]);

  const handleDeselectGroup = useCallback(() => {
    const groupKeys = getFileKeys();
    const newSelection = selectedFiles.filter((key) => !groupKeys.includes(key));
    onSelectFiles(newSelection);
  }, [getFileKeys, selectedFiles, onSelectFiles]);

  const handleFileToggle = useCallback(
    (fileKey: string, checked: boolean) => {
      const newSelection =
        checked ? [...selectedFiles, fileKey] : selectedFiles.filter((id) => id !== fileKey);
      onSelectFiles(newSelection);
    },
    [selectedFiles, onSelectFiles],
  );

  const handleManualFileRemove = useCallback(
    (filePath: string) => {
      if (onRemoveManualFile) {
        onRemoveManualFile(filePath);
      }
    },
    [onRemoveManualFile],
  );

  // Derived variables
  const _totalFiles = files.length + manualFiles.length;
  const _groupFileKeys = getFileKeys();
  const _isGroupAllSelected = _groupFileKeys.every((key) => selectedFiles.includes(key));

  if (_totalFiles === 0) {
    return null;
  }

  return (
    <div className={'space-y-2'}>
      {/* Group Header */}
      <div className={'flex items-center justify-between'}>
        <div className={'flex items-center gap-2'}>
          {/* Collapse Toggle */}
          <button
            className={'text-muted-foreground transition-colors hover:text-foreground'}
            onClick={handleToggleCollapse}
            type={'button'}
          >
            {isCollapsed ?
              <ChevronRight className={'size-5'} />
            : <ChevronDown className={'size-5'} />}
          </button>

          {/* Priority Label */}
          <h4 className={'font-medium'}>{label} Priority</h4>

          {/* File Count Badge */}
          <Badge variant={variant}>
            {_totalFiles} file{_totalFiles !== 1 ? 's' : ''}
          </Badge>

          {/* Manual Count Badge */}
          <Conditional isCondition={manualFiles.length > 0}>
            <Badge variant={'outline'}>{manualFiles.length} manual</Badge>
          </Conditional>
        </div>

        {/* Group Selection Button */}
        <Conditional isCondition={!isCollapsed}>
          <Button
            onClick={_isGroupAllSelected ? handleDeselectGroup : handleSelectGroup}
            size={'sm'}
            variant={'ghost'}
          >
            {_isGroupAllSelected ? 'Deselect Group' : 'Select Group'}
          </Button>
        </Conditional>
      </div>

      {/* File List */}
      <Conditional isCondition={!isCollapsed}>
        <div className={'space-y-2 pl-7'}>
          {/* Discovered Files */}
          {files.map((file, index) => {
            const fileKey = `${file.filePath}-${index}`;
            const isSelected = selectedFiles.includes(fileKey);

            return (
              <DiscoveredFileItem
                file={file}
                isSelected={isSelected}
                key={fileKey}
                onToggleSelection={(checked) => {
                  handleFileToggle(fileKey, checked);
                }}
              />
            );
          })}

          {/* Manual Files */}
          {manualFiles.map((file) => {
            const fileKey = `manual-${file.filePath}`;
            const isSelected = selectedFiles.includes(fileKey);

            return (
              <ManualFileItem
                file={file}
                isSelected={isSelected}
                key={fileKey}
                onRemove={() => {
                  handleManualFileRemove(file.filePath);
                }}
                onToggleSelection={(checked) => {
                  handleFileToggle(fileKey, checked);
                }}
              />
            );
          })}
        </div>
      </Conditional>
    </div>
  );
};
