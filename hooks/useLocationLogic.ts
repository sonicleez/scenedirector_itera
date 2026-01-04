
import { useCallback, useState } from 'react';
import { ProjectState, Location } from '../types';
import { generateId } from '../utils/helpers';
import { callCharacterImageAPI } from '../utils/geminiUtils';
import { uploadImageToSupabase } from '../utils/storageUtils';

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
            const prompt = `Concept art for a film location. 
            LOCATION: ${location.name}. 
            DESCRIPTION: ${location.description || 'A cinematic environment'}. 
            MOOD: ${location.mood || 'Cinematic, atmospheric'}. 
            STYLE: ${baseStyle}. 
            High quality, detailed environment concept art, wide shot, no characters.`;

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

                updateLocation(locationId, { conceptImage: finalUrl });
            }
        } catch (error) {
            console.error('[LocationLogic] Generation failed:', error);
            alert('Lỗi tạo ảnh concept cho bối cảnh.');
        } finally {
            setIsGenerating(null);
        }
    }, [state.locations, state.globalCharacterStyleId, state.gommoDomain, state.gommoAccessToken, userApiKey, setApiKeyModalOpen, userId, updateLocation]);

    return {
        isGenerating,
        addLocation,
        updateLocation,
        deleteLocation,
        handleGenerateLocationConcept
    };
}
