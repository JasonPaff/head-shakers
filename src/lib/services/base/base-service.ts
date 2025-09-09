import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';

import { db } from '@/lib/db';

/**
 * base service class providing common functionality for all domain services
 */
export abstract class BaseService {
  /**
   * execute a database transaction
   */
  protected static async executeTransaction<T>(
    operation: (tx: DatabaseExecutor) => Promise<T>,
    dbInstance?: DatabaseExecutor,
  ): Promise<T> {
    const dbConn = this.getDbInstance(dbInstance);

    if ('transaction' in dbConn) {
      return dbConn.transaction(operation);
    }

    // already in a transaction
    return operation(dbConn);
  }

  /**
   * get the database instance to use (transaction or main db)
   */
  protected static getDbInstance(dbInstance?: DatabaseExecutor): DatabaseExecutor {
    return dbInstance ?? db;
  }

  /**
   * validate ownership of a record
   */
  protected static validateOwnership(recordUserId: string, currentUserId: string, operation: string): void {
    if (recordUserId !== currentUserId) {
      throw new Error(`User does not have permission to ${operation}`);
    }
  }

  /**
   * validate that required parameters are provided
   */
  protected static validateRequired<T>(value: null | T | undefined, fieldName: string): asserts value is T {
    if (value === null || value === undefined) {
      throw new Error(`${fieldName} is required`);
    }
  }

  /**
   * validate that a user ID is provided
   */
  protected static validateUserId(
    userId: null | string | undefined,
    operation: string,
  ): asserts userId is string {
    if (!userId) {
      throw new Error(`User ID is required for ${operation}`);
    }
  }
}
