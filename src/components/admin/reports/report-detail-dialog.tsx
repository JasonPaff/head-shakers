'use client';

import type { ComponentPropsWithRef } from 'react';

import {
  AlertCircleIcon,
  CalendarIcon,
  CheckCircleIcon,
  ExternalLinkIcon,
  FileTextIcon,
  ShieldAlertIcon,
  UserIcon,
  XCircleIcon,
} from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';
import { useState } from 'react';

import type { SelectContentReportWithSlugs } from '@/lib/validations/moderation.validation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatDateTime, formatShortDate } from '@/lib/utils/date.utils';
import { cn } from '@/utils/tailwind-utils';

interface ReportDetailDialogProps extends ComponentPropsWithRef<'div'> {
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (reportId: string, status: 'dismissed' | 'resolved' | 'reviewed') => Promise<void> | void;
  report: null | SelectContentReportWithSlugs;
}

// Helper function to check if content link is available
const isContentLinkAvailable = (report: SelectContentReportWithSlugs): boolean => {
  // Comments have no direct route
  if (report.targetType === 'comment') {
    return false;
  }

  // Content must exist and have the required slug data
  if (!report.contentExists) {
    return false;
  }

  // Bobbleheads and collections need targetSlug
  if (report.targetType === 'bobblehead' || report.targetType === 'collection') {
    return !!report.targetSlug;
  }

  return false;
};

// Helper function to generate content link based on target type
const getContentLink = (report: SelectContentReportWithSlugs): null | string => {
  if (!isContentLinkAvailable(report)) {
    return null;
  }

  switch (report.targetType) {
    case 'bobblehead':
      return $path({
        route: '/bobbleheads/[bobbleheadSlug]',
        routeParams: { bobbleheadSlug: report.targetSlug! },
      });
    case 'collection':
      return $path({
        route: '/collections/[collectionSlug]',
        routeParams: { collectionSlug: report.targetSlug! },
      });
    default:
      return null;
  }
};

// Helper function to format content type display names
const getContentTypeLabel = (targetType: string): string => {
  return targetType.charAt(0).toUpperCase() + targetType.slice(1);
};

export const ReportDetailDialog = ({ isOpen, onClose, onStatusChange, report }: ReportDetailDialogProps) => {
  // useState hooks
  const [isUpdating, setIsUpdating] = useState(false);

  // Event handlers
  const handleStatusChange = async (status: 'dismissed' | 'resolved' | 'reviewed') => {
    if (!report) return;

    setIsUpdating(true);
    try {
      await onStatusChange?.(report.id, status);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClose = () => {
    if (!isUpdating) {
      onClose();
    }
  };

  // Derived variables for conditional rendering
  const _hasReport = !!report;
  const _hasDescription = !!report?.description;
  const _hasModeratorNotes = !!report?.moderatorNotes;
  const _isResolved = report?.status === 'resolved';
  const _isDismissed = report?.status === 'dismissed';
  const _isPending = report?.status === 'pending';
  const _isReviewed = report?.status === 'reviewed';
  const _isBobblehead = report?.targetType === 'bobblehead';
  const _isCollection = report?.targetType === 'collection';
  const _isComment = report?.targetType === 'comment';
  const _hasCommentContent = _isComment && !!report?.commentContent;
  const _isContentLinkable = report ? isContentLinkAvailable(report) : false;
  const _contentLink = report ? getContentLink(report) : null;
  const _showContentPreview = _hasCommentContent || _isContentLinkable;
  const _contentExists = report?.contentExists ?? false;

  // Utility functions
  const formatReason = (reason: string) => {
    return reason
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Dialog onOpenChange={handleClose} open={isOpen}>
      <DialogContent className={'flex max-h-[90vh] flex-col overflow-hidden sm:max-w-2xl'}>
        <DialogHeader className={'shrink-0'}>
          <DialogTitle>Report Details</DialogTitle>
          <DialogDescription>Review complete report information and take action</DialogDescription>
        </DialogHeader>

        <div className={'min-h-0 flex-1 overflow-y-auto pr-2'}>
          <Conditional isCondition={!_hasReport}>
            <div className={'py-8 text-center text-muted-foreground'}>No report data available</div>
          </Conditional>

          <Conditional isCondition={_hasReport && !!report}>
            <div className={'space-y-6'}>
              {/* Report Status Section */}
              <div className={'flex items-center justify-between'}>
                <div className={'flex items-center gap-2'}>
                  <ShieldAlertIcon className={'size-5 text-muted-foreground'} />
                  <span className={'font-medium'}>Status:</span>
                </div>
                <Badge
                  className={cn(
                    _isPending && 'bg-yellow-100 text-yellow-800',
                    _isReviewed && 'bg-blue-100 text-blue-800',
                    _isResolved && 'bg-green-100 text-green-800',
                    _isDismissed && 'bg-gray-100 text-gray-800',
                  )}
                  variant={'secondary'}
                >
                  {report?.status && report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                </Badge>
              </div>

              {/* Report Information Section */}
              <div className={'space-y-4 rounded-lg border bg-muted/30 p-4'}>
                <h3 className={'text-sm font-semibold'}>Report Information</h3>

                <div className={'space-y-3'}>
                  {/* Reason */}
                  <div className={'flex items-start gap-3'}>
                    <AlertCircleIcon className={'mt-0.5 size-4 text-muted-foreground'} />
                    <div className={'flex-1 space-y-1'}>
                      <div className={'text-xs text-muted-foreground'}>Reason</div>
                      <div className={'font-medium'}>{report && formatReason(report.reason)}</div>
                    </div>
                  </div>

                  {/* Description */}
                  <Conditional isCondition={_hasDescription}>
                    <div className={'flex items-start gap-3'}>
                      <FileTextIcon className={'mt-0.5 size-4 text-muted-foreground'} />
                      <div className={'flex-1 space-y-1'}>
                        <div className={'text-xs text-muted-foreground'}>Description</div>
                        <div className={'text-sm'}>{report?.description}</div>
                      </div>
                    </div>
                  </Conditional>

                  {/* Reporter */}
                  <div className={'flex items-start gap-3'}>
                    <UserIcon className={'mt-0.5 size-4 text-muted-foreground'} />
                    <div className={'flex-1 space-y-1'}>
                      <div className={'text-xs text-muted-foreground'}>Reporter</div>
                      <div className={'truncate font-mono text-xs'}>{report?.reporterId}</div>
                    </div>
                  </div>

                  {/* Created Date */}
                  <div className={'flex items-start gap-3'}>
                    <CalendarIcon className={'mt-0.5 size-4 text-muted-foreground'} />
                    <div className={'flex-1 space-y-1'}>
                      <div className={'text-xs text-muted-foreground'}>Submitted</div>
                      <div className={'text-sm'}>{report && formatDateTime(report.createdAt)}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Target Content Section */}
              <div className={'space-y-4 rounded-lg border bg-muted/30 p-4'}>
                <h3 className={'text-sm font-semibold'}>Reported Content</h3>

                <div className={'space-y-3'}>
                  {/* Content Type */}
                  <div className={'flex items-center justify-between'}>
                    <span className={'text-xs text-muted-foreground'}>Content Type</span>
                    <Badge
                      className={cn(
                        _isBobblehead && 'bg-green-100 text-green-800',
                        _isCollection && 'bg-blue-100 text-blue-800',
                        _isComment && 'bg-orange-100 text-orange-800',
                      )}
                      variant={'secondary'}
                    >
                      {report?.targetType &&
                        report.targetType.charAt(0).toUpperCase() + report.targetType.slice(1)}
                    </Badge>
                  </div>

                  {/* Content Status */}
                  <div className={'flex items-center justify-between'}>
                    <span className={'text-xs text-muted-foreground'}>Content Status</span>
                    <div className={'flex items-center gap-2'}>
                      <Conditional isCondition={_contentExists}>
                        <CheckCircleIcon className={'size-4 text-green-600'} />
                        <span className={'text-sm font-medium text-green-600'}>Exists</span>
                      </Conditional>
                      <Conditional isCondition={!_contentExists}>
                        <XCircleIcon className={'size-4 text-red-600'} />
                        <span className={'text-sm font-medium text-red-600'}>Deleted</span>
                      </Conditional>
                    </div>
                  </div>

                  {/* Content ID */}
                  <div className={'space-y-1'}>
                    <div className={'text-xs text-muted-foreground'}>Content ID</div>
                    <div className={'truncate rounded-md bg-muted p-2 font-mono text-xs'}>
                      {report?.targetId}
                    </div>
                  </div>

                  {/* Content Preview */}
                  <Conditional isCondition={_showContentPreview}>
                    <div className={'space-y-2'}>
                      <div className={'text-xs text-muted-foreground'}>Content Preview</div>

                      {/* Comment Content Display */}
                      <Conditional isCondition={_hasCommentContent}>
                        <p className={'rounded-md bg-muted p-3 text-sm text-muted-foreground'}>
                          {report?.commentContent}
                        </p>
                      </Conditional>

                      {/* Linkable Content Display */}
                      <Conditional isCondition={_isContentLinkable && !!_contentLink}>
                        <Button asChild size={'sm'} variant={'outline'}>
                          <Link href={_contentLink || ''}>
                            View {report?.targetType && getContentTypeLabel(report.targetType)}
                            <ExternalLinkIcon className={'ml-1 size-3.5'} />
                          </Link>
                        </Button>
                      </Conditional>
                    </div>
                  </Conditional>

                  {/* Unavailable Content Display */}
                  <Conditional isCondition={!_showContentPreview}>
                    <div className={'rounded-md bg-muted p-3 text-center'}>
                      <p className={'text-sm text-muted-foreground'}>Content preview unavailable</p>
                    </div>
                  </Conditional>
                </div>
              </div>

              {/* Moderator Notes Section */}
              <Conditional isCondition={_hasModeratorNotes}>
                <div className={'space-y-4 rounded-lg border bg-muted/30 p-4'}>
                  <h3 className={'text-sm font-semibold'}>Moderator Notes</h3>
                  <div className={'text-sm'}>{report?.moderatorNotes}</div>
                </div>
              </Conditional>

              {/* Action History Section */}
              <div className={'space-y-4 rounded-lg border bg-muted/30 p-4'}>
                <h3 className={'text-sm font-semibold'}>Action History</h3>

                <div className={'space-y-3'}>
                  {/* Created Event */}
                  <div className={'flex items-start gap-3 text-sm'}>
                    <div className={'mt-1 size-2 rounded-full bg-yellow-500'} />
                    <div className={'flex-1'}>
                      <div className={'font-medium'}>Report Created</div>
                      <div className={'text-xs text-muted-foreground'}>
                        {report && formatShortDate(report.createdAt)}
                      </div>
                    </div>
                  </div>

                  {/* Updated Event */}
                  <Conditional isCondition={report?.updatedAt !== report?.createdAt}>
                    <div className={'flex items-start gap-3 text-sm'}>
                      <div className={'mt-1 size-2 rounded-full bg-blue-500'} />
                      <div className={'flex-1'}>
                        <div className={'font-medium'}>Status Updated</div>
                        <div className={'text-xs text-muted-foreground'}>
                          {report && formatShortDate(report.updatedAt)}
                        </div>
                      </div>
                    </div>
                  </Conditional>

                  {/* Resolved Event */}
                  <Conditional isCondition={!!report?.resolvedAt}>
                    <div className={'flex items-start gap-3 text-sm'}>
                      <div className={'mt-1 size-2 rounded-full bg-green-500'} />
                      <div className={'flex-1'}>
                        <div className={'font-medium'}>Report {_isResolved ? 'Resolved' : 'Dismissed'}</div>
                        <div className={'text-xs text-muted-foreground'}>
                          {report?.resolvedAt && formatShortDate(report.resolvedAt)}
                        </div>
                        <Conditional isCondition={!!report?.moderatorId}>
                          <div className={'mt-1 truncate font-mono text-xs text-muted-foreground'}>
                            By: {report?.moderatorId}
                          </div>
                        </Conditional>
                      </div>
                    </div>
                  </Conditional>
                </div>
              </div>
            </div>
          </Conditional>
        </div>

        <DialogFooter className={'shrink-0'}>
          {/* Action Buttons */}
          <div className={'flex w-full flex-col gap-2 sm:flex-row sm:justify-between'}>
            <Button disabled={isUpdating} onClick={handleClose} variant={'outline'}>
              Close
            </Button>

            <Conditional isCondition={_hasReport && !_isResolved && !_isDismissed}>
              <div className={'flex gap-2'}>
                <Conditional isCondition={_isPending}>
                  <Button
                    disabled={isUpdating}
                    onClick={() => {
                      void handleStatusChange('reviewed');
                    }}
                    size={'sm'}
                    variant={'outline'}
                  >
                    Mark as Reviewed
                  </Button>
                </Conditional>
                <Button
                  disabled={isUpdating}
                  onClick={() => {
                    void handleStatusChange('resolved');
                  }}
                  size={'sm'}
                  variant={'default'}
                >
                  Resolve
                </Button>
                <Button
                  disabled={isUpdating}
                  onClick={() => {
                    void handleStatusChange('dismissed');
                  }}
                  size={'sm'}
                  variant={'destructive'}
                >
                  Dismiss
                </Button>
              </div>
            </Conditional>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
