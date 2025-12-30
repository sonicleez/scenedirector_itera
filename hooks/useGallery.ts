import { useCallback } from 'react';
import { ProjectState } from '../types';

export const useGallery = (
    updateStateAndRecord: (fn: (s: ProjectState) => ProjectState) => void
) => {

    const addToGallery = useCallback((image: string, type: string, prompt?: string, sourceId?: string) => {
        updateStateAndRecord(s => ({
            ...s,
            assetGallery: [
                {
                    id: `asset_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                    image,
                    type,
                    prompt,
                    sourceId,
                    timestamp: Date.now()
                },
                ...(s.assetGallery || [])
            ].slice(0, 500) // Keep last 500 assets
        }));
    }, [updateStateAndRecord]);

    return { addToGallery };
};
