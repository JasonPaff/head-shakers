---
argument-hint: 'operation description'
description: Quick access to the Neon Database Expert subagent for Head Shakers project database operations
model: haiku
---

# Database Command (/db)

Quick access to the Neon Database Expert subagent for Head Shakers project database operations.

## Usage

```
/db [operation description]
```

## Examples

```
/db list all tables
/db show schema for bobbleheads table
/db run migration for new collection_views table
/db check slow queries
/db optimize query performance for user dashboard
```

## Features

- **Automatic validation**: All database operations use validated Head Shakers project configuration
- **Branch safety**: Defaults to development branch with production protection
- **Comprehensive logging**: All operations logged to `docs/{date}/database/validation-log.md`
- **Expert guidance**: Specialized subagent for complex database operations

## Safety Features

- ✅ **Project isolation**: Enforces correct Head Shakers project ID (`misty-boat-49919732`)
- ✅ **Database defaults**: Auto-applies `head-shakers` database name
- ✅ **Branch protection**: Blocks sensitive operations on production branch
- ✅ **Operation logging**: Full audit trail of all database interactions

## Supported Operations

- Database schema management
- Query optimization and tuning
- Migration planning and execution
- Performance analysis
- Table structure analysis
- Slow query identification
- Connection management
- Branch operations (development/production)
