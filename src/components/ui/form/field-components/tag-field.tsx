'use client';

import type { ComponentProps, KeyboardEvent } from 'react';

import { useId, useState } from 'react';

import { useFieldContext } from '@/components/ui/form';
import { FieldAria } from '@/components/ui/form/field-components/field-aria';
import { FieldDescription } from '@/components/ui/form/field-components/field-description';
import { FieldError } from '@/components/ui/form/field-components/field-error';
import { FieldItem } from '@/components/ui/form/field-components/field-item';
import { Label } from '@/components/ui/label';
import { TagsInput, TagsInputInput, TagsInputItem, TagsInputList } from '@/components/ui/tags-input';

type TagFieldProps = Omit<ComponentProps<typeof TagsInput>, 'onValueChange' | 'value'> & {
  description?: string;
  isRequired?: boolean;
  label: string;
  placeholder?: string;
};

export const TagField = ({
  description,
  isRequired,
  label,
  placeholder = 'Add a tag...',
  ...props
}: TagFieldProps) => {
  const [inputValue, setInputValue] = useState('');

  const field = useFieldContext<Array<string>>();
  const id = useId();

  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !field.state.value?.includes(trimmedTag)) {
      field.handleChange([...(field.state.value || []), trimmedTag]);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (inputValue.trim()) {
        handleAddTag(inputValue);
      }
    }
  };

  const handleBlur = () => {
    field.handleBlur();
    if (inputValue.trim()) {
      handleAddTag(inputValue);
    }
  };

  return (
    <FieldItem>
      <Label htmlFor={id} variant={isRequired ? 'required' : undefined}>
        {label}
      </Label>
      <FieldAria>
        <TagsInput
          onValueChange={(value) => field.handleChange(value)}
          value={field.state.value || []}
          {...props}
        >
          <TagsInputList>
            {(field.state.value || []).map((tag) => (
              <TagsInputItem key={tag} value={tag}>
                {tag}
              </TagsInputItem>
            ))}
            <TagsInputInput
              id={id}
              onBlur={handleBlur}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              value={inputValue}
            />
          </TagsInputList>
        </TagsInput>
      </FieldAria>
      <FieldError />
      <FieldDescription>{description}</FieldDescription>
    </FieldItem>
  );
};
