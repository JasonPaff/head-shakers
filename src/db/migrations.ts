// TODO: add these indexes in a migration
// CREATE INDEX CONCURRENTLY users_active_email_idx ON users (email) WHERE is_deleted = false;
// CREATE INDEX CONCURRENTLY users_active_username_idx ON users (username) WHERE is_deleted = false;
// CREATE INDEX CONCURRENTLY users_active_clerk_id_idx ON users (clerk_id) WHERE is_deleted = false;

//ALTER TABLE users ADD CONSTRAINT users_email_format_check
//CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
