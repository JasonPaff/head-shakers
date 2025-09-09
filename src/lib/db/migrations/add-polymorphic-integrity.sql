-- Polymorphic Referential Integrity Triggers
-- These triggers ensure that polymorphic relationships point to valid records

-- 1. Function to validate polymorphic targets for likes
CREATE OR REPLACE FUNCTION validate_like_target()
RETURNS TRIGGER AS $$
BEGIN
  CASE NEW.target_type
    WHEN 'bobblehead' THEN 
      IF NOT EXISTS (SELECT 1 FROM bobbleheads WHERE id = NEW.target_id AND is_deleted = false) THEN
        RAISE EXCEPTION 'Invalid bobblehead target_id: %', NEW.target_id;
      END IF;
    WHEN 'collection' THEN
      IF NOT EXISTS (SELECT 1 FROM collections WHERE id = NEW.target_id AND is_deleted = false) THEN  
        RAISE EXCEPTION 'Invalid collection target_id: %', NEW.target_id;
      END IF;
    WHEN 'comment' THEN
      IF NOT EXISTS (SELECT 1 FROM comments WHERE id = NEW.target_id AND is_deleted = false) THEN  
        RAISE EXCEPTION 'Invalid comment target_id: %', NEW.target_id;
      END IF;
    ELSE
      RAISE EXCEPTION 'Invalid target_type: %', NEW.target_type;
  END CASE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for likes table
DROP TRIGGER IF EXISTS validate_like_target_trigger ON likes;
CREATE TRIGGER validate_like_target_trigger
  BEFORE INSERT OR UPDATE OF target_id, target_type
  ON likes
  FOR EACH ROW
  EXECUTE FUNCTION validate_like_target();

-- 2. Function to validate polymorphic targets for comments
CREATE OR REPLACE FUNCTION validate_comment_target()
RETURNS TRIGGER AS $$
BEGIN
  CASE NEW.target_type
    WHEN 'bobblehead' THEN 
      IF NOT EXISTS (SELECT 1 FROM bobbleheads WHERE id = NEW.target_id AND is_deleted = false) THEN
        RAISE EXCEPTION 'Invalid bobblehead target_id: %', NEW.target_id;
      END IF;
    WHEN 'collection' THEN
      IF NOT EXISTS (SELECT 1 FROM collections WHERE id = NEW.target_id AND is_deleted = false) THEN  
        RAISE EXCEPTION 'Invalid collection target_id: %', NEW.target_id;
      END IF;
    WHEN 'comment' THEN
      -- Ensure not self-referencing and parent exists
      IF NEW.target_id = NEW.id THEN
        RAISE EXCEPTION 'Comment cannot reference itself';
      END IF;
      IF NOT EXISTS (SELECT 1 FROM comments WHERE id = NEW.target_id AND is_deleted = false) THEN  
        RAISE EXCEPTION 'Invalid parent comment target_id: %', NEW.target_id;
      END IF;
    ELSE
      RAISE EXCEPTION 'Invalid target_type: %', NEW.target_type;
  END CASE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for comments table
DROP TRIGGER IF EXISTS validate_comment_target_trigger ON comments;
CREATE TRIGGER validate_comment_target_trigger
  BEFORE INSERT OR UPDATE OF target_id, target_type
  ON comments
  FOR EACH ROW
  EXECUTE FUNCTION validate_comment_target();

-- 3. Function to validate polymorphic targets for content_views
CREATE OR REPLACE FUNCTION validate_content_view_target()
RETURNS TRIGGER AS $$
BEGIN
  CASE NEW.target_type
    WHEN 'bobblehead' THEN 
      IF NOT EXISTS (SELECT 1 FROM bobbleheads WHERE id = NEW.target_id) THEN
        RAISE EXCEPTION 'Invalid bobblehead target_id: %', NEW.target_id;
      END IF;
    WHEN 'collection' THEN
      IF NOT EXISTS (SELECT 1 FROM collections WHERE id = NEW.target_id) THEN  
        RAISE EXCEPTION 'Invalid collection target_id: %', NEW.target_id;
      END IF;
    WHEN 'user' THEN
      IF NOT EXISTS (SELECT 1 FROM users WHERE id = NEW.target_id) THEN  
        RAISE EXCEPTION 'Invalid user target_id: %', NEW.target_id;
      END IF;
    ELSE
      RAISE EXCEPTION 'Invalid target_type: %', NEW.target_type;
  END CASE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for content_views table
DROP TRIGGER IF EXISTS validate_content_view_target_trigger ON content_views;
CREATE TRIGGER validate_content_view_target_trigger
  BEFORE INSERT OR UPDATE OF target_id, target_type
  ON content_views
  FOR EACH ROW
  EXECUTE FUNCTION validate_content_view_target();

-- 4. Function to cascade soft deletes to polymorphic relationships
CREATE OR REPLACE FUNCTION cascade_soft_delete_to_polymorphic()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_deleted = true AND OLD.is_deleted = false THEN
    -- Update likes
    UPDATE likes 
    SET is_deleted = true, deleted_at = NOW()
    WHERE target_id = NEW.id 
      AND target_type = TG_ARGV[0]
      AND is_deleted = false;
    
    -- Update comments
    UPDATE comments 
    SET is_deleted = true, deleted_at = NOW()
    WHERE target_id = NEW.id 
      AND target_type = TG_ARGV[0]
      AND is_deleted = false;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for each table that can be referenced polymorphically
DROP TRIGGER IF EXISTS cascade_bobblehead_soft_delete ON bobbleheads;
CREATE TRIGGER cascade_bobblehead_soft_delete
  AFTER UPDATE OF is_deleted
  ON bobbleheads
  FOR EACH ROW
  EXECUTE FUNCTION cascade_soft_delete_to_polymorphic('bobblehead');

DROP TRIGGER IF EXISTS cascade_collection_soft_delete ON collections;
CREATE TRIGGER cascade_collection_soft_delete
  AFTER UPDATE OF is_deleted
  ON collections
  FOR EACH ROW
  EXECUTE FUNCTION cascade_soft_delete_to_polymorphic('collection');

DROP TRIGGER IF EXISTS cascade_comment_soft_delete ON comments;
CREATE TRIGGER cascade_comment_soft_delete
  AFTER UPDATE OF is_deleted
  ON comments
  FOR EACH ROW
  EXECUTE FUNCTION cascade_soft_delete_to_polymorphic('comment');

-- 5. Function to prevent comment nesting depth exceeding limit
CREATE OR REPLACE FUNCTION check_comment_nesting_depth()
RETURNS TRIGGER AS $$
DECLARE
  parent_depth INTEGER;
  max_depth CONSTANT INTEGER := 5;
BEGIN
  IF NEW.target_type = 'comment' THEN
    -- Calculate parent comment depth
    WITH RECURSIVE comment_tree AS (
      SELECT id, target_id, target_type, 1 as depth
      FROM comments
      WHERE id = NEW.target_id
      
      UNION ALL
      
      SELECT c.id, c.target_id, c.target_type, ct.depth + 1
      FROM comments c
      JOIN comment_tree ct ON c.id = ct.target_id AND ct.target_type = 'comment'
    )
    SELECT MAX(depth) INTO parent_depth FROM comment_tree;
    
    IF parent_depth >= max_depth THEN
      RAISE EXCEPTION 'Comment nesting depth cannot exceed %', max_depth;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for comment nesting depth
DROP TRIGGER IF EXISTS check_comment_nesting_trigger ON comments;
CREATE TRIGGER check_comment_nesting_trigger
  BEFORE INSERT
  ON comments
  FOR EACH ROW
  EXECUTE FUNCTION check_comment_nesting_depth();

-- Index to optimize polymorphic lookups
CREATE INDEX IF NOT EXISTS idx_likes_polymorphic_lookup 
  ON likes(target_type, target_id, is_deleted);
  
CREATE INDEX IF NOT EXISTS idx_comments_polymorphic_lookup 
  ON comments(target_type, target_id, is_deleted);
  
CREATE INDEX IF NOT EXISTS idx_content_views_polymorphic_lookup 
  ON content_views(target_type, target_id);