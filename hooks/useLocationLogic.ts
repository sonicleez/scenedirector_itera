
import { useCallback, useState } from 'react';
import { ProjectState, Location } from '../types';
import { generateId } from '../utils/helpers';
import { callCharacterImageAPI } from '../utils/geminiUtils';
import { uploadImageToSupabase } from '../utils/storageUtils';
import { recordPrompt } from '../utils/dopLearning';

export function useLocationLogic(
    state: ProjectState,
    updateStateAndRecord: (updater: (prevState: ProjectState) => ProjectState) => void,
    userApiKey: string | null,
    setApiKeyModalOpen: (open: boolean) => void,
    userId?: string
) {
    const [isGenerating, setIsGenerating] = useState<string | null>(null);

    const updateLocation = useCallback((id: string, updates: Partial<Location>) => {
        updateStateAndRecord(s => ({
            ...s,
            locations: (s.locations || []).map(loc => loc.id === id ? { ...loc, ...updates } : loc)
        }));
    }, [updateStateAndRecord]);

    const addLocation = useCallback((location: Location) => {
        updateStateAndRecord(s => ({
            ...s,
            locations: [...(s.locations || []), location]
        }));
    }, [updateStateAndRecord]);

    const deleteLocation = useCallback((id: string) => {
        updateStateAndRecord(s => ({
            ...s,
            locations: (s.locations || []).filter(loc => loc.id !== id),
            // Unlink any groups using this location
            sceneGroups: (s.sceneGroups || []).map(g =>
                g.locationId === id ? { ...g, locationId: undefined } : g
            )
        }));
    }, [updateStateAndRecord]);

    const handleGenerateLocationConcept = useCallback(async (locationId: string) => {
        const location = state.locations?.find(l => l.id === locationId);
        if (!location) return;

        const apiKey = userApiKey?.trim();
        if (!apiKey) {
            setApiKeyModalOpen(true);
            return;
        }

        setIsGenerating(locationId);

        try {
            // Build a descriptive prompt for the location
            const baseStyle = state.globalCharacterStyleId || 'cinematic';
            const prompt = location.conceptPrompt || `Concept art for a film location. 
            LOCATION: ${location.name}. 
            DESCRIPTION: ${location.description || 'A cinematic environment'}. 
            MOOD: ${location.mood || 'Cinematic, atmospheric'}. 
            STYLE: ${baseStyle}. 
            High quality, detailed environment concept art, wide shot, no characters.`;

            // NEW: Record prompt for DOP tracking
            const dopRecordId = await recordPrompt(
                userId || 'anonymous',
                prompt,
                prompt, // normalized
                'gemini-3-pro-image-preview', // modelId
                'scene', // mode
                '16:9',
                apiKey
            ) || undefined;

            // Use callCharacterImageAPI as it handles both Gemini and Gommo
            const imageUrl = await callCharacterImageAPI(
                apiKey,
                prompt,
                '16:9',
                'gemini-3-pro-image-preview', // Default to Gemini 3 for high quality concepts
                null,
                {
                    domain: state.gommoDomain || '',
                    accessToken: state.gommoAccessToken || ''
                }
            );

            if (imageUrl) {
                let finalUrl = imageUrl;

                // Sync to cloud if user is logged in
                if (userId && imageUrl.startsWith('data:')) {
                    try {
                        const cloudUrl = await uploadImageToSupabase(
                            imageUrl,
                            'project-assets',
                            `${userId}/locations/${locationId}_concept_${Date.now()}.jpg`
                        );
                        finalUrl = cloudUrl;
                    } catch (e) {
                        console.warn('[LocationLogic] Cloud upload failed, using base64:', e);
                    }
                }

                updateLocation(locationId, {
                    conceptImage: finalUrl,
                    dopRecordId: dopRecordId, // LINK DOP RECORD
                    rating: null, // Reset rating for new image
                    error: null
                });
            }
        } catch (error: any) {
            console.error('[LocationLogic] Generation failed:', error);
            updateLocation(locationId, { error: error.message || 'Generation failed' });
        } finally {
            setIsGenerating(null);
        }
    }, [state.locations, state.globalCharacterStyleId, state.gommoDomain, state.gommoAccessToken, userApiKey, setApiKeyModalOpen, userId, updateLocation]);

    const handleGenerateAllConcepts = useCallback(async () => {
        const missing = (state.locations || []).filter(l => !l.conceptImage);
        if (missing.length === 0) {
            alert('Tất cả bối cảnh đều đã có ảnh concept.');
            return;
        }

        const apiKey = userApiKey?.trim();
        if (!apiKey) {
            setApiKeyModalOpen(true);
            return;
        }

        // Process sequentially to avoid API overload
        for (const loc of missing) {
            await handleGenerateLocationConcept(loc.id);
        }
    }, [state.locations, userApiKey, setApiKeyModalOpen, handleGenerateLocationConcept]);

    const assignGroupsToLocation = useCallback((locationId: string, groupIds: string[]) => {
        updateStateAndRecord(s => ({
            ...s,
            sceneGroups: (s.sceneGroups || []).map(g => {
                // If group is in the new list, assign it. 
                // If it was assigned to THIS location but NOT in the new list, unassign it.
                if (groupIds.includes(g.id)) {
                    return { ...g, locationId };
                } else if (g.locationId === locationId) {
                    return { ...g, locationId: undefined };
                }
                return g;
            })
        }));
    }, [updateStateAndRecord]);

    return {
        isGenerating,
        addLocation,
        updateLocation,
        deleteLocation,
        handleGenerateLocationConcept,
        handleGenerateAllConcepts,
        assignGroupsToLocation
    };
}
