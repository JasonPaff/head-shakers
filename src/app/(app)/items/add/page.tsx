/* eslint-disable react-snob/no-inline-styles,jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */
'use client';

import type React from 'react';

import { format } from 'date-fns';
import { CalendarIcon, Plus, Tag, Trash2, Upload, X } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/utils/tailwind-utils';

const conditionOptions = ['mint', 'near-mint', 'excellent', 'very-good', 'good', 'fair', 'poor'];

const statusOptions = ['active', 'inactive', 'pending', 'archived'];

const mockCollections = [
  { id: '1', name: 'Sports Collection' },
  { id: '2', name: 'Movie Characters' },
  { id: '3', name: 'Historical Figures' },
];

const mockSubCollections = {
  '1': [
    { id: '1-1', name: 'Baseball Players' },
    { id: '1-2', name: 'Football Players' },
  ],
  '2': [
    { id: '2-1', name: 'Marvel Heroes' },
    { id: '2-2', name: 'Disney Characters' },
  ],
  '3': [
    { id: '3-1', name: 'Presidents' },
    { id: '3-2', name: 'Scientists' },
  ],
};

const tagColors = [
  '#dc2626',
  '#ea580c',
  '#d97706',
  '#ca8a04',
  '#65a30d',
  '#16a34a',
  '#059669',
  '#0891b2',
  '#0284c7',
  '#2563eb',
  '#7c3aed',
  '#9333ea',
  '#c026d3',
  '#db2777',
  '#e11d48',
];

export default function AddItemPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    acquisitionDate: undefined as Date | undefined,
    acquisitionMethod: '',
    category: '',
    characterName: '',
    collectionId: '',
    currentCondition: 'excellent',
    description: '',
    height: '',
    isFeatured: false,
    isPublic: true,
    manufacturer: '',
    material: '',
    name: '',
    purchaseLocation: '',
    purchasePrice: '',
    series: '',
    status: 'active',
    subCollectionId: '',
    weight: '',
    year: '',
  });

  const [photos, setPhotos] = useState<File[]>([]);
  const [tags, setTags] = useState<Array<{ color: string; name: string }>>([]);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(tagColors[0]);

  const [customFields, setCustomFields] = useState<Array<{ key: string; value: string }>>([]);

  const handleInputChange = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCollectionChange = (collectionId: string) => {
    setFormData((prev) => ({ ...prev, collectionId, subCollectionId: '' }));
  };

  const handleAddTag = () => {
    if (newTagName.trim() && !tags.some((tag) => tag.name.toLowerCase() === newTagName.toLowerCase())) {
      // @ts-expect-error ignore
      setTags((prev) => [...prev, { color: newTagColor, name: newTagName.trim() }]);
      setNewTagName('');
      setNewTagColor(tagColors[Math.floor(Math.random() * tagColors.length)]);
    }
  };

  const removeTag = (index: number) => {
    setTags((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddCustomField = () => {
    setCustomFields((prev) => [...prev, { key: '', value: '' }]);
  };

  const updateCustomField = (index: number, field: 'key' | 'value', value: string) => {
    setCustomFields((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const removeCustomField = (index: number) => {
    setCustomFields((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setPhotos((prev) => [...prev, ...files]);
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submissionData = {
      ...formData,
      customFields: customFields.reduce(
        (acc, field) => {
          if (field.key.trim() && field.value.trim()) {
            acc[field.key.trim()] = field.value.trim();
          }
          return acc;
        },
        {} as Record<string, string>,
      ),
      tags,
    };
    console.log('Form data:', submissionData);
    console.log('Photos:', photos);
    router.push($path({ route: '/dashboard' }));
  };

  const availableSubCollections =
    formData.collectionId ?
      mockSubCollections[formData.collectionId as keyof typeof mockSubCollections] || []
    : [];

  return (
    <div className={'min-h-screen bg-background p-6'}>
      <div className={'mx-auto max-w-4xl space-y-6'}>
        {/* Header */}
        <div className={'flex items-center justify-between'}>
          <div>
            <h1 className={'text-3xl font-bold text-foreground'}>Add New Bobblehead</h1>
            <p className={'text-muted-foreground'}>Add a new bobblehead to your collection</p>
          </div>
          <Button
            onClick={() => {
              router.back();
            }}
            variant={'outline'}
          >
            Cancel
          </Button>
        </div>

        <form className={'space-y-6'} onSubmit={handleSubmit}>
          {/* Collection Assignment */}
          <Card>
            <CardHeader>
              <CardTitle>Collection Assignment</CardTitle>
              <CardDescription>Choose which collection this bobblehead belongs to</CardDescription>
            </CardHeader>
            <CardContent className={'space-y-4'}>
              <div className={'grid grid-cols-1 gap-4 md:grid-cols-2'}>
                <div className={'space-y-2'}>
                  <Label htmlFor={'collectionId'}>Collection *</Label>
                  <Select onValueChange={handleCollectionChange} required value={formData.collectionId}>
                    <SelectTrigger>
                      <SelectValue placeholder={'Select a collection'} />
                    </SelectTrigger>
                    <SelectContent>
                      {mockCollections.map((collection) => (
                        <SelectItem key={collection.id} value={collection.id}>
                          {collection.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className={'space-y-2'}>
                  <Label htmlFor={'subCollectionId'}>Sub-Collection</Label>
                  <Select
                    disabled={!formData.collectionId}
                    onValueChange={(value) => handleInputChange('subCollectionId', value)}
                    value={formData.subCollectionId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={'Select a sub-collection'} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSubCollections.map((subCollection) => (
                        <SelectItem key={subCollection.id} value={subCollection.id}>
                          {subCollection.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Essential details about your bobblehead</CardDescription>
            </CardHeader>
            <CardContent className={'space-y-4'}>
              <div className={'grid grid-cols-1 gap-4 md:grid-cols-2'}>
                <div className={'space-y-2'}>
                  <Label htmlFor={'name'}>Name *</Label>
                  <Input
                    id={'name'}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder={'Enter bobblehead name'}
                    required
                    value={formData.name}
                  />
                </div>
                <div className={'space-y-2'}>
                  <Label htmlFor={'characterName'}>Character Name</Label>
                  <Input
                    id={'characterName'}
                    onChange={(e) => handleInputChange('characterName', e.target.value)}
                    placeholder={'Character or person name'}
                    value={formData.characterName}
                  />
                </div>
              </div>

              <div className={'space-y-2'}>
                <Label htmlFor={'description'}>Description</Label>
                <Textarea
                  id={'description'}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder={'Describe your bobblehead...'}
                  rows={3}
                  value={formData.description}
                />
              </div>

              <div className={'grid grid-cols-1 gap-4 md:grid-cols-3'}>
                <div className={'space-y-2'}>
                  <Label htmlFor={'category'}>Category</Label>
                  <Input
                    id={'category'}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    placeholder={'Sports, Movies, etc.'}
                    value={formData.category}
                  />
                </div>
                <div className={'space-y-2'}>
                  <Label htmlFor={'series'}>Series</Label>
                  <Input
                    id={'series'}
                    onChange={(e) => handleInputChange('series', e.target.value)}
                    placeholder={'Series name'}
                    value={formData.series}
                  />
                </div>
                <div className={'space-y-2'}>
                  <Label htmlFor={'year'}>Year</Label>
                  <Input
                    id={'year'}
                    max={new Date().getFullYear() + 1}
                    min={'1800'}
                    onChange={(e) => handleInputChange('year', e.target.value)}
                    placeholder={'Release year'}
                    type={'number'}
                    value={formData.year}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Physical Attributes */}
          <Card>
            <CardHeader>
              <CardTitle>Physical Attributes</CardTitle>
              <CardDescription>Physical characteristics and condition</CardDescription>
            </CardHeader>
            <CardContent className={'space-y-4'}>
              <div className={'grid grid-cols-1 gap-4 md:grid-cols-3'}>
                <div className={'space-y-2'}>
                  <Label htmlFor={'height'}>Height (inches)</Label>
                  <Input
                    id={'height'}
                    onChange={(e) => handleInputChange('height', e.target.value)}
                    placeholder={'7.5'}
                    step={'0.01'}
                    type={'number'}
                    value={formData.height}
                  />
                </div>
                <div className={'space-y-2'}>
                  <Label htmlFor={'weight'}>Weight (oz)</Label>
                  <Input
                    id={'weight'}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    placeholder={'8.2'}
                    step={'0.01'}
                    type={'number'}
                    value={formData.weight}
                  />
                </div>
                <div className={'space-y-2'}>
                  <Label htmlFor={'material'}>Material</Label>
                  <Input
                    id={'material'}
                    onChange={(e) => handleInputChange('material', e.target.value)}
                    placeholder={'Resin, Ceramic, etc.'}
                    value={formData.material}
                  />
                </div>
              </div>

              <div className={'grid grid-cols-1 gap-4 md:grid-cols-2'}>
                <div className={'space-y-2'}>
                  <Label htmlFor={'manufacturer'}>Manufacturer</Label>
                  <Input
                    id={'manufacturer'}
                    onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                    placeholder={'Company name'}
                    value={formData.manufacturer}
                  />
                </div>
                <div className={'space-y-2'}>
                  <Label htmlFor={'currentCondition'}>Current Condition</Label>
                  <Select
                    onValueChange={(value) => handleInputChange('currentCondition', value)}
                    value={formData.currentCondition}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {conditionOptions.map((condition) => (
                        <SelectItem key={condition} value={condition}>
                          {condition.charAt(0).toUpperCase() + condition.slice(1).replace('-', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Acquisition Details */}
          <Card>
            <CardHeader>
              <CardTitle>Acquisition Details</CardTitle>
              <CardDescription>How and when you acquired this bobblehead</CardDescription>
            </CardHeader>
            <CardContent className={'space-y-4'}>
              <div className={'grid grid-cols-1 gap-4 md:grid-cols-2'}>
                <div className={'space-y-2'}>
                  <Label>Acquisition Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !formData.acquisitionDate && 'text-muted-foreground',
                        )}
                        variant={'outline'}
                      >
                        <CalendarIcon className={'mr-2 h-4 w-4'} />
                        {formData.acquisitionDate ? format(formData.acquisitionDate, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className={'w-auto p-0'}>
                      <Calendar
                        initialFocus
                        mode={'single'}
                        onSelect={(date) => handleInputChange('acquisitionDate', date)}
                        selected={formData.acquisitionDate}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className={'space-y-2'}>
                  <Label htmlFor={'acquisitionMethod'}>Acquisition Method</Label>
                  <Input
                    id={'acquisitionMethod'}
                    onChange={(e) => handleInputChange('acquisitionMethod', e.target.value)}
                    placeholder={'Purchase, Gift, Trade, etc.'}
                    value={formData.acquisitionMethod}
                  />
                </div>
              </div>

              <div className={'grid grid-cols-1 gap-4 md:grid-cols-2'}>
                <div className={'space-y-2'}>
                  <Label htmlFor={'purchaseLocation'}>Purchase Location</Label>
                  <Input
                    id={'purchaseLocation'}
                    onChange={(e) => handleInputChange('purchaseLocation', e.target.value)}
                    placeholder={'Store, website, event, etc.'}
                    value={formData.purchaseLocation}
                  />
                </div>
                <div className={'space-y-2'}>
                  <Label htmlFor={'purchasePrice'}>Purchase Price ($)</Label>
                  <Input
                    id={'purchasePrice'}
                    onChange={(e) => handleInputChange('purchasePrice', e.target.value)}
                    placeholder={'25.99'}
                    step={'0.01'}
                    type={'number'}
                    value={formData.purchasePrice}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className={'flex items-center gap-2'}>
                <Tag className={'h-5 w-5'} />
                Tags
              </CardTitle>
              <CardDescription>Add custom tags to organize and categorize your bobblehead</CardDescription>
            </CardHeader>
            <CardContent className={'space-y-4'}>
              <div className={'flex flex-wrap gap-2'}>
                {tags.map((tag, index) => (
                  <Badge
                    className={'flex items-center gap-1 px-3 py-1'}
                    key={index}
                    style={{ backgroundColor: tag.color + '20', borderColor: tag.color, color: tag.color }}
                    variant={'secondary'}
                  >
                    {tag.name}
                    <Button
                      className={'h-4 w-4 p-0 hover:bg-transparent'}
                      onClick={() => removeTag(index)}
                      size={'sm'}
                      type={'button'}
                      variant={'ghost'}
                    >
                      <X className={'h-3 w-3'} />
                    </Button>
                  </Badge>
                ))}
              </div>

              <div className={'flex gap-2'}>
                <Input
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder={'Enter tag name'}
                  value={newTagName}
                />
                <div className={'flex items-center gap-2'}>
                  <div
                    className={'h-8 w-8 cursor-pointer rounded-full border-2 border-border'}
                    onClick={() => {
                      const nextIndex = (tagColors.indexOf(newTagColor!) + 1) % tagColors.length;
                      setNewTagColor(tagColors[nextIndex]);
                    }}
                    style={{ backgroundColor: newTagColor }}
                  />
                  <Button disabled={!newTagName.trim()} onClick={handleAddTag} type={'button'}>
                    <Plus className={'h-4 w-4'} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Custom Fields */}
          <Card>
            <CardHeader>
              <CardTitle>Custom Fields</CardTitle>
              <CardDescription>Add custom attributes specific to this bobblehead</CardDescription>
            </CardHeader>
            <CardContent className={'space-y-4'}>
              {customFields.map((field, index) => (
                <div className={'flex items-end gap-2'} key={index}>
                  <div className={'flex-1 space-y-2'}>
                    <Label>Field Name</Label>
                    <Input
                      onChange={(e) => updateCustomField(index, 'key', e.target.value)}
                      placeholder={'e.g., Edition Number'}
                      value={field.key}
                    />
                  </div>
                  <div className={'flex-1 space-y-2'}>
                    <Label>Value</Label>
                    <Input
                      onChange={(e) => updateCustomField(index, 'value', e.target.value)}
                      placeholder={'e.g., 1 of 500'}
                      value={field.value}
                    />
                  </div>
                  <Button
                    className={'mb-0'}
                    onClick={() => removeCustomField(index)}
                    size={'sm'}
                    type={'button'}
                    variant={'outline'}
                  >
                    <Trash2 className={'h-4 w-4'} />
                  </Button>
                </div>
              ))}

              <Button
                className={'w-full bg-transparent'}
                onClick={handleAddCustomField}
                type={'button'}
                variant={'outline'}
              >
                <Plus className={'mr-2 h-4 w-4'} />
                Add Custom Field
              </Button>
            </CardContent>
          </Card>

          {/* Photo Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Photos</CardTitle>
              <CardDescription>Upload photos of your bobblehead</CardDescription>
            </CardHeader>
            <CardContent className={'space-y-4'}>
              <div className={'rounded-lg border-2 border-dashed border-border p-6 text-center'}>
                <Upload className={'mx-auto mb-4 h-12 w-12 text-muted-foreground'} />
                <div className={'space-y-2'}>
                  <Label className={'cursor-pointer text-primary hover:text-primary/80'} htmlFor={'photos'}>
                    Click to upload photos
                  </Label>
                  <Input
                    accept={'image/*'}
                    className={'hidden'}
                    id={'photos'}
                    multiple
                    onChange={handlePhotoUpload}
                    type={'file'}
                  />
                  <p className={'text-sm text-muted-foreground'}>
                    Drag and drop files here, or click to select files
                  </p>
                </div>
              </div>

              {photos.length > 0 && (
                <div className={'grid grid-cols-2 gap-4 md:grid-cols-4'}>
                  {photos.map((photo, index) => (
                    <div className={'group relative'} key={index}>
                      <img
                        alt={`Upload ${index + 1}`}
                        className={'h-24 w-full rounded-lg object-cover'}
                        src={URL.createObjectURL(photo) || '/placeholder.svg'}
                      />
                      <Button
                        className={
                          'absolute top-1 right-1 h-6 w-6 p-0 opacity-0 transition-opacity group-hover:opacity-100'
                        }
                        onClick={() => removePhoto(index)}
                        size={'sm'}
                        type={'button'}
                        variant={'destructive'}
                      >
                        <X className={'h-3 w-3'} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>Visibility and status settings</CardDescription>
            </CardHeader>
            <CardContent className={'space-y-4'}>
              <div className={'grid grid-cols-1 gap-4 md:grid-cols-2'}>
                <div className={'space-y-2'}>
                  <Label htmlFor={'status'}>Status</Label>
                  <Select
                    onValueChange={(value) => handleInputChange('status', value)}
                    value={formData.status}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className={'space-y-4'}>
                <div className={'flex items-center space-x-2'}>
                  <Checkbox
                    checked={formData.isPublic}
                    id={'isPublic'}
                    onCheckedChange={(checked) => handleInputChange('isPublic', checked)}
                  />
                  <Label htmlFor={'isPublic'}>Make this bobblehead public</Label>
                </div>
                <div className={'flex items-center space-x-2'}>
                  <Checkbox
                    checked={formData.isFeatured}
                    id={'isFeatured'}
                    onCheckedChange={(checked) => handleInputChange('isFeatured', checked)}
                  />
                  <Label htmlFor={'isFeatured'}>Feature this bobblehead</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className={'flex justify-end space-x-4'}>
            <Button
              onClick={() => {
                router.back();
              }}
              type={'button'}
              variant={'outline'}
            >
              Cancel
            </Button>
            <Button className={'bg-primary hover:bg-primary/90'} type={'submit'}>
              Add Bobblehead
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
