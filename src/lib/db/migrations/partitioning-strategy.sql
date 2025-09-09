-- Table Partitioning Strategy for Head Shakers Platform
-- ======================================================
-- This file outlines the partitioning strategy for high-volume tables
-- to ensure scalability as the platform grows.

-- WHEN TO IMPLEMENT:
-- Partitioning should be implemented when tables reach:
-- - 10+ million rows
-- - Query performance degrades significantly
-- - Maintenance operations (VACUUM, REINDEX) take too long
-- - Backup/restore times become problematic

-- ============================================================
-- 1. USER ACTIVITY TABLE PARTITIONING (Range by created_at)
-- ============================================================
-- This table logs all user actions and grows rapidly

-- Step 1: Create partitioned table structure
CREATE TABLE user_activity_partitioned (
    LIKE user_activity INCLUDING ALL
) PARTITION BY RANGE (created_at);

-- Step 2: Create monthly partitions
CREATE TABLE user_activity_2024_01 PARTITION OF user_activity_partitioned
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE user_activity_2024_02 PARTITION OF user_activity_partitioned
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');

-- Continue for all months...

-- Step 3: Create future partitions automatically
CREATE OR REPLACE FUNCTION create_monthly_user_activity_partition()
RETURNS void AS $$
DECLARE
    partition_date DATE;
    partition_name TEXT;
    start_date DATE;
    end_date DATE;
BEGIN
    partition_date := DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month');
    partition_name := 'user_activity_' || TO_CHAR(partition_date, 'YYYY_MM');
    start_date := partition_date;
    end_date := partition_date + INTERVAL '1 month';
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_class 
        WHERE relname = partition_name
    ) THEN
        EXECUTE format(
            'CREATE TABLE %I PARTITION OF user_activity_partitioned 
            FOR VALUES FROM (%L) TO (%L)',
            partition_name, start_date, end_date
        );
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Schedule this function to run monthly via pg_cron or external scheduler
-- SELECT cron.schedule('create-user-activity-partitions', '0 0 1 * *', 
--   'SELECT create_monthly_user_activity_partition()');

-- ============================================================
-- 2. CONTENT VIEWS TABLE PARTITIONING (Range by viewed_at)
-- ============================================================
-- High-volume analytics table

CREATE TABLE content_views_partitioned (
    LIKE content_views INCLUDING ALL
) PARTITION BY RANGE (viewed_at);

-- Create weekly partitions for recent data (higher granularity)
CREATE TABLE content_views_2024_w01 PARTITION OF content_views_partitioned
    FOR VALUES FROM ('2024-01-01') TO ('2024-01-08');

-- Older data can use monthly partitions
CREATE TABLE content_views_2023_12 PARTITION OF content_views_partitioned
    FOR VALUES FROM ('2023-12-01') TO ('2024-01-01');

-- ============================================================
-- 3. NOTIFICATIONS TABLE PARTITIONING (List by is_read)
-- ============================================================
-- Partition by read status for better query performance

CREATE TABLE notifications_partitioned (
    LIKE notifications INCLUDING ALL
) PARTITION BY LIST (is_read);

CREATE TABLE notifications_unread PARTITION OF notifications_partitioned
    FOR VALUES IN (false);

CREATE TABLE notifications_read PARTITION OF notifications_partitioned
    FOR VALUES IN (true);

-- Add sub-partitioning by date for read notifications
ALTER TABLE notifications_read PARTITION BY RANGE (created_at);

CREATE TABLE notifications_read_2024_01 PARTITION OF notifications_read
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- ============================================================
-- 4. LOGIN HISTORY TABLE PARTITIONING (Range by login_at)
-- ============================================================
-- Security audit trail that grows continuously

CREATE TABLE login_history_partitioned (
    LIKE login_history INCLUDING ALL
) PARTITION BY RANGE (login_at);

-- Quarterly partitions for login history
CREATE TABLE login_history_2024_q1 PARTITION OF login_history_partitioned
    FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');

CREATE TABLE login_history_2024_q2 PARTITION OF login_history_partitioned
    FOR VALUES FROM ('2024-04-01') TO ('2024-07-01');

-- ============================================================
-- 5. SEARCH QUERIES TABLE PARTITIONING (Hash by user_id)
-- ============================================================
-- Distribute by user for parallel query processing

CREATE TABLE search_queries_partitioned (
    LIKE search_queries INCLUDING ALL
) PARTITION BY HASH (user_id);

-- Create 8 hash partitions for even distribution
CREATE TABLE search_queries_p0 PARTITION OF search_queries_partitioned
    FOR VALUES WITH (MODULUS 8, REMAINDER 0);

CREATE TABLE search_queries_p1 PARTITION OF search_queries_partitioned
    FOR VALUES WITH (MODULUS 8, REMAINDER 1);

-- Continue for p2 through p7...

-- ============================================================
-- MIGRATION STRATEGY
-- ============================================================

-- Step-by-step migration process for existing tables:

-- 1. Create partitioned table structure
-- 2. Copy existing data (can be done in batches)
INSERT INTO user_activity_partitioned 
SELECT * FROM user_activity 
WHERE created_at >= '2024-01-01';

-- 3. Set up triggers to sync new data during transition
CREATE OR REPLACE FUNCTION sync_to_partitioned_table()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_activity_partitioned VALUES (NEW.*);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_user_activity_to_partitioned
AFTER INSERT ON user_activity
FOR EACH ROW EXECUTE FUNCTION sync_to_partitioned_table();

-- 4. Once caught up, in a transaction:
BEGIN;
    -- Rename tables
    ALTER TABLE user_activity RENAME TO user_activity_old;
    ALTER TABLE user_activity_partitioned RENAME TO user_activity;
    
    -- Drop sync trigger
    DROP TRIGGER sync_user_activity_to_partitioned ON user_activity_old;
COMMIT;

-- 5. Verify and drop old table when confident
-- DROP TABLE user_activity_old;

-- ============================================================
-- PARTITION MAINTENANCE
-- ============================================================

-- Function to drop old partitions (data retention)
CREATE OR REPLACE FUNCTION drop_old_partitions(
    table_name TEXT,
    retention_months INTEGER DEFAULT 12
)
RETURNS void AS $$
DECLARE
    partition RECORD;
    cutoff_date DATE;
BEGIN
    cutoff_date := CURRENT_DATE - (retention_months || ' months')::INTERVAL;
    
    FOR partition IN 
        SELECT schemaname, tablename 
        FROM pg_tables 
        WHERE tablename LIKE table_name || '_%'
        AND tablename ~ '\d{4}_\d{2}$'
    LOOP
        -- Extract date from partition name and check if old
        -- Implementation depends on naming convention
        EXECUTE format('DROP TABLE IF EXISTS %I.%I', 
                      partition.schemaname, partition.tablename);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup via pg_cron
-- SELECT cron.schedule('cleanup-old-partitions', '0 2 1 * *', 
--   'SELECT drop_old_partitions(''user_activity'', 12)');

-- ============================================================
-- MONITORING QUERIES
-- ============================================================

-- Check partition sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
    pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
FROM pg_tables
WHERE tablename LIKE '%_partitioned%' 
   OR tablename ~ '^\w+_\d{4}_'
ORDER BY size_bytes DESC;

-- Check partition pruning effectiveness
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM user_activity_partitioned 
WHERE created_at >= '2024-01-01' AND created_at < '2024-02-01';

-- ============================================================
-- BENEFITS OF THIS PARTITIONING STRATEGY
-- ============================================================
-- 1. Improved query performance through partition pruning
-- 2. Faster maintenance operations (VACUUM, REINDEX per partition)
-- 3. Easier data archival and retention management
-- 4. Parallel query execution across partitions
-- 5. Reduced lock contention during writes
-- 6. Smaller indexes per partition = better cache utilization

-- ============================================================
-- IMPLEMENTATION CHECKLIST
-- ============================================================
-- [ ] Set up monitoring for table sizes
-- [ ] Implement automated partition creation
-- [ ] Test migration process on staging environment
-- [ ] Create rollback plan
-- [ ] Update application queries if needed
-- [ ] Set up partition maintenance jobs
-- [ ] Document partition naming conventions
-- [ ] Train team on partition management