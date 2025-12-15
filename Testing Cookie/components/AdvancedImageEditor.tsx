import React, { useState } from 'react';
import { DetectedObject, EditHistory, EditingMode } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

interface AdvancedImageEditorProps {
    isOpen: boolean;
    onClose: () => void;
    sourceImage: string;
    onSave: (editedImage: string) => void;
    apiKey: string;
}

const generateId = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const AdvancedImageEditor: React.FC<AdvancedImageEditorProps> = ({
    isOpen,
    onClose,
    sourceImage,
    onSave,
    apiKey
}) => {
    // State
    const [editMode, setEditMode] = useState<EditingMode>('remove');
    const [detectedObjects, setDetectedObjects] = useState<DetectedObject[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editPrompt, setEditPrompt] = useState('');
    const [referenceImage, setReferenceImage] = useState<string | null>(null);
    const [currentImage, setCurrentImage] = useState(sourceImage);
    const [history, setHistory] = useState<EditHistory[]>([
        { id: generateId(), image: sourceImage, timestamp: Date.now(), operation: 'Original' }
    ]);
    const [error, setError] = useState<string | null>(null);

    // Object Detection
    const handleAnalyzeImage = async () => {
        if (!apiKey) {
            setError('API Key required');
            return;
        }

        setIsAnalyzing(true);
        setError(null);

        try {
            const ai = new GoogleGenAI({ apiKey });

            // Extract base64 from data URL
            const base64Data = currentImage.split(',')[1];

            const prompt = `
Analyze this image and detect ALL visible objects, people, and elements.

For each object, provide:
- name: Object type (person, car, tree, building, etc.)
- description: Brief visual description  
- position: Location in image (left/center/right, top/middle/bottom)

Return as JSON array. Be thorough and detect even background objects.
            `.trim();

            const response = await ai.models.generateContent({
                model: 'gemini-2.0-flash-exp',
                contents: {
                    parts: [
                        { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
                        { text: prompt }
                    ]
                },
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                description: { type: Type.STRING },
                                position: { type: Type.STRING }
                            }
                        }
                    }
                }
            });

            const objects = JSON.parse(response.text || '[]');
            const detectedWithIds = objects.map((obj: any) => ({
                id: generateId(),
                ...obj,
                selected: false
            }));

            setDetectedObjects(detectedWithIds);
            console.log('✅ Detected objects:', detectedWithIds);
        } catch (err: any) {
            console.error('Object detection failed:', err);
            setError(err.message || 'Failed to analyze image');
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Object Removal
    const handleRemoveObjects = async () => {
        const selectedObjects = detectedObjects.filter(obj => obj.selected);

        if (selectedObjects.length === 0) {
            setError('Please select objects to remove');
            return;
        }

        setIsEditing(true);
        setError(null);

        try {
            const ai = new GoogleGenAI({ apiKey });
            const base64Data = currentImage.split(',')[1];

            const objectList = selectedObjects.map(obj => `${obj.name} (${obj.description})`).join(', ');

            const prompt = `
TASK: Remove the following objects from this image:
${objectList}

REQUIREMENTS:
- Seamlessly inpaint/fill the removed areas with appropriate background
- Maintain consistent lighting, shadows, and perspective
- Preserve all other objects exactly as they are
- Make the removal look completely natural
- Keep the same image composition and style

Generate the edited image with specified objects cleanly removed.
            `.trim();

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: {
                    parts: [
                        { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
                        { text: prompt }
                    ]
                }
            });

            const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
            if (imagePart?.inlineData) {
                const newImage = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
                setCurrentImage(newImage);

                // Add to history
                const newHistoryEntry: EditHistory = {
                    id: generateId(),
                    image: newImage,
                    timestamp: Date.now(),
                    operation: `Removed: ${selectedObjects.map(o => o.name).join(', ')}`
                };
                setHistory([...history, newHistoryEntry]);

                // Clear selection
                setDetectedObjects(detectedObjects.map(obj => ({ ...obj, selected: false })));
            } else {
                throw new Error('No image returned from AI');
            }
        } catch (err: any) {
            console.error('Remove failed:', err);
            setError(err.message || 'Failed to remove objects');
        } finally {
            setIsEditing(false);
        }
    };

    // Style Transfer
    const handleStyleTransfer = async () => {
        if (!referenceImage) {
            setError('Please upload a reference image');
            return;
        }

        setIsEditing(true);
        setError(null);

        try {
            const ai = new GoogleGenAI({ apiKey });
            const sourceBase64 = currentImage.split(',')[1];
            const refBase64 = referenceImage.split(',')[1];

            const prompt = `
Apply the artistic style from the reference image (second image) to the source image (first image).

REQUIREMENTS:
- Transfer visual style, color palette, lighting, and artistic treatment
- Preserve the content and composition of the source image
- Match texture and rendering technique
- Keep all objects and subjects recognizable
- Apply style consistently across entire image

Generate the source image with the reference image's style applied.
            `.trim();

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: {
                    parts: [
                        { inlineData: { data: sourceBase64, mimeType: 'image/jpeg' } },
                        { inlineData: { data: refBase64, mimeType: 'image/jpeg' } },
                        { text: prompt }
                    ]
                }
            });

            const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
            if (imagePart?.inlineData) {
                const newImage = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
                setCurrentImage(newImage);

                const newHistoryEntry: EditHistory = {
                    id: generateId(),
                    image: newImage,
                    timestamp: Date.now(),
                    operation: 'Style transfer applied'
                };
                setHistory([...history, newHistoryEntry]);
            } else {
                throw new Error('No image returned from AI');
            }
        } catch (err: any) {
            console.error('Style transfer failed:', err);
            setError(err.message || 'Failed to apply style');
        } finally {
            setIsEditing(false);
        }
    };

    // Text-based editing
    const handleTextEdit = async () => {
        if (!editPrompt.trim()) {
            setError('Please describe what you want to change');
            return;
        }

        setIsEditing(true);
        setError(null);

        try {
            const ai = new GoogleGenAI({ apiKey });
            const base64Data = currentImage.split(',')[1];

            const prompt = `
Edit this image based on the following instruction:
"${editPrompt}"

REQUIREMENTS:
- Follow the instruction precisely
- Maintain overall image quality and style
- Make changes look natural and seamless
- Preserve unaffected areas exactly as they are

Generate the edited image.
            `.trim();

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: {
                    parts: [
                        { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
                        { text: prompt }
                    ]
                }
            });

            const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
            if (imagePart?.inlineData) {
                const newImage = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
                setCurrentImage(newImage);

                const newHistoryEntry: EditHistory = {
                    id: generateId(),
                    image: newImage,
                    timestamp: Date.now(),
                    operation: editPrompt
                };
                setHistory([...history, newHistoryEntry]);
                setEditPrompt('');
            } else {
                throw new Error('No image returned from AI');
            }
        } catch (err: any) {
            console.error('Text edit failed:', err);
            setError(err.message || 'Failed to edit image');
        } finally {
            setIsEditing(false);
        }
    };

    // Reference image upload
    const handleReferenceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            setReferenceImage(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    // Toggle object selection
    const toggleObject = (id: string) => {
        setDetectedObjects(detectedObjects.map(obj =>
            obj.id === id ? { ...obj, selected: !obj.selected } : obj
        ));
    };

    // Restore from history
    const restoreFromHistory = (historyEntry: EditHistory) => {
        setCurrentImage(historyEntry.image);
    };

    // Execute edit based on mode
    const handleExecuteEdit = () => {
        switch (editMode) {
            case 'remove':
                handleRemoveObjects();
                break;
            case 'style':
                handleStyleTransfer();
                break;
            case 'text-edit':
                handleTextEdit();
                break;
            default:
                setError('This editing mode is not yet implemented');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-700">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-700">
                    <h2 className="text-2xl font-bold text-white">🎨 Advanced Image Editor</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">×</button>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Left Sidebar - Tools */}
                    <div className="w-80 bg-gray-800/50 p-4 overflow-y-auto border-r border-gray-700">
                        <div className="space-y-4">
                            {/* Mode Selector */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">Editing Mode</label>
                                <select
                                    value={editMode}
                                    onChange={(e) => setEditMode(e.target.value as EditingMode)}
                                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600"
                                >
                                    <option value="remove">🗑️ Remove Objects</option>
                                    <option value="text-edit">✏️ Text Edit</option>
                                    <option value="style">🎨 Style Transfer</option>
                                    <option value="add">➕ Add Objects (Soon)</option>
                                    <option value="inpaint">🖌️ Inpaint (Soon)</option>
                                </select>
                            </div>

                            {/* Object Detection */}
                            {editMode === 'remove' && (
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-sm font-semibold text-gray-300">Detected Objects</label>
                                        <button
                                            onClick={handleAnalyzeImage}
                                            disabled={isAnalyzing}
                                            className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded disabled:opacity-50"
                                        >
                                            {isAnalyzing ? 'Analyzing...' : '🔍 Analyze'}
                                        </button>
                                    </div>

                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                        {detectedObjects.length === 0 ? (
                                            <p className="text-sm text-gray-500 italic">Click "Analyze" to detect objects</p>
                                        ) : (
                                            detectedObjects.map(obj => (
                                                <label key={obj.id} className="flex items-start space-x-2 p-2 bg-gray-700/50 rounded cursor-pointer hover:bg-gray-700">
                                                    <input
                                                        type="checkbox"
                                                        checked={obj.selected || false}
                                                        onChange={() => toggleObject(obj.id)}
                                                        className="mt-1"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="text-sm font-medium text-white">{obj.name}</div>
                                                        <div className="text-xs text-gray-400">{obj.description}</div>
                                                        <div className="text-xs text-gray-500">{obj.position}</div>
                                                    </div>
                                                </label>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Text Edit Input */}
                            {editMode === 'text-edit' && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-300 mb-2">Describe Changes</label>
                                    <textarea
                                        value={editPrompt}
                                        onChange={(e) => setEditPrompt(e.target.value)}
                                        placeholder="E.g., Change sky to sunset, remove watermark, make colors more vibrant..."
                                        rows={4}
                                        className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600"
                                    />
                                </div>
                            )}

                            {/* Reference Image Upload */}
                            {editMode === 'style' && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-300 mb-2">Reference Image</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleReferenceUpload}
                                        className="hidden"
                                        id="ref-upload"
                                    />
                                    <label
                                        htmlFor="ref-upload"
                                        className="block w-full p-4 border-2 border-dashed border-gray-600 rounded-lg text-center cursor-pointer hover:border-purple-500"
                                    >
                                        {referenceImage ? (
                                            <img src={referenceImage} alt="Reference" className="w-full h-32 object-cover rounded" />
                                        ) : (
                                            <div className="text-gray-400">
                                                <div className="text-2xl mb-1">📤</div>
                                                <div className="text-sm">Click to upload reference</div>
                                            </div>
                                        )}
                                    </label>
                                    {referenceImage && (
                                        <button
                                            onClick={() => setReferenceImage(null)}
                                            className="w-full mt-2 px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-sm rounded"
                                        >
                                            Clear Reference
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Execute Button */}
                            <button
                                onClick={handleExecuteEdit}
                                disabled={isEditing}
                                className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-lg disabled:opacity-50"
                            >
                                {isEditing ? '⏳ Processing...' : '✨ Apply Edit'}
                            </button>

                            {/* Error Display */}
                            {error && (
                                <div className="p-3 bg-red-900/50 border border-red-500 rounded text-red-200 text-sm">
                                    {error}
                                </div>
                            )}

                            {/* History */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">📚 Edit History ({history.length})</label>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {history.slice().reverse().map((entry, index) => (
                                        <button
                                            key={entry.id}
                                            onClick={() => restoreFromHistory(entry)}
                                            className="w-full flex items-center space-x-2 p-2 bg-gray-700/50 rounded hover:bg-gray-700 text-left"
                                        >
                                            <img src={entry.image} alt="" className="w-12 h-12 object-cover rounded" />
                                            <div className="flex-1 min-w-0">
                                                <div className="text-xs font-medium text-white truncate">{entry.operation}</div>
                                                <div className="text-xs text-gray-500">{new Date(entry.timestamp).toLocaleTimeString()}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Center - Image Preview */}
                    <div className="flex-1 p-6 flex flex-col items-center justify-center bg-gray-900">
                        <div className="max-w-full max-h-full flex items-center justify-center">
                            <img
                                src={currentImage}
                                alt="Current"
                                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end space-x-3 p-4 border-t border-gray-700">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            onSave(currentImage);
                            onClose();
                        }}
                        className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold rounded-lg"
                    >
                        ✅ Save & Apply
                    </button>
                </div>
            </div>
        </div>
    );
};
