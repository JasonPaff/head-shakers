import type { PgSelect } from 'drizzle-orm/pg-core';

export const withPagination = <T extends PgSelect>(query: T, page: number = 1, limit: number = 20) => {
  const offset = (page - 1) * limit;
  return query.limit(limit).offset(offset);
};
