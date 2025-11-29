import { and, eq, isNotNull, isNull, sql } from 'drizzle-orm';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { QueryContext } from '@/lib/queries/base/query-context';
import type { NewsletterSignupRecord } from '@/lib/queries/newsletter/newsletter.queries';

import { newsletterSignups } from '@/lib/db/schema/newsletter-signups.schema';
import { NewsletterQuery } from '@/lib/queries/newsletter/newsletter.queries';
import { normalizeEmail } from '@/lib/utils/email-utils';

// Mock the email-utils module
vi.mock('@/lib/utils/email-utils', () => ({
  normalizeEmail: vi.fn((email: string) => email.toLowerCase().trim()),
}));

describe('NewsletterQuery', () => {
  const mockEmail = 'test@example.com';
  const mockNormalizedEmail = 'test@example.com';
  const mockUserId = 'user-123';

  const mockRecord: NewsletterSignupRecord = {
    createdAt: new Date('2024-01-01'),
    email: mockNormalizedEmail,
    id: 'signup-123',
    subscribedAt: new Date('2024-01-01'),
    unsubscribedAt: null,
    userId: mockUserId,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createSignupAsync', () => {
    it('should create new signup with normalized email and userId', async () => {
      // Arrange
      const mockReturning = vi.fn().mockResolvedValue([mockRecord]);
      const mockOnConflictDoNothing = vi.fn().mockReturnValue({ returning: mockReturning });
      const mockValues = vi.fn().mockReturnValue({ onConflictDoNothing: mockOnConflictDoNothing });
      const mockInsert = vi.fn().mockReturnValue({ values: mockValues });

      const mockDb = { insert: mockInsert } as unknown as QueryContext['dbInstance'];
      const context: QueryContext = { dbInstance: mockDb };

      // Act
      const result = await NewsletterQuery.createSignupAsync(mockEmail, mockUserId, context);

      // Assert
      expect(normalizeEmail).toHaveBeenCalledWith(mockEmail);
      expect(mockInsert).toHaveBeenCalledWith(newsletterSignups);
      expect(mockValues).toHaveBeenCalledWith({
        email: mockNormalizedEmail,
        userId: mockUserId,
      });
      expect(mockOnConflictDoNothing).toHaveBeenCalled();
      expect(mockReturning).toHaveBeenCalled();
      expect(result).toEqual(mockRecord);
    });

    it('should handle conflict gracefully - returns null when onConflictDoNothing triggers', async () => {
      // Arrange
      const mockReturning = vi.fn().mockResolvedValue([]);
      const mockOnConflictDoNothing = vi.fn().mockReturnValue({ returning: mockReturning });
      const mockValues = vi.fn().mockReturnValue({ onConflictDoNothing: mockOnConflictDoNothing });
      const mockInsert = vi.fn().mockReturnValue({ values: mockValues });

      const mockDb = { insert: mockInsert } as unknown as QueryContext['dbInstance'];
      const context: QueryContext = { dbInstance: mockDb };

      // Act
      const result = await NewsletterQuery.createSignupAsync(mockEmail, mockUserId, context);

      // Assert
      expect(result).toBeNull();
    });

    it('should handle anonymous signup with userId undefined', async () => {
      // Arrange
      const mockReturning = vi.fn().mockResolvedValue([{ ...mockRecord, userId: undefined }]);
      const mockOnConflictDoNothing = vi.fn().mockReturnValue({ returning: mockReturning });
      const mockValues = vi.fn().mockReturnValue({ onConflictDoNothing: mockOnConflictDoNothing });
      const mockInsert = vi.fn().mockReturnValue({ values: mockValues });

      const mockDb = { insert: mockInsert } as unknown as QueryContext['dbInstance'];
      const context: QueryContext = { dbInstance: mockDb };

      // Act
      const result = await NewsletterQuery.createSignupAsync(mockEmail, undefined, context);

      // Assert
      expect(normalizeEmail).toHaveBeenCalledWith(mockEmail);
      expect(mockValues).toHaveBeenCalledWith({
        email: mockNormalizedEmail,
        userId: undefined,
      });
      expect(result?.userId).toBeUndefined();
    });
  });

  describe('emailExistsAsync', () => {
    it('should return true when email exists', async () => {
      // Arrange
      const mockLimit = vi.fn().mockResolvedValue([{ id: 'signup-123' }]);
      const mockWhere = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
      const mockSelect = vi.fn().mockReturnValue({ from: mockFrom });

      const mockDb = { select: mockSelect } as unknown as QueryContext['dbInstance'];
      const context: QueryContext = { dbInstance: mockDb };

      // Act
      const result = await NewsletterQuery.emailExistsAsync(mockEmail, context);

      // Assert
      expect(normalizeEmail).toHaveBeenCalledWith(mockEmail);
      expect(mockSelect).toHaveBeenCalledWith({ id: newsletterSignups.id });
      expect(mockFrom).toHaveBeenCalledWith(newsletterSignups);
      expect(mockWhere).toHaveBeenCalledWith(eq(newsletterSignups.email, mockNormalizedEmail));
      expect(mockLimit).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });

    it('should return false when email does not exist', async () => {
      // Arrange
      const mockLimit = vi.fn().mockResolvedValue([]);
      const mockWhere = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
      const mockSelect = vi.fn().mockReturnValue({ from: mockFrom });

      const mockDb = { select: mockSelect } as unknown as QueryContext['dbInstance'];
      const context: QueryContext = { dbInstance: mockDb };

      // Act
      const result = await NewsletterQuery.emailExistsAsync(mockEmail, context);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('findByEmailAsync', () => {
    it('should find signup by normalized email', async () => {
      // Arrange
      const mockLimit = vi.fn().mockResolvedValue([mockRecord]);
      const mockWhere = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
      const mockSelect = vi.fn().mockReturnValue({ from: mockFrom });

      const mockDb = { select: mockSelect } as unknown as QueryContext['dbInstance'];
      const context: QueryContext = { dbInstance: mockDb };

      // Act
      const result = await NewsletterQuery.findByEmailAsync(mockEmail, context);

      // Assert
      expect(normalizeEmail).toHaveBeenCalledWith(mockEmail);
      expect(mockSelect).toHaveBeenCalled();
      expect(mockFrom).toHaveBeenCalledWith(newsletterSignups);
      expect(mockWhere).toHaveBeenCalledWith(eq(newsletterSignups.email, mockNormalizedEmail));
      expect(mockLimit).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockRecord);
    });

    it('should return null when email not found', async () => {
      // Arrange
      const mockLimit = vi.fn().mockResolvedValue([]);
      const mockWhere = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
      const mockSelect = vi.fn().mockReturnValue({ from: mockFrom });

      const mockDb = { select: mockSelect } as unknown as QueryContext['dbInstance'];
      const context: QueryContext = { dbInstance: mockDb };

      // Act
      const result = await NewsletterQuery.findByEmailAsync(mockEmail, context);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('getActiveSubscriberAsync', () => {
    it('should return subscriber when active (not unsubscribed)', async () => {
      // Arrange
      const activeRecord = { ...mockRecord, unsubscribedAt: null };
      const mockLimit = vi.fn().mockResolvedValue([activeRecord]);
      const mockWhere = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
      const mockSelect = vi.fn().mockReturnValue({ from: mockFrom });

      const mockDb = { select: mockSelect } as unknown as QueryContext['dbInstance'];
      const context: QueryContext = { dbInstance: mockDb };

      // Act
      const result = await NewsletterQuery.getActiveSubscriberAsync(mockEmail, context);

      // Assert
      expect(normalizeEmail).toHaveBeenCalledWith(mockEmail);
      expect(result).toEqual(activeRecord);
      expect(result?.unsubscribedAt).toBeNull();
    });

    it('should return null when subscriber is unsubscribed', async () => {
      // Arrange
      const unsubscribedRecord = { ...mockRecord, unsubscribedAt: new Date('2024-02-01') };
      const mockLimit = vi.fn().mockResolvedValue([unsubscribedRecord]);
      const mockWhere = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
      const mockSelect = vi.fn().mockReturnValue({ from: mockFrom });

      const mockDb = { select: mockSelect } as unknown as QueryContext['dbInstance'];
      const context: QueryContext = { dbInstance: mockDb };

      // Act
      const result = await NewsletterQuery.getActiveSubscriberAsync(mockEmail, context);

      // Assert
      expect(result).toBeNull();
    });

    it('should return null when email does not exist', async () => {
      // Arrange
      const mockLimit = vi.fn().mockResolvedValue([]);
      const mockWhere = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
      const mockSelect = vi.fn().mockReturnValue({ from: mockFrom });

      const mockDb = { select: mockSelect } as unknown as QueryContext['dbInstance'];
      const context: QueryContext = { dbInstance: mockDb };

      // Act
      const result = await NewsletterQuery.getActiveSubscriberAsync(mockEmail, context);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('getIsActiveSubscriberAsync', () => {
    it('should return true for active subscriber', async () => {
      // Arrange
      const mockLimit = vi.fn().mockResolvedValue([{ exists: true }]);
      const mockWhere = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
      const mockSelect = vi.fn().mockReturnValue({ from: mockFrom });

      const mockDb = { select: mockSelect } as unknown as QueryContext['dbInstance'];
      const context: QueryContext = { dbInstance: mockDb };

      // Act
      const result = await NewsletterQuery.getIsActiveSubscriberAsync(mockEmail, context);

      // Assert
      expect(mockSelect).toHaveBeenCalledWith({ exists: sql`1` });
      expect(mockFrom).toHaveBeenCalledWith(newsletterSignups);
      expect(mockWhere).toHaveBeenCalledWith(
        and(
          eq(newsletterSignups.email, mockEmail),
          isNotNull(newsletterSignups.subscribedAt),
          isNull(newsletterSignups.unsubscribedAt),
        ),
      );
      expect(mockLimit).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });

    it('should return false for inactive or non-existent subscriber', async () => {
      // Arrange
      const mockLimit = vi.fn().mockResolvedValue([]);
      const mockWhere = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
      const mockSelect = vi.fn().mockReturnValue({ from: mockFrom });

      const mockDb = { select: mockSelect } as unknown as QueryContext['dbInstance'];
      const context: QueryContext = { dbInstance: mockDb };

      // Act
      const result = await NewsletterQuery.getIsActiveSubscriberAsync(mockEmail, context);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('resubscribeAsync', () => {
    it('should resubscribe existing email - clear unsubscribedAt and update subscribedAt', async () => {
      // Arrange
      const existingRecord = { ...mockRecord, unsubscribedAt: new Date('2024-02-01') };
      const resubscribedRecord = {
        ...mockRecord,
        subscribedAt: new Date('2024-03-01'),
        unsubscribedAt: null,
      };

      // Mock findByEmailAsync
      const mockFindLimit = vi.fn().mockResolvedValue([existingRecord]);
      const mockFindWhere = vi.fn().mockReturnValue({ limit: mockFindLimit });
      const mockFindFrom = vi.fn().mockReturnValue({ where: mockFindWhere });
      const mockFindSelect = vi.fn().mockReturnValue({ from: mockFindFrom });

      // Mock update query
      const mockReturning = vi.fn().mockResolvedValue([resubscribedRecord]);
      const mockUpdateWhere = vi.fn().mockReturnValue({ returning: mockReturning });
      const mockSet = vi.fn().mockReturnValue({ where: mockUpdateWhere });
      const mockUpdate = vi.fn().mockReturnValue({ set: mockSet });

      const mockDb = {
        select: mockFindSelect,
        update: mockUpdate,
      } as unknown as QueryContext['dbInstance'];
      const context: QueryContext = { dbInstance: mockDb };

      // Act
      const result = await NewsletterQuery.resubscribeAsync(mockEmail, context);

      // Assert
      expect(normalizeEmail).toHaveBeenCalledWith(mockEmail);
      expect(mockUpdate).toHaveBeenCalledWith(newsletterSignups);
      expect(mockSet).toHaveBeenCalledWith({
        subscribedAt: expect.any(Date) as Date,
        unsubscribedAt: null,
      });
      expect(mockUpdateWhere).toHaveBeenCalledWith(eq(newsletterSignups.email, mockNormalizedEmail));
      expect(mockReturning).toHaveBeenCalled();
      expect(result).toEqual(resubscribedRecord);
      expect(result?.unsubscribedAt).toBeNull();
    });

    it('should return null when email does not exist', async () => {
      // Arrange - findByEmailAsync returns null
      const mockFindLimit = vi.fn().mockResolvedValue([]);
      const mockFindWhere = vi.fn().mockReturnValue({ limit: mockFindLimit });
      const mockFindFrom = vi.fn().mockReturnValue({ where: mockFindWhere });
      const mockFindSelect = vi.fn().mockReturnValue({ from: mockFindFrom });

      const mockDb = { select: mockFindSelect } as unknown as QueryContext['dbInstance'];
      const context: QueryContext = { dbInstance: mockDb };

      // Act
      const result = await NewsletterQuery.resubscribeAsync(mockEmail, context);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('unsubscribeAsync', () => {
    it('should set unsubscribedAt timestamp for normalized email', async () => {
      // Arrange
      const unsubscribedRecord = { ...mockRecord, unsubscribedAt: new Date('2024-02-01') };
      const mockReturning = vi.fn().mockResolvedValue([unsubscribedRecord]);
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
      const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
      const mockUpdate = vi.fn().mockReturnValue({ set: mockSet });

      const mockDb = { update: mockUpdate } as unknown as QueryContext['dbInstance'];
      const context: QueryContext = { dbInstance: mockDb };

      // Act
      const result = await NewsletterQuery.unsubscribeAsync(mockEmail, context);

      // Assert
      expect(normalizeEmail).toHaveBeenCalledWith(mockEmail);
      expect(mockUpdate).toHaveBeenCalledWith(newsletterSignups);
      expect(mockSet).toHaveBeenCalledWith({
        unsubscribedAt: expect.any(Date) as Date,
      });
      expect(mockWhere).toHaveBeenCalledWith(eq(newsletterSignups.email, mockNormalizedEmail));
      expect(mockReturning).toHaveBeenCalled();
      expect(result).toEqual(unsubscribedRecord);
      expect(result?.unsubscribedAt).not.toBeNull();
    });
  });

  describe('updateUserIdAsync', () => {
    it('should update userId only if currently null', async () => {
      // Arrange
      const recordWithNullUserId = { ...mockRecord, userId: null };
      const updatedRecord = { ...mockRecord, userId: mockUserId };

      // Mock findByEmailAsync
      const mockFindLimit = vi.fn().mockResolvedValue([recordWithNullUserId]);
      const mockFindWhere = vi.fn().mockReturnValue({ limit: mockFindLimit });
      const mockFindFrom = vi.fn().mockReturnValue({ where: mockFindWhere });
      const mockFindSelect = vi.fn().mockReturnValue({ from: mockFindFrom });

      // Mock update query
      const mockReturning = vi.fn().mockResolvedValue([updatedRecord]);
      const mockUpdateWhere = vi.fn().mockReturnValue({ returning: mockReturning });
      const mockSet = vi.fn().mockReturnValue({ where: mockUpdateWhere });
      const mockUpdate = vi.fn().mockReturnValue({ set: mockSet });

      const mockDb = {
        select: mockFindSelect,
        update: mockUpdate,
      } as unknown as QueryContext['dbInstance'];
      const context: QueryContext = { dbInstance: mockDb };

      // Act
      const result = await NewsletterQuery.updateUserIdAsync(mockEmail, mockUserId, context);

      // Assert
      expect(normalizeEmail).toHaveBeenCalledWith(mockEmail);
      expect(mockUpdate).toHaveBeenCalledWith(newsletterSignups);
      expect(mockSet).toHaveBeenCalledWith({
        userId: mockUserId,
      });
      expect(mockUpdateWhere).toHaveBeenCalledWith(eq(newsletterSignups.email, mockNormalizedEmail));
      expect(mockReturning).toHaveBeenCalled();
      expect(result).toEqual(updatedRecord);
      expect(result?.userId).toBe(mockUserId);
    });

    it('should return null when userId already set (idempotent check)', async () => {
      // Arrange - findByEmailAsync returns record with existing userId
      const recordWithUserId = { ...mockRecord, userId: 'existing-user-id' };
      const mockFindLimit = vi.fn().mockResolvedValue([recordWithUserId]);
      const mockFindWhere = vi.fn().mockReturnValue({ limit: mockFindLimit });
      const mockFindFrom = vi.fn().mockReturnValue({ where: mockFindWhere });
      const mockFindSelect = vi.fn().mockReturnValue({ from: mockFindFrom });

      const mockDb = { select: mockFindSelect } as unknown as QueryContext['dbInstance'];
      const context: QueryContext = { dbInstance: mockDb };

      // Act
      const result = await NewsletterQuery.updateUserIdAsync(mockEmail, mockUserId, context);

      // Assert
      expect(result).toBeNull();
    });

    it('should return null when email does not exist', async () => {
      // Arrange - findByEmailAsync returns null
      const mockFindLimit = vi.fn().mockResolvedValue([]);
      const mockFindWhere = vi.fn().mockReturnValue({ limit: mockFindLimit });
      const mockFindFrom = vi.fn().mockReturnValue({ where: mockFindWhere });
      const mockFindSelect = vi.fn().mockReturnValue({ from: mockFindFrom });

      const mockDb = { select: mockFindSelect } as unknown as QueryContext['dbInstance'];
      const context: QueryContext = { dbInstance: mockDb };

      // Act
      const result = await NewsletterQuery.updateUserIdAsync(mockEmail, mockUserId, context);

      // Assert
      expect(result).toBeNull();
    });
  });
});
