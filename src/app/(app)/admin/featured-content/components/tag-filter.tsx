'use client';

import type { CSSProperties } from 'react';

import { XIcon } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Conditional } from '@/components/ui/conditional';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Tag {
  color: string;
  id: string;
  name: string;
}

interface TagFilterProps {
  excludeTags: Array<string>;
  includeTags: Array<string>;
  onExcludeTagsChange: (tagIds: Array<string>) => void;
  onIncludeTagsChange: (tagIds: Array<string>) => void;
  onTagSuggestionRequest?: (query: string) => Promise<Array<Tag>>;
}

export const TagFilter = ({
  excludeTags,
  includeTags,
  onExcludeTagsChange,
  onIncludeTagsChange,
  onTagSuggestionRequest,
}: TagFilterProps) => {
  const [includeTagInput, setIncludeTagInput] = useState('');
  const [excludeTagInput, setExcludeTagInput] = useState('');
  const [includeSuggestions, setIncludeSuggestions] = useState<Array<Tag>>([]);
  const [excludeSuggestions, setExcludeSuggestions] = useState<Array<Tag>>([]);

  const handleIncludeTagSearch = async (query: string) => {
    setIncludeTagInput(query);
    if (onTagSuggestionRequest && query.trim().length >= 2) {
      try {
        const suggestions = await onTagSuggestionRequest(query);
        setIncludeSuggestions(suggestions.filter((tag) => !includeTags.includes(tag.id)));
      } catch {
        setIncludeSuggestions([]);
      }
    } else {
      setIncludeSuggestions([]);
    }
  };

  const handleExcludeTagSearch = async (query: string) => {
    setExcludeTagInput(query);
    if (onTagSuggestionRequest && query.trim().length >= 2) {
      try {
        const suggestions = await onTagSuggestionRequest(query);
        setExcludeSuggestions(suggestions.filter((tag) => !excludeTags.includes(tag.id)));
      } catch {
        setExcludeSuggestions([]);
      }
    } else {
      setExcludeSuggestions([]);
    }
  };

  const addIncludeTag = (tag: Tag) => {
    if (!includeTags.includes(tag.id)) {
      onIncludeTagsChange([...includeTags, tag.id]);
    }
    setIncludeTagInput('');
    setIncludeSuggestions([]);
  };

  const addExcludeTag = (tag: Tag) => {
    if (!excludeTags.includes(tag.id)) {
      onExcludeTagsChange([...excludeTags, tag.id]);
    }
    setExcludeTagInput('');
    setExcludeSuggestions([]);
  };

  const removeIncludeTag = (tagId: string) => {
    onIncludeTagsChange(includeTags.filter((id) => id !== tagId));
  };

  const removeExcludeTag = (tagId: string) => {
    onExcludeTagsChange(excludeTags.filter((id) => id !== tagId));
  };

  const handleClearAllFilters = () => {
    onIncludeTagsChange([]);
    onExcludeTagsChange([]);
    setIncludeTagInput('');
    setExcludeTagInput('');
    setIncludeSuggestions([]);
    setExcludeSuggestions([]);
  };

  const hasAnyFilters = includeTags.length > 0 || excludeTags.length > 0;

  return (
    <Card>
      <CardHeader>
        <div className={'flex items-center justify-between'}>
          <CardTitle className={'text-sm font-medium'}>Tag Filters (Optional)</CardTitle>
          <Conditional isCondition={hasAnyFilters}>
            <Button onClick={handleClearAllFilters} size={'sm'} variant={'ghost'}>
              Clear All
            </Button>
          </Conditional>
        </div>
      </CardHeader>
      <CardContent className={'space-y-4'}>
        {/* Include Tags */}
        <div className={'space-y-2'}>
          <Label className={'text-xs font-medium text-muted-foreground'}>
            Include Tags (content must have ALL of these tags)
          </Label>

          <Conditional isCondition={includeTags.length > 0}>
            <div className={'flex flex-wrap gap-1'}>
              {includeTags.map((tagId) => (
                <Badge key={tagId} variant={'default'}>
                  Tag {tagId.slice(0, 8)}
                  <Button
                    className={'ml-1 h-3 w-3 p-0'}
                    onClick={() => {
                      removeIncludeTag(tagId);
                    }}
                    variant={'ghost'}
                  >
                    <XIcon aria-hidden className={'size-2'} />
                  </Button>
                </Badge>
              ))}
            </div>
          </Conditional>

          <div className={'relative'}>
            <Input
              onChange={(e) => {
                void handleIncludeTagSearch(e.target.value);
              }}
              placeholder={'Search tags to include...'}
              value={includeTagInput}
            />
            <Conditional isCondition={includeSuggestions.length > 0}>
              <div
                className={
                  'absolute top-full right-0 left-0 z-10 mt-1 max-h-40 overflow-y-auto rounded-md border bg-background shadow-lg'
                }
              >
                {includeSuggestions.map((tag) => (
                  <button
                    className={'w-full px-3 py-2 text-left text-sm hover:bg-muted'}
                    key={tag.id}
                    onClick={() => {
                      addIncludeTag(tag);
                    }}
                    type={'button'}
                  >
                    <Badge
                      className={'text-white'}
                      style={
                        {
                          '--tag-color': tag.color,
                          backgroundColor: 'var(--tag-color)',
                        } as CSSProperties
                      }
                      variant={'secondary'}
                    >
                      {tag.name}
                    </Badge>
                  </button>
                ))}
              </div>
            </Conditional>
          </div>
        </div>

        {/* Exclude Tags */}
        <div className={'space-y-2'}>
          <Label className={'text-xs font-medium text-muted-foreground'}>
            Exclude Tags (content must NOT have any of these tags)
          </Label>

          <Conditional isCondition={excludeTags.length > 0}>
            <div className={'flex flex-wrap gap-1'}>
              {excludeTags.map((tagId) => (
                <Badge key={tagId} variant={'destructive'}>
                  Tag {tagId.slice(0, 8)}
                  <Button
                    className={'ml-1 h-3 w-3 p-0'}
                    onClick={() => {
                      removeExcludeTag(tagId);
                    }}
                    variant={'ghost'}
                  >
                    <XIcon aria-hidden className={'size-2'} />
                  </Button>
                </Badge>
              ))}
            </div>
          </Conditional>

          <div className={'relative'}>
            <Input
              onChange={(e) => {
                void handleExcludeTagSearch(e.target.value);
              }}
              placeholder={'Search tags to exclude...'}
              value={excludeTagInput}
            />
            <Conditional isCondition={excludeSuggestions.length > 0}>
              <div
                className={
                  'absolute top-full right-0 left-0 z-10 mt-1 max-h-40 overflow-y-auto rounded-md border bg-background shadow-lg'
                }
              >
                {excludeSuggestions.map((tag) => (
                  <button
                    className={'w-full px-3 py-2 text-left text-sm hover:bg-muted'}
                    key={tag.id}
                    onClick={() => {
                      addExcludeTag(tag);
                    }}
                    type={'button'}
                  >
                    <Badge
                      className={'text-white'}
                      style={
                        {
                          '--tag-color': tag.color,
                          backgroundColor: 'var(--tag-color)',
                        } as CSSProperties
                      }
                      variant={'secondary'}
                    >
                      {tag.name}
                    </Badge>
                  </button>
                ))}
              </div>
            </Conditional>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
