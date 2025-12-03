import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { FormFieldSkeleton } from './form-field-skeleton';
import { PhotoUploadSkeleton } from './photo-upload-skeleton';

export const AddItemFormSkeleton = () => (
  <div className={'space-y-6'}>
    {/* Collection Assignment Section */}
    <Card>
      <CardHeader>
        <Skeleton className={'h-6 w-48'} />
        <Skeleton className={'h-4 w-96'} />
      </CardHeader>
      <CardContent className={'space-y-4'}>
        <div className={'grid grid-cols-1 gap-4 md:grid-cols-2'}>
          <FormFieldSkeleton />
          <FormFieldSkeleton />
        </div>
      </CardContent>
    </Card>

    {/* Basic Information Section */}
    <Card>
      <CardHeader>
        <Skeleton className={'h-6 w-40'} />
        <Skeleton className={'h-4 w-80'} />
      </CardHeader>
      <CardContent className={'space-y-4'}>
        <div className={'grid grid-cols-1 gap-4 md:grid-cols-2'}>
          <FormFieldSkeleton isRequired />
          <FormFieldSkeleton />
        </div>
        <FormFieldSkeleton isTextarea />
        <div className={'grid grid-cols-1 gap-4 md:grid-cols-3'}>
          <FormFieldSkeleton />
          <FormFieldSkeleton />
          <FormFieldSkeleton />
        </div>
      </CardContent>
    </Card>

    {/* Acquisition Details Section */}
    <Card>
      <CardHeader>
        <Skeleton className={'h-6 w-36'} />
        <Skeleton className={'h-4 w-88'} />
      </CardHeader>
      <CardContent className={'space-y-4'}>
        <div className={'grid grid-cols-1 gap-4 md:grid-cols-2'}>
          <FormFieldSkeleton />
          <FormFieldSkeleton />
        </div>
        <div className={'grid grid-cols-1 gap-4 md:grid-cols-2'}>
          <FormFieldSkeleton />
          <FormFieldSkeleton />
        </div>
      </CardContent>
    </Card>

    {/* Physical Attributes Section */}
    <Card>
      <CardHeader>
        <Skeleton className={'h-6 w-44'} />
        <Skeleton className={'h-4 w-72'} />
      </CardHeader>
      <CardContent className={'space-y-4'}>
        <div className={'grid grid-cols-1 gap-4 md:grid-cols-2'}>
          <FormFieldSkeleton />
          <FormFieldSkeleton />
        </div>
        <div className={'grid grid-cols-1 gap-4 md:grid-cols-2'}>
          <FormFieldSkeleton />
          <FormFieldSkeleton />
        </div>
      </CardContent>
    </Card>

    {/* Item Tags Section */}
    <Card>
      <CardHeader>
        <Skeleton className={'h-6 w-24'} />
        <Skeleton className={'h-4 w-64'} />
      </CardHeader>
      <CardContent>
        <FormFieldSkeleton />
      </CardContent>
    </Card>

    {/* Custom Fields Section */}
    <Card>
      <CardHeader>
        <Skeleton className={'h-6 w-32'} />
        <Skeleton className={'h-4 w-56'} />
      </CardHeader>
      <CardContent>
        <Skeleton className={'h-20 w-full'} />
      </CardContent>
    </Card>

    {/* Item Photos Section */}
    <Card>
      <CardHeader>
        <Skeleton className={'h-6 w-28'} />
        <Skeleton className={'h-4 w-68'} />
      </CardHeader>
      <CardContent>
        <PhotoUploadSkeleton />
      </CardContent>
    </Card>

    {/* Item Settings Section */}
    <Card>
      <CardHeader>
        <Skeleton className={'h-6 w-32'} />
        <Skeleton className={'h-4 w-84'} />
      </CardHeader>
      <CardContent className={'space-y-4'}>
        <FormFieldSkeleton />
        <FormFieldSkeleton isCheckbox />
      </CardContent>
    </Card>

    {/* Action Buttons */}
    <div className={'flex justify-end space-x-4'}>
      <Skeleton className={'h-10 w-20'} />
      <Skeleton className={'h-10 w-36'} />
    </div>
  </div>
);
