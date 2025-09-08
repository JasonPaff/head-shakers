'use client';

import type { FormEvent } from 'react';

import { XIcon } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToggle } from '@/hooks/use-toggle';

interface FeaturedContentFormProps {
  contentId?: null | string;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  contentId: string;
  contentType: 'bobblehead' | 'collection' | 'user';
  description: string;
  featureType: 'collection_of_week' | 'editor_pick' | 'homepage_banner' | 'trending';
  priority: number;
  title: string;
}

// mock content search data - would come from API
const mockContent = {
  bobblehead: [
    { id: '1', name: 'Vintage Mickey Mouse Bobblehead', owner: 'john_collector' },
    { id: '2', name: 'Baseball Legend Series #1', owner: 'sports_fan' },
  ],
  collection: [
    { id: '3', name: 'Baseball Legends Collection', owner: 'john_collector' },
    { id: '4', name: 'Disney Characters Complete Set', owner: 'disney_lover' },
  ],
  user: [
    { id: '5', name: 'John Collector', username: 'john_collector' },
    { id: '6', name: 'Sports Fan', username: 'sports_fan' },
  ],
};

export const FeaturedContentForm = ({ contentId, onClose, onSuccess }: FeaturedContentFormProps) => {
  const [isSubmitting, setIsSubmitting] = useToggle();
  const [formData, setFormData] = useState<FormData>({
    contentId: '',
    contentType: 'collection',
    description: '',
    featureType: 'editor_pick',
    priority: 0,
    title: '',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting.on();

    try {
      console.log('Form data:', formData);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      onSuccess();
    } catch (error) {
      console.error('Failed to save featured content:', error);
    } finally {
      setIsSubmitting.off();
    }
  };

  const getContentOptions = (contentType: string) => {
    return mockContent[contentType as keyof typeof mockContent] || [];
  };

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <div className={'flex items-center justify-between'}>
          <CardTitle>{contentId ? 'Edit Featured Content' : 'Create Featured Content'}</CardTitle>
          <Button onClick={onClose} size={'sm'} variant={'ghost'}>
            <XIcon aria-hidden className={'size-4'} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form
          className={'space-y-6'}
          onSubmit={(e) => {
            void handleSubmit(e);
          }}
        >
          {/* Basic Information */}
          <div className={'space-y-4'}>
            <div className={'grid grid-cols-2 gap-4'}>
              <div>
                <Label htmlFor={'contentType'}>Content Type</Label>
                <Select
                  onValueChange={(value) => {
                    updateField('contentType', value as FormData['contentType']);
                    updateField('contentId', ''); // Reset content selection
                  }}
                  value={formData.contentType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={'Select content type'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={'collection'}>Collection</SelectItem>
                    <SelectItem value={'bobblehead'}>Bobblehead</SelectItem>
                    <SelectItem value={'user'}>User</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor={'featureType'}>Feature Type</Label>
                <Select
                  onValueChange={(value) => {
                    updateField('featureType', value as FormData['featureType']);
                  }}
                  value={formData.featureType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={'Select feature type'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={'homepage_banner'}>Homepage Banner</SelectItem>
                    <SelectItem value={'collection_of_week'}>Collection of Week</SelectItem>
                    <SelectItem value={'trending'}>Trending</SelectItem>
                    <SelectItem value={'editor_pick'}>Editor Pick</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Content Selection */}
            <div>
              <Label htmlFor={'contentId'}>Select Content</Label>
              <Select
                onValueChange={(value) => {
                  updateField('contentId', value);
                }}
                value={formData.contentId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${formData.contentType} to feature`} />
                </SelectTrigger>
                <SelectContent>
                  {getContentOptions(formData.contentType).map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Title and Description */}
            <div>
              <Label htmlFor={'title'}>Title</Label>
              <Input
                id={'title'}
                onChange={(e) => {
                  updateField('title', e.target.value);
                }}
                placeholder={'Enter feature title'}
                value={formData.title}
              />
            </div>

            <div>
              <Label htmlFor={'description'}>Description</Label>
              <Textarea
                id={'description'}
                onChange={(e) => {
                  updateField('description', e.target.value);
                }}
                placeholder={'Enter feature description'}
                rows={3}
                value={formData.description}
              />
            </div>
          </div>

          {/* Advanced Settings */}
          <div className={'space-y-4'}>
            <h3 className={'font-semibold'}>Advanced Settings</h3>

            <div>
              <Label htmlFor={'priority'}>Priority (0-100)</Label>
              <Input
                id={'priority'}
                max={'100'}
                min={'0'}
                onChange={(e) => {
                  updateField('priority', parseInt(e.target.value) || 0);
                }}
                type={'number'}
                value={formData.priority}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className={'flex justify-end gap-3'}>
            <Button onClick={onClose} type={'button'} variant={'outline'}>
              Cancel
            </Button>
            <Button disabled={isSubmitting} type={'submit'}>
              {isSubmitting ?
                'Saving...'
              : contentId ?
                'Update Feature'
              : 'Create Feature'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
