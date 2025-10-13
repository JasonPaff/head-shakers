-- ============================================================================
-- Migration: Move Feature Planner Tables to feature_planner Schema
-- ============================================================================
-- This migration moves all feature planner related tables and enums from the
-- 'public' schema to a dedicated 'feature_planner' schema for better
-- organization and separation of dev tools from production tables.
-- ============================================================================

-- ============================================================================
-- STEP 1: Create New Schema
-- ============================================================================
CREATE SCHEMA IF NOT EXISTS feature_planner;

-- ============================================================================
-- STEP 2: Move Enums to New Schema
-- ============================================================================
-- Enums must be moved before tables that reference them

-- Create enums in new schema
ALTER TYPE public.complexity SET SCHEMA feature_planner;
ALTER TYPE public.confidence_level SET SCHEMA feature_planner;
ALTER TYPE public.estimated_scope SET SCHEMA feature_planner;
ALTER TYPE public.execution_step SET SCHEMA feature_planner;
ALTER TYPE public.file_discovery_status SET SCHEMA feature_planner;
ALTER TYPE public.file_priority SET SCHEMA feature_planner;
ALTER TYPE public.implementation_plan_status SET SCHEMA feature_planner;
ALTER TYPE public.plan_status SET SCHEMA feature_planner;
ALTER TYPE public.refinement_status SET SCHEMA feature_planner;
ALTER TYPE public.risk_level SET SCHEMA feature_planner;
ALTER TYPE public.technical_complexity SET SCHEMA feature_planner;

-- ============================================================================
-- STEP 3: Move Tables to New Schema
-- ============================================================================
-- Move tables in dependency order (parent tables first)

ALTER TABLE public.feature_plans SET SCHEMA feature_planner;
ALTER TABLE public.feature_refinements SET SCHEMA feature_planner;
ALTER TABLE public.file_discovery_sessions SET SCHEMA feature_planner;
ALTER TABLE public.discovered_files SET SCHEMA feature_planner;
ALTER TABLE public.implementation_plan_generations SET SCHEMA feature_planner;
ALTER TABLE public.plan_steps SET SCHEMA feature_planner;
ALTER TABLE public.plan_step_templates SET SCHEMA feature_planner;
ALTER TABLE public.plan_execution_logs SET SCHEMA feature_planner;

-- ============================================================================
-- STEP 4: Grant Permissions (if needed)
-- ============================================================================
-- Grant schema usage to authenticated users (adjust as needed)
GRANT USAGE ON SCHEMA feature_planner TO PUBLIC;
GRANT ALL ON ALL TABLES IN SCHEMA feature_planner TO PUBLIC;
GRANT ALL ON ALL SEQUENCES IN SCHEMA feature_planner TO PUBLIC;

-- ============================================================================
-- Migration Complete
-- ============================================================================
-- All feature planner tables and enums have been moved to feature_planner schema
-- Cross-schema foreign keys to public.users remain functional
