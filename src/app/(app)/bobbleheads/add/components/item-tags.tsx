/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import { Tag } from 'lucide-react';
import { useState } from 'react';

import type { TagData } from '@/components/ui/tags';

import { addItemFormOptions } from '@/app/(app)/bobbleheads/add/components/add-item-form-options';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { withForm } from '@/components/ui/form';
import { TagsInput } from '@/components/ui/tags';
import {} from '@/lib/validations/bobbleheads.validation';

const SYSTEM_TAGS: TagData[] = [
  { category: 'Sports', id: 'sport-baseball', label: 'Baseball', type: 'system' },
  { category: 'Sports', id: 'sport-football', label: 'Football', type: 'system' },
  { category: 'Sports', id: 'sport-basketball', label: 'Basketball', type: 'system' },
  { category: 'Sports', id: 'sport-hockey', label: 'Hockey', type: 'system' },
  { category: 'Teams', id: 'team-yankees', label: 'New York Yankees', type: 'system' },
  { category: 'Teams', id: 'team-dodgers', label: 'Los Angeles Dodgers', type: 'system' },
  { category: 'Teams', id: 'team-patriots', label: 'New England Patriots', type: 'system' },
  { category: 'Era', id: 'era-vintage', label: 'Vintage', type: 'system' },
  { category: 'Era', id: 'era-modern', label: 'Modern', type: 'system' },
  { category: 'Era', id: 'era-retro', label: 'Retro', type: 'system' },
  { category: 'Condition', id: 'condition-mint', label: 'Mint Condition', type: 'system' },
  { category: 'Condition', id: 'condition-excellent', label: 'Excellent', type: 'system' },
  { category: 'Condition', id: 'condition-good', label: 'Good', type: 'system' },
  { category: 'Material', id: 'material-resin', label: 'Resin', type: 'system' },
  { category: 'Material', id: 'material-ceramic', label: 'Ceramic', type: 'system' },
  { category: 'Material', id: 'material-plastic', label: 'Plastic', type: 'system' },
  { category: 'Size', id: 'size-mini', label: 'Mini', type: 'system' },
  { category: 'Size', id: 'size-standard', label: 'Standard', type: 'system' },
  { category: 'Size', id: 'size-jumbo', label: 'Jumbo', type: 'system' },
  { category: 'Special', id: 'special-limited', label: 'Limited Edition', type: 'system' },
  { category: 'Special', id: 'special-signed', label: 'Autographed', type: 'system' },
  { category: 'Special', id: 'special-rare', label: 'Rare', type: 'system' },
];

export const ItemTags = withForm({
  ...addItemFormOptions,
  render: () => {
    const [selectedTags, setSelectedTags] = useState<Array<TagData>>([]);

    return (
      <Card>
        <CardHeader>
          <CardTitle className={'flex items-center gap-2'}>
            <Tag aria-hidden className={'size-5'} />
            Tags
          </CardTitle>
          <CardDescription>Add custom tags to organize and categorize your bobblehead</CardDescription>
        </CardHeader>
        <CardContent className={'space-y-4'}>
          <TagsInput
            maxTags={10}
            onTagsChange={setSelectedTags}
            placeholder={'Type to search system tags or create custom ones...'}
            selectedTags={selectedTags}
            systemTags={SYSTEM_TAGS}
          />
        </CardContent>
      </Card>
    );
  },
});
