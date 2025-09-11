'use client';

import type { KeyboardEvent } from 'react';

import { PlusIcon, TagIcon, XIcon } from 'lucide-react';
import { useRef, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Conditional } from '@/components/ui/conditional';
import { Input } from '@/components/ui/input';
import { useToggle } from '@/hooks/use-toggle';
import { cn } from '@/utils/tailwind-utils';

export interface TagData {
  category?: string;
  id: string;
  label: string;
  type: 'custom' | 'system';
}

type TagsInputProps = ClassName<{
  maxTags?: number;
  onTagsChange: (tags: Array<TagData>) => void;
  placeholder?: string;
  selectedTags: Array<TagData>;
  systemTags?: Array<TagData>;
}>;

export const TagsInput = ({
  className,
  maxTags = 10,
  onTagsChange,
  placeholder = 'Add tags...',
  selectedTags,
  systemTags = [],
}: TagsInputProps) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<Array<TagData>>([]);

  const [isInputFocused, setIsInputFocused] = useToggle();

  const inputRef = useRef<HTMLInputElement>(null);

  const updateSuggestions = (value: string) => {
    if (!value.trim()) {
      setSuggestions([]);
      return;
    }

    const filtered = systemTags
      .filter(
        (tag) =>
          tag.label.toLowerCase().includes(value.toLowerCase()) &&
          !selectedTags.some((selected) => selected.id === tag.id),
      )
      .slice(0, 5);

    setSuggestions(filtered);
  };

  const addTag = (tag: TagData) => {
    if (selectedTags.length >= maxTags) return;
    if (selectedTags.some((t) => t.id === tag.id)) return;

    onTagsChange([...selectedTags, tag]);
    setInputValue('');
    setSuggestions([]);
  };

  const handleCreateCustomTag = (label: string) => {
    const trimmedLabel = label.trim();
    if (!trimmedLabel) return;

    // check if a tag already exists
    if (selectedTags.some((tag) => tag.label.toLowerCase() === trimmedLabel.toLowerCase())) {
      return;
    }

    const customTag: TagData = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      label: trimmedLabel,
      type: 'custom',
    };

    addTag(customTag);
  };

  const handleRemoveTag = (tagId: string) => {
    onTagsChange(selectedTags.filter((tag) => tag.id !== tagId));
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    updateSuggestions(value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      if (suggestions.length > 0) {
        // add first suggestion
        addTag(suggestions[0]!);
      } else if (inputValue.trim()) {
        // create custom tag
        handleCreateCustomTag(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && selectedTags.length > 0) {
      // remove the last tag if input is empty
      handleRemoveTag(selectedTags[selectedTags.length - 1]!.id);
    } else if (e.key === 'Escape') {
      setInputValue('');
      setSuggestions([]);
      inputRef.current?.blur();
    }
  };

  const handleSuggestionClick = (tag: TagData) => {
    addTag(tag);
    inputRef.current?.focus();
  };

  const _isShowSuggestions = isInputFocused && suggestions.length > 0;
  const _isCustom = !suggestions.some((s) => s.label.toLowerCase() === inputValue.toLowerCase());
  const _canCreateCustomTag = !!inputValue.trim() && _isCustom;
  const _isDisabled = selectedTags.length >= maxTags;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Selected Tags Display */}
      <div className={'flex min-h-[2.5rem] flex-wrap gap-2 rounded-lg border border-border bg-card p-3'}>
        {selectedTags.map((tag) => (
          <Badge
            className={cn(
              'flex items-center gap-1 px-3 py-1 text-sm font-medium transition-all duration-200',
              tag.type === 'system' ?
                'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'bg-accent text-accent-foreground hover:bg-accent/90',
              'group',
            )}
            key={tag.id}
            variant={tag.type === 'system' ? 'default' : 'secondary'}
          >
            <TagIcon aria-hidden className={'size-3'} />
            {tag.label}
            <button
              aria-label={`Remove ${tag.label} tag`}
              className={'ml-1 rounded-full p-0.5 transition-colors hover:bg-black/20'}
              onClick={() => {
                handleRemoveTag(tag.id);
              }}
            >
              <XIcon aria-hidden className={'size-3'} />
            </button>
          </Badge>
        ))}

        {/* Input Field */}
        <div className={'relative min-w-[120px] flex-1'}>
          <Input
            className={'h-auto border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0'}
            disabled={_isDisabled}
            onBlur={() => {
              setTimeout(() => {
                setIsInputFocused.off();
                setSuggestions([]);
              }, 200);
            }}
            onChange={(e) => {
              handleInputChange(e.target.value);
            }}
            onFocus={setIsInputFocused.on}
            onKeyDown={handleKeyDown}
            placeholder={selectedTags.length === 0 ? placeholder : ''}
            ref={inputRef}
            value={inputValue}
          />

          {/* Suggestions Dropdown */}
          <Conditional isCondition={_isShowSuggestions}>
            <div
              className={cn(
                'absolute top-full right-0 left-0 z-50 mt-1 max-h-48 overflow-y-auto',
                'rounded-md border border-border bg-popover shadow-lg',
              )}
            >
              {suggestions.map((tag) => (
                <button
                  className={cn(
                    'flex w-full items-center gap-2 px-3 py-2 text-left',
                    'transition-colors hover:bg-accent hover:text-accent-foreground',
                  )}
                  key={tag.id}
                  onClick={() => {
                    handleSuggestionClick(tag);
                  }}
                >
                  <TagIcon aria-hidden className={'size-3 text-muted-foreground'} />
                  <span>{tag.label}</span>
                  <Conditional isCondition={!!tag.category}>
                    <span className={'ml-auto text-xs text-muted-foreground'}>{tag.category}</span>
                  </Conditional>
                </button>
              ))}

              {/* Create Custom Tag */}
              <Conditional isCondition={_canCreateCustomTag}>
                <button
                  className={cn(
                    'flex w-full items-center gap-2 border-t',
                    'border-border px-3 py-2 text-left transition-colors',
                    'hover:bg-accent hover:text-accent-foreground',
                  )}
                  onClick={() => {
                    handleCreateCustomTag(inputValue);
                  }}
                >
                  <PlusIcon aria-hidden className={'size-3 text-muted-foreground'} />
                  <span>Create &#34;{inputValue}&#34;</span>
                </button>
              </Conditional>
            </div>
          </Conditional>
        </div>
      </div>

      {/* Tag Count */}
      <div className={'text-xs text-muted-foreground'}>
        {selectedTags.length} / {maxTags} tags
      </div>
    </div>
  );
};
