'use client';

import { PlusIcon, Trash2Icon } from 'lucide-react';
import { useCallback, useMemo } from 'react';

import type { CloudinaryPhoto } from '@/lib/validations/photo-upload.validation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CloudinaryPhotoUpload } from '@/components/ui/cloudinary-photo-upload';
import { Conditional } from '@/components/ui/conditional';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ENUMS } from '@/lib/constants';

import type { CollectionSelectorRecord, CustomFieldsArray, FormPhotos } from './bobblehead-upsert-form.types';
import type { useBobbleheadUpsertForm } from './hooks/use-bobblehead-upsert-form';

/**
 * Props for BobbleheadFormFields component.
 */
interface BobbleheadFormFieldsProps {
  /** Bobblehead ID when in edit mode (for photo operations). */
  bobbleheadId?: string;
  /** Available collections for the collection selector. */
  collections: Array<CollectionSelectorRecord>;
  /** Form instance from useBobbleheadUpsertForm hook. */
  form: ReturnType<typeof useBobbleheadUpsertForm>['form'];
  /** Whether the form is currently submitting. */
  isSubmitting: boolean;
  /** Callback when photos array changes. */
  onPhotosChange: (
    photos: ((prevPhotos: Array<CloudinaryPhoto>) => Array<CloudinaryPhoto>) | Array<CloudinaryPhoto>,
  ) => void;
  /** Current photos array. */
  photos: FormPhotos;
  /** Prefix for generating test IDs. */
  testIdPrefix: string;
}

/**
 * BobbleheadFormFields renders all form field groups for the bobblehead upsert form.
 *
 * The fields are organized into logical sections:
 * - Basic Information (name, collection, character name, description, category, series, year)
 * - Photos (Cloudinary photo upload)
 * - Acquisition Details (date, method, location, price)
 * - Physical Attributes (height, weight, material, manufacturer, condition)
 * - Custom Fields (dynamic key-value pairs)
 * - Item Settings (status, visibility, featured)
 */
export function BobbleheadFormFields({
  bobbleheadId,
  collections,
  form,
  isSubmitting,
  onPhotosChange,
  photos,
  testIdPrefix,
}: BobbleheadFormFieldsProps) {
  // useMemo hooks
  const conditionOptions = useMemo(
    () =>
      ENUMS.BOBBLEHEAD.CONDITION.map((condition) => ({
        label: condition.charAt(0).toUpperCase() + condition.slice(1),
        value: condition,
      })),
    [],
  );

  const statusOptions = useMemo(
    () =>
      ENUMS.BOBBLEHEAD.STATUS.map((status) => ({
        label: status.charAt(0).toUpperCase() + status.slice(1),
        value: status,
      })),
    [],
  );

  const collectionItems = useMemo(
    () =>
      collections.map((collection) => ({
        id: collection.id,
        name: collection.name,
      })),
    [collections],
  );

  // Event handlers
  const handleAddCustomField = useCallback(() => {
    const currentFields = (form.getFieldValue('customFields') as CustomFieldsArray) || [];
    form.setFieldValue('customFields', [...currentFields, {}]);
  }, [form]);

  const handleRemoveCustomField = useCallback(
    (index: number) => {
      const currentFields = (form.getFieldValue('customFields') as CustomFieldsArray) || [];
      const updatedFields = currentFields.filter((_, i) => i !== index);
      form.setFieldValue('customFields', updatedFields);
    },
    [form],
  );

  const handleCustomFieldChange = useCallback(
    (index: number, key: string, value: string) => {
      const currentFields = (form.getFieldValue('customFields') as CustomFieldsArray) || [];
      const updatedFields = [...currentFields];
      // Replace the entire object at index with the new key-value pair
      if (updatedFields[index]) {
        // If the key is being changed, we need to create a new object
        const existingValue = Object.values(updatedFields[index] || {})[0] || '';
        const existingKey = Object.keys(updatedFields[index] || {})[0] || '';
        if (key !== existingKey) {
          // Key changed - create new object with new key and existing value
          updatedFields[index] = { [key]: existingValue };
        } else {
          // Value changed - update the value
          updatedFields[index] = { [existingKey]: value };
        }
      }
      form.setFieldValue('customFields', updatedFields);
    },
    [form],
  );

  return (
    <div className={'space-y-6'}>
      {/* Basic Information Section */}
      <Card testId={`${testIdPrefix}-basic-info-card`}>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Enter the basic details about your bobblehead.</CardDescription>
        </CardHeader>
        <CardContent className={'space-y-4'}>
          {/* Name Field */}
          <form.AppField name={'name'}>
            {(field) => (
              <field.TextField
                isRequired
                label={'Name'}
                placeholder={'Enter bobblehead name'}
                testId={`${testIdPrefix}-name-field`}
              />
            )}
          </form.AppField>

          {/* Collection Field */}
          <form.AppField name={'collectionId'}>
            {(field) => (
              <field.ComboboxField
                isRequired
                items={collectionItems}
                label={'Collection'}
                placeholder={'Select a collection'}
                searchPlaceholder={'Search collections...'}
              />
            )}
          </form.AppField>

          {/* Character Name Field */}
          <form.AppField name={'characterName'}>
            {(field) => (
              <field.TextField
                description={'The name of the character or person this bobblehead represents'}
                label={'Character Name'}
                placeholder={'e.g., Mickey Mouse, Babe Ruth'}
                testId={`${testIdPrefix}-character-name-field`}
              />
            )}
          </form.AppField>

          {/* Description Field */}
          <form.AppField name={'description'}>
            {(field) => (
              <field.TextareaField
                description={'Provide details about the bobblehead, its history, or special features'}
                label={'Description'}
                placeholder={'Enter a description of your bobblehead...'}
                rows={4}
                testId={`${testIdPrefix}-description-field`}
              />
            )}
          </form.AppField>

          {/* Category and Series Row */}
          <div className={'grid gap-4 sm:grid-cols-2'}>
            {/* Category Field */}
            <form.AppField name={'category'}>
              {(field) => (
                <field.TextField
                  description={'e.g., Sports, Entertainment, Historical'}
                  label={'Category'}
                  placeholder={'Enter category'}
                  testId={`${testIdPrefix}-category-field`}
                />
              )}
            </form.AppField>

            {/* Series Field */}
            <form.AppField name={'series'}>
              {(field) => (
                <field.TextField
                  description={'e.g., MLB Legends, Disney Classics'}
                  label={'Series'}
                  placeholder={'Enter series name'}
                  testId={`${testIdPrefix}-series-field`}
                />
              )}
            </form.AppField>
          </div>

          {/* Year Field */}
          <form.AppField name={'year'}>
            {(field) => (
              <field.TextField
                description={'The year the bobblehead was manufactured or released'}
                label={'Year'}
                placeholder={'e.g., 2024'}
                testId={`${testIdPrefix}-year-field`}
                type={'number'}
              />
            )}
          </form.AppField>
        </CardContent>
      </Card>

      {/* Photos Section */}
      <Card testId={`${testIdPrefix}-photos-card`}>
        <CardHeader>
          <CardTitle>Photos</CardTitle>
          <CardDescription>
            Upload photos of your bobblehead. The first photo will be used as the cover image.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CloudinaryPhotoUpload
            bobbleheadId={bobbleheadId}
            isDisabled={isSubmitting}
            onPhotosChange={onPhotosChange}
            photos={photos}
          />
        </CardContent>
      </Card>

      {/* Acquisition Details Section */}
      <Card testId={`${testIdPrefix}-acquisition-card`}>
        <CardHeader>
          <CardTitle>Acquisition Details</CardTitle>
          <CardDescription>Track where and when you acquired this bobblehead.</CardDescription>
        </CardHeader>
        <CardContent className={'space-y-4'}>
          {/* Acquisition Date and Method Row */}
          <div className={'grid gap-4 sm:grid-cols-2'}>
            {/* Acquisition Date Field */}
            <form.AppField name={'acquisitionDate'}>
              {(field) => (
                <field.TextField
                  description={'When you acquired this bobblehead'}
                  label={'Acquisition Date'}
                  testId={`${testIdPrefix}-acquisition-date-field`}
                  type={'date'}
                />
              )}
            </form.AppField>

            {/* Acquisition Method Field */}
            <form.AppField name={'acquisitionMethod'}>
              {(field) => (
                <field.TextField
                  description={'e.g., Purchase, Gift, Trade'}
                  label={'Acquisition Method'}
                  placeholder={'How did you acquire it?'}
                  testId={`${testIdPrefix}-acquisition-method-field`}
                />
              )}
            </form.AppField>
          </div>

          {/* Purchase Location and Price Row */}
          <div className={'grid gap-4 sm:grid-cols-2'}>
            {/* Purchase Location Field */}
            <form.AppField name={'purchaseLocation'}>
              {(field) => (
                <field.TextField
                  description={'Store, website, or event where purchased'}
                  label={'Purchase Location'}
                  placeholder={'e.g., eBay, Stadium Gift Shop'}
                  testId={`${testIdPrefix}-purchase-location-field`}
                />
              )}
            </form.AppField>

            {/* Purchase Price Field */}
            <form.AppField name={'purchasePrice'}>
              {(field) => (
                <field.TextField
                  description={'Original purchase price'}
                  label={'Purchase Price'}
                  placeholder={'0.00'}
                  testId={`${testIdPrefix}-purchase-price-field`}
                  type={'number'}
                />
              )}
            </form.AppField>
          </div>
        </CardContent>
      </Card>

      {/* Physical Attributes Section */}
      <Card testId={`${testIdPrefix}-physical-card`}>
        <CardHeader>
          <CardTitle>Physical Attributes</CardTitle>
          <CardDescription>Record the physical characteristics of your bobblehead.</CardDescription>
        </CardHeader>
        <CardContent className={'space-y-4'}>
          {/* Height and Weight Row */}
          <div className={'grid gap-4 sm:grid-cols-2'}>
            {/* Height Field */}
            <form.AppField name={'height'}>
              {(field) => (
                <field.TextField
                  description={'Height in inches'}
                  label={'Height'}
                  placeholder={'e.g., 7.5'}
                  testId={`${testIdPrefix}-height-field`}
                  type={'number'}
                />
              )}
            </form.AppField>

            {/* Weight Field */}
            <form.AppField name={'weight'}>
              {(field) => (
                <field.TextField
                  description={'Weight in ounces'}
                  label={'Weight'}
                  placeholder={'e.g., 12'}
                  testId={`${testIdPrefix}-weight-field`}
                  type={'number'}
                />
              )}
            </form.AppField>
          </div>

          {/* Material and Manufacturer Row */}
          <div className={'grid gap-4 sm:grid-cols-2'}>
            {/* Material Field */}
            <form.AppField name={'material'}>
              {(field) => (
                <field.TextField
                  description={'e.g., Resin, Ceramic, Plastic'}
                  label={'Material'}
                  placeholder={'Enter material type'}
                  testId={`${testIdPrefix}-material-field`}
                />
              )}
            </form.AppField>

            {/* Manufacturer Field */}
            <form.AppField name={'manufacturer'}>
              {(field) => (
                <field.TextField
                  description={'Company that made the bobblehead'}
                  label={'Manufacturer'}
                  placeholder={'Enter manufacturer name'}
                  testId={`${testIdPrefix}-manufacturer-field`}
                />
              )}
            </form.AppField>
          </div>

          {/* Condition Field */}
          <form.AppField name={'currentCondition'}>
            {(field) => (
              <field.SelectField
                description={'Current condition of the bobblehead'}
                label={'Condition'}
                options={conditionOptions}
                placeholder={'Select condition'}
                testId={`${testIdPrefix}-condition-field`}
              />
            )}
          </form.AppField>
        </CardContent>
      </Card>

      {/* Custom Fields Section */}
      <Card testId={`${testIdPrefix}-custom-fields-card`}>
        <CardHeader>
          <CardTitle>Custom Fields</CardTitle>
          <CardDescription>
            Add any additional information as key-value pairs (e.g., Limited Edition Number, Signed By).
          </CardDescription>
        </CardHeader>
        <CardContent className={'space-y-4'}>
          <form.AppField name={'customFields'}>
            {(field) => {
              const customFields = (field.state.value as CustomFieldsArray) || [];

              return (
                <div className={'space-y-3'}>
                  {customFields.map((customField, index) => {
                    const fieldKey = Object.keys(customField)[0] || '';
                    const fieldValue = Object.values(customField)[0] || '';

                    return (
                      <div className={'flex items-end gap-2'} key={index}>
                        {/* Key Input */}
                        <div className={'flex-1 space-y-1'}>
                          <Conditional isCondition={index === 0}>
                            <Label className={'text-xs text-muted-foreground'}>Field Name</Label>
                          </Conditional>
                          <Input
                            onChange={(e) => handleCustomFieldChange(index, e.target.value, fieldValue)}
                            placeholder={'e.g., Limited Edition'}
                            testId={`${testIdPrefix}-custom-field-key-${index}`}
                            value={fieldKey}
                          />
                        </div>

                        {/* Value Input */}
                        <div className={'flex-1 space-y-1'}>
                          <Conditional isCondition={index === 0}>
                            <Label className={'text-xs text-muted-foreground'}>Value</Label>
                          </Conditional>
                          <Input
                            onChange={(e) => handleCustomFieldChange(index, fieldKey, e.target.value)}
                            placeholder={'e.g., #42 of 500'}
                            testId={`${testIdPrefix}-custom-field-value-${index}`}
                            value={fieldValue}
                          />
                        </div>

                        {/* Remove Button */}
                        <Button
                          aria-label={'Remove custom field'}
                          onClick={() => handleRemoveCustomField(index)}
                          size={'icon'}
                          testId={`${testIdPrefix}-remove-custom-field-${index}`}
                          type={'button'}
                          variant={'ghost'}
                        >
                          <Trash2Icon aria-hidden className={'size-4 text-destructive'} />
                        </Button>
                      </div>
                    );
                  })}

                  {/* Add Custom Field Button */}
                  <Button
                    className={'w-full'}
                    onClick={handleAddCustomField}
                    size={'sm'}
                    testId={`${testIdPrefix}-add-custom-field-button`}
                    type={'button'}
                    variant={'outline'}
                  >
                    <PlusIcon aria-hidden className={'size-4'} />
                    Add Custom Field
                  </Button>
                </div>
              );
            }}
          </form.AppField>
        </CardContent>
      </Card>

      {/* Item Settings Section */}
      <Card testId={`${testIdPrefix}-settings-card`}>
        <CardHeader>
          <CardTitle>Item Settings</CardTitle>
          <CardDescription>Configure visibility and status settings for this bobblehead.</CardDescription>
        </CardHeader>
        <CardContent className={'space-y-4'}>
          {/* Status Field */}
          <form.AppField name={'status'}>
            {(field) => (
              <field.SelectField
                description={'Current status of this bobblehead in your collection'}
                label={'Status'}
                options={statusOptions}
                placeholder={'Select status'}
                testId={`${testIdPrefix}-status-field`}
              />
            )}
          </form.AppField>

          {/* Tags Field */}
          {/*<form.AppField name={'tags'}>*/}
          {/*  {(field) => (*/}
          {/*    <field.TagField*/}
          {/*      description={'Add tags to help categorize and find your bobblehead'}*/}
          {/*      label={'Tags'}*/}
          {/*      placeholder={'Add tags...'}*/}
          {/*    />*/}
          {/*  )}*/}
          {/*</form.AppField>*/}

          {/* Is Public Switch */}
          <form.AppField name={'isPublic'}>
            {(field) => (
              <field.SwitchField
                description={'Make this bobblehead visible to other users'}
                label={'Public'}
                testId={`${testIdPrefix}-is-public-field`}
              />
            )}
          </form.AppField>

          {/* Is Featured Switch */}
          <form.AppField name={'isFeatured'}>
            {(field) => (
              <field.SwitchField
                description={'Feature this bobblehead on your profile (admin only)'}
                label={'Featured'}
                testId={`${testIdPrefix}-is-featured-field`}
              />
            )}
          </form.AppField>
        </CardContent>
      </Card>
    </div>
  );
}
