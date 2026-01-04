-- =============================================
-- USER GLOBAL STATS & IMAGE HISTORY TABLES
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. User Global Stats Table
-- Stores accumulated stats PER USER (not per project)
CREATE TABLE IF NOT EXISTS user_global_stats (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    stats JSONB NOT NULL DEFAULT '{
        "totalImages": 0,
        "scenesGenerated": 0,
        "charactersGenerated": 0,
        "productsGenerated": 0,
        "conceptsGenerated": 0,
        "geminiImages": 0,
        "gommoImages": 0,
        "resolution1K": 0,
        "resolution2K": 0,
        "resolution4K": 0,
        "textTokens": 0,
        "promptTokens": 0,
        "candidateTokens": 0,
        "textCalls": 0,
        "estimatedImagePromptTokens": 0,
        "projectCount": 0
    }',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Generated Images History Table
-- Stores ALL generated images across ALL projects for a user
CREATE TABLE IF NOT EXISTS generated_images_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id TEXT NOT NULL,
    
    -- Image data
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    
    -- Generation context
    generation_type TEXT NOT NULL CHECK (generation_type IN ('scene', 'character', 'product', 'concept')),
    scene_id TEXT,
    character_id TEXT,
    product_id TEXT,
    
    -- Prompt info
    prompt TEXT,
    model_id TEXT NOT NULL,
    model_type TEXT NOT NULL,
    aspect_ratio TEXT DEFAULT '16:9',
    resolution TEXT DEFAULT '1K',
    
    -- Quality
    quality_score REAL,
    was_liked BOOLEAN DEFAULT NULL,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_global_stats_user ON user_global_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_images_history_user ON generated_images_history(user_id);
CREATE INDEX IF NOT EXISTS idx_images_history_project ON generated_images_history(project_id);
CREATE INDEX IF NOT EXISTS idx_images_history_type ON generated_images_history(generation_type);
CREATE INDEX IF NOT EXISTS idx_images_history_created ON generated_images_history(created_at DESC);

-- 4. RLS Policies
ALTER TABLE user_global_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_images_history ENABLE ROW LEVEL SECURITY;

-- User Global Stats RLS
DROP POLICY IF EXISTS "Users can view own stats" ON user_global_stats;
DROP POLICY IF EXISTS "Users can insert own stats" ON user_global_stats;
DROP POLICY IF EXISTS "Users can update own stats" ON user_global_stats;

CREATE POLICY "Users can view own stats" ON user_global_stats
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats" ON user_global_stats
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stats" ON user_global_stats
    FOR UPDATE USING (auth.uid() = user_id);

-- Generated Images History RLS
DROP POLICY IF EXISTS "Users can view own images" ON generated_images_history;
DROP POLICY IF EXISTS "Users can insert own images" ON generated_images_history;
DROP POLICY IF EXISTS "Users can update own images" ON generated_images_history;
DROP POLICY IF EXISTS "Users can delete own images" ON generated_images_history;

CREATE POLICY "Users can view own images" ON generated_images_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own images" ON generated_images_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own images" ON generated_images_history
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own images" ON generated_images_history
    FOR DELETE USING (auth.uid() = user_id);

-- 5. Helpful Views
CREATE OR REPLACE VIEW user_usage_summary AS
SELECT 
    u.id as user_id,
    u.email,
    COALESCE((gs.stats->>'totalImages')::int, 0) as total_images,
    COALESCE((gs.stats->>'scenesGenerated')::int, 0) as scenes,
    COALESCE((gs.stats->>'charactersGenerated')::int, 0) as characters,
    COALESCE((gs.stats->>'geminiImages')::int, 0) as gemini_images,
    COALESCE((gs.stats->>'gommoImages')::int, 0) as gommo_images,
    COALESCE((gs.stats->>'textTokens')::int, 0) as text_tokens,
    (SELECT COUNT(*) FROM generated_images_history WHERE user_id = u.id) as history_count,
    gs.updated_at as last_activity
FROM auth.users u
LEFT JOIN user_global_stats gs ON u.id = gs.user_id;

-- 6. Function to get user's image count by type
CREATE OR REPLACE FUNCTION get_user_image_counts(target_user_id UUID)
RETURNS TABLE (
    generation_type TEXT,
    count BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        gih.generation_type,
        COUNT(*)
    FROM generated_images_history gih
    WHERE gih.user_id = target_user_id
    GROUP BY gih.generation_type;
END;
$$;

-- 7. Verify creation
SELECT 'User Global Stats tables created successfully!' AS status;
