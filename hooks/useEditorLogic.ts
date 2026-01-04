import { useState, useCallback } from 'react';
import { ProjectState } from '../types';

interface UseEditorLogicProps {
    state: ProjectState;
    updateCharacter: (id: string, updates: any) => void;
    updateScene: (id: string, updates: any) => void;
    updateProduct: (id: string, updates: any) => void;
    updateLocation: (id: string, updates: any) => void;
    addToGallery: (image: string, type: string, prompt?: string, sourceId?: string) => void;
}

export const useEditorLogic = ({
    state,
    updateCharacter,
    updateScene,
    updateProduct,
    updateLocation,
    addToGallery
}: UseEditorLogicProps) => {
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingImage, setEditingImage] = useState<any>(null);

    const closeEditor = useCallback(() => {
        setIsEditorOpen(false);
        setEditingImage(null);
    }, []);

    const openEditor = useCallback((id: string, image: string, type: any, propIndex?: number, viewKey?: string) => {
        let editorHistory = undefined;
        if (type === 'scene') {
            editorHistory = state.scenes.find(s => s.id === id)?.editHistory;
        } else if (['master', 'face', 'body', 'side', 'back'].includes(type) || viewKey) {
            const char = state.characters.find(c => c.id === id);
            if (char) {
                const key = viewKey || type;
                if (key === 'master') editorHistory = char.masterEditHistory;
                else if (key === 'face') editorHistory = char.faceEditHistory;
                else if (key === 'body') editorHistory = char.bodyEditHistory;
                else if (key === 'side') editorHistory = char.sideEditHistory;
                else if (key === 'back') editorHistory = char.backEditHistory;
            }
        } else if (type === 'location') {
            editorHistory = state.locations?.find(l => l.id === id)?.editHistory;
        } else if (type === 'product') {
            const prod = state.products.find(p => p.id === id);
            if (prod) {
                if (viewKey && viewKey !== 'master') editorHistory = prod.viewEditHistories?.[viewKey];
                else editorHistory = prod.editHistory;
            }
        }

        setEditingImage({ id, image, type, propIndex, viewKey, history: editorHistory });
        setIsEditorOpen(true);
    }, [state.scenes, state.characters, state.products]);

    const handleEditorSave = useCallback((newImage: string, history: any[], savedViewKey?: string) => {
        if (!editingImage) return;
        const { id, type, propIndex, viewKey: initialViewKey } = editingImage;
        const viewKey = savedViewKey || initialViewKey;

        console.log('[Editor] Saving:', { type, id, viewKey, historyLength: history?.length });

        // Add edited image to gallery automatically
        addToGallery(newImage, 'edit', 'Edited version', id);

        if (type === 'prop' && typeof propIndex === 'number') {
            const char = state.characters.find(c => c.id === id);
            if (char) {
                const newProps = [...char.props];
                newProps[propIndex] = { ...newProps[propIndex], image: newImage };
                updateCharacter(id, { props: newProps });
            }
        }
        else if (type === 'master' || viewKey === 'master') updateCharacter(id, { masterImage: newImage, masterEditHistory: history });
        else if (type === 'face' || viewKey === 'face') updateCharacter(id, { faceImage: newImage, faceEditHistory: history });
        else if (type === 'body' || viewKey === 'body') updateCharacter(id, { bodyImage: newImage, bodyEditHistory: history });
        else if (type === 'side' || viewKey === 'side') updateCharacter(id, { sideImage: newImage, sideEditHistory: history });
        else if (type === 'back' || viewKey === 'back') updateCharacter(id, { backImage: newImage, backEditHistory: history });
        else if (type === 'scene') updateScene(id, { generatedImage: newImage, editHistory: history });
        else if (type === 'location') updateLocation(id, { conceptImage: newImage, editHistory: history });
        else if (type === 'product') {
            const product = state.products.find(p => p.id === id);
            if (product) {
                if (viewKey && viewKey !== 'master') {
                    const newViews = { ...product.views, [viewKey]: newImage };
                    const newViewHistories = { ...(product.viewEditHistories || {}), [viewKey]: history };
                    updateProduct(id, { views: newViews, viewEditHistories: newViewHistories });
                } else {
                    updateProduct(id, { masterImage: newImage, editHistory: history });
                }
            }
        }

        setEditingImage(null);
        setIsEditorOpen(false);
    }, [editingImage, state.characters, state.products, updateCharacter, updateScene, updateProduct, addToGallery]);

    return {
        isEditorOpen,
        editingImage,
        openEditor,
        closeEditor,
        handleEditorSave
    };
};
