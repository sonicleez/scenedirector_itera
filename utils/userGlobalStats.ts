/**
 * User Stats & Generated Images Persistence
 * 
 * Manages user-level statistics separate from project-level data
 * Ensures stats persist across project switches
 */

import { supabase } from './supabaseClient';

/**
 * User-level statistics structure
 * Separate from project stats - accumulates across ALL projects
 */
export interface UserGlobalStats {
    // Image generation counts
    totalImages: number;
    scenesGenerated: number;
    charactersGenerated: number;
    productsGenerated: number;
    conceptsGenerated: number;

    // Provider breakdown
    geminiImages: number;
    gommoImages: number;

    // Resolution breakdown
    resolution1K: number;
    resolution2K: number;
    resolution4K: number;

    // Token usage
    textTokens: number;
    promptTokens: number;
    candidateTokens: number;
    textCalls: number;

    // Image usage
    estimatedImagePromptTokens: number;

    // Metadata
    firstGenerationAt: string;
    lastGenerationAt: string;
    projectCount: number;
}

/**
 * Generated image record for history
 */
export interface GeneratedImageRecord {
    id: string;
    user_id: string;
    project_id: string;

    // Image data
    image_url: string; // Supabase Storage URL
    thumbnail_url?: string;

    // Generation context
    generation_type: 'scene' | 'character' | 'product' | 'concept';
    scene_id?: string;
    character_id?: string;
    product_id?: string;

    // Prompt info
    prompt: string;
    model_id: string;
    model_type: string;
    aspect_ratio: string;
    resolution: string;

    // Quality
    quality_score?: number;
    was_liked?: boolean;

    // Metadata
    created_at: string;
}

/**
 * Get user's global stats from Supabase
 */
export async function getUserGlobalStats(userId: string): Promise<UserGlobalStats | null> {
    if (!userId) return null;

    try {
        const { data, error } = await supabase
            .from('user_global_stats')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) {
            // If not found, return default stats
            if (error.code === 'PGRST116') {
                return getDefaultGlobalStats();
            }
            throw error;
        }

        return data?.stats || getDefaultGlobalStats();
    } catch (e) {
        console.warn('[UserStats] Failed to fetch global stats:', e);
        return getDefaultGlobalStats();
    }
}

/**
 * Update user's global stats
 */
export async function updateUserGlobalStats(
    userId: string,
    updates: Partial<UserGlobalStats>
): Promise<boolean> {
    if (!userId) return false;

    try {
        // Get current stats
        const current = await getUserGlobalStats(userId) || getDefaultGlobalStats();

        // Merge updates
        const newStats: UserGlobalStats = {
            ...current,
            ...updates,
            lastGenerationAt: new Date().toISOString()
        };

        // Upsert to database
        const { error } = await supabase
            .from('user_global_stats')
            .upsert({
                user_id: userId,
                stats: newStats,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });

        if (error) {
            console.error('[UserStats] Failed to update global stats:', error);
            return false;
        }

        console.log('[UserStats] ✅ Global stats updated');
        return true;
    } catch (e) {
        console.error('[UserStats] Exception updating stats:', e);
        return false;
    }
}

/**
 * Increment specific stat counters
 */
export async function incrementGlobalStats(
    userId: string,
    increments: {
        images?: number;
        scenes?: number;
        characters?: number;
        products?: number;
        concepts?: number;
        gemini?: number;
        gommo?: number;
        resolution1K?: number;
        resolution2K?: number;
        resolution4K?: number;
        textTokens?: number;
        promptTokens?: number;
        candidateTokens?: number;
        textCalls?: number;
    }
): Promise<boolean> {
    if (!userId) return false;

    try {
        const current = await getUserGlobalStats(userId) || getDefaultGlobalStats();

        const updates: Partial<UserGlobalStats> = {
            totalImages: current.totalImages + (increments.images || 0),
            scenesGenerated: current.scenesGenerated + (increments.scenes || 0),
            charactersGenerated: current.charactersGenerated + (increments.characters || 0),
            productsGenerated: current.productsGenerated + (increments.products || 0),
            conceptsGenerated: current.conceptsGenerated + (increments.concepts || 0),
            geminiImages: current.geminiImages + (increments.gemini || 0),
            gommoImages: current.gommoImages + (increments.gommo || 0),
            resolution1K: current.resolution1K + (increments.resolution1K || 0),
            resolution2K: current.resolution2K + (increments.resolution2K || 0),
            resolution4K: current.resolution4K + (increments.resolution4K || 0),
            textTokens: current.textTokens + (increments.textTokens || 0),
            promptTokens: current.promptTokens + (increments.promptTokens || 0),
            candidateTokens: current.candidateTokens + (increments.candidateTokens || 0),
            textCalls: current.textCalls + (increments.textCalls || 0),
        };

        return await updateUserGlobalStats(userId, updates);
    } catch (e) {
        console.error('[UserStats] Failed to increment stats:', e);
        return false;
    }
}

/**
 * Record a generated image to history
 */
export async function recordGeneratedImage(
    userId: string,
    imageData: {
        projectId: string;
        imageUrl: string;
        generationType: 'scene' | 'character' | 'product' | 'concept';
        sceneId?: string;
        characterId?: string;
        productId?: string;
        prompt: string;
        modelId: string;
        modelType: string;
        aspectRatio: string;
        resolution: string;
    }
): Promise<string | null> {
    if (!userId || !imageData.imageUrl) return null;

    try {
        const record = {
            user_id: userId,
            project_id: imageData.projectId,
            image_url: imageData.imageUrl,
            generation_type: imageData.generationType,
            scene_id: imageData.sceneId,
            character_id: imageData.characterId,
            product_id: imageData.productId,
            prompt: imageData.prompt?.substring(0, 2000), // Limit prompt length
            model_id: imageData.modelId,
            model_type: imageData.modelType,
            aspect_ratio: imageData.aspectRatio,
            resolution: imageData.resolution,
        };

        const { data, error } = await supabase
            .from('generated_images_history')
            .insert(record)
            .select('id')
            .single();

        if (error) {
            console.error('[UserStats] Failed to record generated image:', error);
            return null;
        }

        console.log('[UserStats] ✅ Image recorded:', data.id);
        return data.id;
    } catch (e) {
        console.error('[UserStats] Exception recording image:', e);
        return null;
    }
}

/**
 * Get user's generated image history
 */
export async function getGeneratedImagesHistory(
    userId: string,
    options: {
        limit?: number;
        offset?: number;
        generationType?: 'scene' | 'character' | 'product' | 'concept';
        projectId?: string;
    } = {}
): Promise<GeneratedImageRecord[]> {
    if (!userId) return [];

    try {
        let query = supabase
            .from('generated_images_history')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(options.limit || 50);

        if (options.offset) {
            query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
        }

        if (options.generationType) {
            query = query.eq('generation_type', options.generationType);
        }

        if (options.projectId) {
            query = query.eq('project_id', options.projectId);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data || [];
    } catch (e) {
        console.error('[UserStats] Failed to fetch image history:', e);
        return [];
    }
}

/**
 * Get default empty stats
 */
function getDefaultGlobalStats(): UserGlobalStats {
    return {
        totalImages: 0,
        scenesGenerated: 0,
        charactersGenerated: 0,
        productsGenerated: 0,
        conceptsGenerated: 0,
        geminiImages: 0,
        gommoImages: 0,
        resolution1K: 0,
        resolution2K: 0,
        resolution4K: 0,
        textTokens: 0,
        promptTokens: 0,
        candidateTokens: 0,
        textCalls: 0,
        estimatedImagePromptTokens: 0,
        firstGenerationAt: new Date().toISOString(),
        lastGenerationAt: new Date().toISOString(),
        projectCount: 0
    };
}

console.log('[UserStats] Global stats module loaded');
