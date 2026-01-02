/**
 * useExcelImport Hook
 * 
 * Parses Excel/CSV files and converts them into Scene, SceneGroup, and Character data
 * for bootstrapping a new project.
 */

import { useCallback, useState } from 'react';
import * as XLSX from 'xlsx';
import { Scene, SceneGroup, Character } from '../types';
import { generateId } from '../utils/helpers';

export interface ExcelImportResult {
    scenes: Scene[];
    groups: SceneGroup[];
    characters: Character[];
}

export interface ColumnMapping {
    sceneNumber: string;
    group: string;
    voiceOver: string;
    dialogue: string;
    dialogueSpeaker: string;
    visualContext: string;
    cameraAngle: string;
    lens: string;
    characterNames: string;
    productNames: string;
    isKeyFrame: string;
}

const DEFAULT_MAPPING: ColumnMapping = {
    sceneNumber: 'scene_number',
    group: 'group',
    voiceOver: 'voice_over',
    dialogue: 'dialogue',
    dialogueSpeaker: 'dialogue_speaker',
    visualContext: 'visual_context',
    cameraAngle: 'camera_angle',
    lens: 'lens',
    characterNames: 'character_names',
    productNames: 'product_names',
    isKeyFrame: 'is_key_frame'
};

export function useExcelImport() {
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewData, setPreviewData] = useState<any[] | null>(null);
    const [headers, setHeaders] = useState<string[]>([]);

    /**
     * Parse Excel or CSV file and extract headers + preview rows
     */
    const parseFile = useCallback(async (file: File): Promise<{ headers: string[]; rows: any[] }> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const data = e.target?.result;
                    const workbook = XLSX.read(data, { type: 'binary' });
                    const sheetName = workbook.SheetNames[0];
                    const sheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

                    if (jsonData.length < 2) {
                        reject(new Error('File must have at least a header row and one data row.'));
                        return;
                    }

                    const headers = (jsonData[0] as string[]).map(h => String(h || '').toLowerCase().trim());
                    const rows = jsonData.slice(1).map(row => {
                        const obj: Record<string, any> = {};
                        headers.forEach((header, i) => {
                            obj[header] = row[i] ?? '';
                        });
                        return obj;
                    }).filter(row => Object.values(row).some(v => v !== ''));

                    resolve({ headers, rows });
                } catch (err: any) {
                    reject(new Error(`Failed to parse file: ${err.message}`));
                }
            };

            reader.onerror = () => reject(new Error('Failed to read file.'));
            reader.readAsBinaryString(file);
        });
    }, []);

    /**
     * Load file for preview
     */
    const loadPreview = useCallback(async (file: File) => {
        setIsProcessing(true);
        setError(null);
        try {
            const { headers, rows } = await parseFile(file);
            setHeaders(headers);
            setPreviewData(rows.slice(0, 5)); // Preview first 5 rows
            return { headers, rowCount: rows.length };
        } catch (err: any) {
            setError(err.message);
            return null;
        } finally {
            setIsProcessing(false);
        }
    }, [parseFile]);

    /**
     * Import file with column mapping and generate project data
     */
    const importFile = useCallback(async (
        file: File,
        mapping: ColumnMapping
    ): Promise<ExcelImportResult | null> => {
        setIsProcessing(true);
        setError(null);

        try {
            const { rows } = await parseFile(file);

            // 1. Extract unique groups
            const groupNames = new Set<string>();
            rows.forEach(row => {
                const groupName = String(row[mapping.group] || 'Default Group').trim();
                if (groupName) groupNames.add(groupName);
            });

            const groupMap: Record<string, SceneGroup> = {};
            Array.from(groupNames).forEach((name, index) => {
                const id = generateId();
                groupMap[name.toLowerCase()] = {
                    id,
                    name,
                    description: name,
                    timeOfDay: 'morning',
                    weather: 'clear'
                };
            });

            // 2. Extract unique character names
            const charNames = new Set<string>();
            rows.forEach(row => {
                const names = String(row[mapping.characterNames] || '').split(',').map(n => n.trim()).filter(Boolean);
                names.forEach(n => charNames.add(n));
            });

            const charMap: Record<string, Character> = {};
            Array.from(charNames).forEach(name => {
                const id = generateId();
                charMap[name.toLowerCase()] = {
                    id,
                    name,
                    description: '', // User will fill later
                    faceImage: null,
                    masterImage: null,
                    bodyImage: null,
                    sideImage: null,
                    backImage: null,
                    props: [],
                    isDefault: false
                };
            });

            // 3. Create scenes
            const scenes: Scene[] = [];
            rows.forEach((row, index) => {
                const groupName = String(row[mapping.group] || 'Default Group').trim().toLowerCase();
                const group = groupMap[groupName];

                const charNamesInRow = String(row[mapping.characterNames] || '').split(',').map(n => n.trim().toLowerCase()).filter(Boolean);
                const characterIds = charNamesInRow.map(n => charMap[n]?.id).filter(Boolean) as string[];

                const visualContext = String(row[mapping.visualContext] || '').trim();
                if (!visualContext) return; // Skip empty rows

                const sceneNumber = row[mapping.sceneNumber] ? String(row[mapping.sceneNumber]) : String(index + 1);

                const dialogueSpeaker = String(row[mapping.dialogueSpeaker] || '').trim();
                const dialogueText = String(row[mapping.dialogue] || '').trim();
                const formattedDialogue = dialogueSpeaker && dialogueText
                    ? `${dialogueSpeaker}: ${dialogueText}`
                    : dialogueText;

                const scene: Scene = {
                    id: generateId(),
                    sceneNumber,
                    groupId: group?.id || '',
                    language1: formattedDialogue,
                    vietnamese: '',
                    promptName: `Scene ${sceneNumber}`,
                    voiceOverText: String(row[mapping.voiceOver] || '').trim(),
                    isVOScene: Boolean(row[mapping.voiceOver]),
                    contextDescription: visualContext,
                    characterIds,
                    productIds: [],
                    generatedImage: null,
                    veoPrompt: '',
                    isGenerating: false,
                    error: null,
                    cameraAngleOverride: row[mapping.cameraAngle] || undefined,
                    lensOverride: row[mapping.lens] || undefined,
                    isKeyFrame: String(row[mapping.isKeyFrame] || '').toLowerCase() === 'true'
                };

                scenes.push(scene);
            });

            const result: ExcelImportResult = {
                scenes,
                groups: Object.values(groupMap),
                characters: Object.values(charMap)
            };

            console.log('[ExcelImport] ✅ Import complete:', {
                scenes: result.scenes.length,
                groups: result.groups.length,
                characters: result.characters.length
            });

            return result;

        } catch (err: any) {
            setError(err.message);
            return null;
        } finally {
            setIsProcessing(false);
        }
    }, [parseFile]);

    /**
     * Auto-detect column mapping from headers
     */
    const autoDetectMapping = useCallback((fileHeaders: string[]): ColumnMapping => {
        const mapping = { ...DEFAULT_MAPPING };
        const lowerHeaders = fileHeaders.map(h => h.toLowerCase());

        // Try to match each field
        const detectField = (field: keyof ColumnMapping, patterns: string[]) => {
            const match = lowerHeaders.find(h => patterns.some(p => h.includes(p)));
            if (match) mapping[field] = match;
        };

        detectField('sceneNumber', ['scene', 'number', 'stt', 'no.']);
        detectField('group', ['group', 'chapter', 'chương', 'nhóm', 'location']);
        detectField('voiceOver', ['voice', 'narration', 'vo', 'thuyết minh', 'lời dẫn']);
        detectField('dialogue', ['dialogue', 'dialog', 'lời thoại', 'thoại']);
        detectField('dialogueSpeaker', ['speaker', 'người nói', 'nhân vật nói']);
        detectField('visualContext', ['visual', 'context', 'prompt', 'description', 'mô tả', 'hình ảnh']);
        detectField('cameraAngle', ['camera', 'angle', 'góc máy', 'shot']);
        detectField('lens', ['lens', 'ống kính', 'focal']);
        detectField('characterNames', ['character', 'nhân vật', 'actor']);
        detectField('productNames', ['product', 'prop', 'sản phẩm', 'đạo cụ']);
        detectField('isKeyFrame', ['key', 'keyframe', 'hero', 'main']);

        return mapping;
    }, []);

    return {
        isProcessing,
        error,
        previewData,
        headers,
        loadPreview,
        importFile,
        autoDetectMapping,
        DEFAULT_MAPPING
    };
}
