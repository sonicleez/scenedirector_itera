/**
 * useResearchPresets
 * 
 * Hook for managing Research Presets (Director Notes + DOP Notes)
 * stored in Supabase for cloud sync across projects
 */

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

export interface ResearchPreset {
    id: string;
    user_id: string;
    name: string;
    director_notes: string;
    dop_notes: string;
    category?: string; // e.g., 'intellectual-crime', 'action', 'drama'
    created_at: string;
    updated_at: string;
}

interface UseResearchPresetsReturn {
    presets: ResearchPreset[];
    isLoading: boolean;
    error: string | null;
    loadPresets: () => Promise<void>;
    savePreset: (name: string, directorNotes: string, dopNotes: string, category?: string) => Promise<ResearchPreset | null>;
    updatePreset: (id: string, updates: Partial<Pick<ResearchPreset, 'name' | 'director_notes' | 'dop_notes' | 'category'>>) => Promise<boolean>;
    deletePreset: (id: string) => Promise<boolean>;
}

export function useResearchPresets(userId: string | null): UseResearchPresetsReturn {
    const [presets, setPresets] = useState<ResearchPreset[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load all presets for the current user
    const loadPresets = useCallback(async () => {
        if (!userId) {
            setPresets([]);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await supabase
                .from('research_presets')
                .select('*')
                .eq('user_id', userId)
                .order('updated_at', { ascending: false });

            if (fetchError) throw fetchError;
            setPresets(data || []);
        } catch (err: any) {
            console.error('[ResearchPresets] Load failed:', err);
            setError(err.message || 'Failed to load presets');
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    // Save a new preset
    const savePreset = useCallback(async (
        name: string,
        directorNotes: string,
        dopNotes: string,
        category?: string
    ): Promise<ResearchPreset | null> => {
        if (!userId) {
            setError('User not logged in');
            return null;
        }

        setIsLoading(true);
        setError(null);

        try {
            const { data, error: insertError } = await supabase
                .from('research_presets')
                .insert({
                    user_id: userId,
                    name,
                    director_notes: directorNotes,
                    dop_notes: dopNotes,
                    category
                })
                .select()
                .single();

            if (insertError) throw insertError;

            // Update local state
            setPresets(prev => [data, ...prev]);
            return data;
        } catch (err: any) {
            console.error('[ResearchPresets] Save failed:', err);
            setError(err.message || 'Failed to save preset');
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    // Update an existing preset
    const updatePreset = useCallback(async (
        id: string,
        updates: Partial<Pick<ResearchPreset, 'name' | 'director_notes' | 'dop_notes' | 'category'>>
    ): Promise<boolean> => {
        if (!userId) {
            setError('User not logged in');
            return false;
        }

        setIsLoading(true);
        setError(null);

        try {
            const { error: updateError } = await supabase
                .from('research_presets')
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq('id', id)
                .eq('user_id', userId);

            if (updateError) throw updateError;

            // Update local state
            setPresets(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
            return true;
        } catch (err: any) {
            console.error('[ResearchPresets] Update failed:', err);
            setError(err.message || 'Failed to update preset');
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    // Delete a preset
    const deletePreset = useCallback(async (id: string): Promise<boolean> => {
        if (!userId) {
            setError('User not logged in');
            return false;
        }

        setIsLoading(true);
        setError(null);

        try {
            const { error: deleteError } = await supabase
                .from('research_presets')
                .delete()
                .eq('id', id)
                .eq('user_id', userId);

            if (deleteError) throw deleteError;

            // Update local state
            setPresets(prev => prev.filter(p => p.id !== id));
            return true;
        } catch (err: any) {
            console.error('[ResearchPresets] Delete failed:', err);
            setError(err.message || 'Failed to delete preset');
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    // Auto-load presets when userId changes
    useEffect(() => {
        if (userId) {
            loadPresets();
        }
    }, [userId, loadPresets]);

    return {
        presets,
        isLoading,
        error,
        loadPresets,
        savePreset,
        updatePreset,
        deletePreset
    };
}
