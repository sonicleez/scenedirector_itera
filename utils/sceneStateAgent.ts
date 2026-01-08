/**
 * Scene State Agent
 * 
 * Implements the ReAct (Reason + Act) pattern for scene continuity:
 * 1. REASON: Analyze previous scene and plan expected state
 * 2. ACT: Generate image with explicit state requirements
 * 3. VERIFY: Check generated image against expected state
 * 4. CORRECT: Regenerate if verification fails
 */

import { GoogleGenAI } from '@google/genai';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type CharacterPosition =
    | 'lying_face_down'
    | 'lying_on_back'
    | 'kneeling'
    | 'standing'
    | 'sitting'
    | 'crouching'
    | 'unknown';

export interface CharacterState {
    name: string;
    position: CharacterPosition;
    props: string[];          // e.g., ["plague_mask_on_face", "hands_cuffed_behind_back"]
    orientation: string;      // e.g., "facing_down", "back_to_camera", "facing_camera"
    action: string;           // e.g., "trembling", "reaching_for_mask", "static"
}

export interface EnvironmentState {
    location: string;         // e.g., "abandoned_warehouse_interior"
    timeOfDay: string;        // e.g., "night"
    lighting: string;         // e.g., "dim_overhead_single_light"
    weather: string;          // e.g., "rain_audible_on_roof"
    keyObjects: string[];     // e.g., ["old_looms", "concrete_floor", "broken_windows"]
}

export interface CameraState {
    angle: string;            // e.g., "low_angle", "high_angle", "eye_level"
    distance: string;         // e.g., "wide", "medium", "close_up", "extreme_close_up"
    movement: string;         // e.g., "static", "push_in", "orbit"
}

export interface SceneStateSnapshot {
    sceneId: string;
    voiceOverText: string;
    characters: CharacterState[];
    environment: EnvironmentState;
    camera: CameraState;
    criticalElements: string[];  // Elements that MUST appear correctly
    verificationChecklist: string[];  // Specific checks to perform
}

export interface VerificationResult {
    passed: boolean;
    score: number;            // 0-100
    violations: string[];     // List of what failed
    suggestions: string[];    // How to fix
}

// ═══════════════════════════════════════════════════════════════
// SCENE STATE PLANNER (REASON Phase)
// ═══════════════════════════════════════════════════════════════

/**
 * Analyzes the current scene context and plans the expected visual state.
 * This runs BEFORE image generation to establish what the image MUST contain.
 */
export async function planSceneState(
    apiKey: string,
    currentVoiceOver: string,
    currentVisualPrompt: string,
    previousState: SceneStateSnapshot | null,
    groupContext: {
        locationAnchor: string;
        characterDescriptions: string;
        isFirstInGroup: boolean;
    }
): Promise<SceneStateSnapshot> {

    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = `You are a Scene State Planner for cinematic image generation.
Your job is to analyze the voice-over and visual context, then define the EXACT visual state that must appear in the generated image.

CRITICAL RULES:
1. If previous scene shows a character in a position, they STAY in that position unless the voice-over explicitly describes movement
2. Props/objects attached to characters STAY attached unless explicitly removed
3. Camera changes, NOT character positions, should create visual variety
4. Be extremely precise about character positions and prop placements

OUTPUT FORMAT (JSON):`;

    const userPrompt = `
CURRENT SCENE:
Voice-Over: "${currentVoiceOver}"
Visual Prompt: "${currentVisualPrompt}"

PREVIOUS SCENE STATE:
${previousState ? JSON.stringify(previousState, null, 2) : 'None (first scene in sequence)'}

GROUP CONTEXT:
- Location: ${groupContext.locationAnchor}
- Characters: ${groupContext.characterDescriptions}
- Is First In Group: ${groupContext.isFirstInGroup}

TASK:
1. Analyze continuity from previous scene
2. Determine what changes (if any) based on voice-over
3. Generate the expected scene state

OUTPUT JSON:
{
    "characters": [
        {
            "name": "character name",
            "position": "lying_face_down|kneeling|standing|sitting|crouching",
            "props": ["list", "of", "props", "on", "character"],
            "orientation": "facing_down|back_to_camera|facing_camera",
            "action": "current action"
        }
    ],
    "environment": {
        "location": "specific location",
        "timeOfDay": "time",
        "lighting": "lighting description",
        "weather": "weather",
        "keyObjects": ["objects", "in", "scene"]
    },
    "camera": {
        "angle": "camera angle",
        "distance": "shot distance",
        "movement": "camera movement"
    },
    "criticalElements": [
        "List of elements that MUST appear correctly",
        "e.g., 'The Man must be lying face down'",
        "e.g., 'Plague mask must be ON his face, not on floor'"
    ],
    "verificationChecklist": [
        "Is The Man lying face down on concrete? YES/NO",
        "Is plague mask on The Man's face? YES/NO",
        "Is Rémy in the correct position? YES/NO"
    ]
}`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: [{ text: systemPrompt + '\n\n' + userPrompt }] }],
            config: {
                responseMimeType: 'application/json'
            }
        });

        const result = JSON.parse(response.text || '{}');

        return {
            sceneId: `state_${Date.now()}`,
            voiceOverText: currentVoiceOver,
            characters: result.characters || [],
            environment: result.environment || {
                location: groupContext.locationAnchor,
                timeOfDay: 'unknown',
                lighting: 'unknown',
                weather: 'unknown',
                keyObjects: []
            },
            camera: result.camera || {
                angle: 'eye_level',
                distance: 'medium',
                movement: 'static'
            },
            criticalElements: result.criticalElements || [],
            verificationChecklist: result.verificationChecklist || []
        };
    } catch (error) {
        console.error('[SceneStateAgent] Planning failed:', error);
        // Return a basic state if planning fails
        return {
            sceneId: `state_${Date.now()}`,
            voiceOverText: currentVoiceOver,
            characters: previousState?.characters || [],
            environment: previousState?.environment || {
                location: groupContext.locationAnchor,
                timeOfDay: 'unknown',
                lighting: 'unknown',
                weather: 'unknown',
                keyObjects: []
            },
            camera: {
                angle: 'eye_level',
                distance: 'medium',
                movement: 'static'
            },
            criticalElements: [],
            verificationChecklist: []
        };
    }
}

// ═══════════════════════════════════════════════════════════════
// STATE TO PROMPT CONVERTER
// ═══════════════════════════════════════════════════════════════

/**
 * Converts a SceneStateSnapshot into explicit prompt requirements.
 * This is injected into the image generation prompt.
 */
export function stateToPromptRequirements(state: SceneStateSnapshot): string {
    const lines: string[] = [
        '[SCENE STATE AGENT - MANDATORY REQUIREMENTS]',
        ''
    ];

    // Character positions (CRITICAL)
    if (state.characters.length > 0) {
        lines.push('CHARACTER POSITIONS (MUST MATCH EXACTLY):');
        state.characters.forEach(char => {
            const positionDesc = char.position.replace(/_/g, ' ').toUpperCase();
            const propsDesc = char.props.length > 0 ? `, with ${char.props.join(', ')}` : '';
            lines.push(`- ${char.name}: ${positionDesc}${propsDesc}`);
            if (char.orientation) {
                lines.push(`  Orientation: ${char.orientation.replace(/_/g, ' ')}`);
            }
            if (char.action && char.action !== 'static') {
                lines.push(`  Action: ${char.action.replace(/_/g, ' ')}`);
            }
        });
        lines.push('');
    }

    // Camera
    lines.push('CAMERA:');
    lines.push(`- Angle: ${state.camera.angle.replace(/_/g, ' ')}`);
    lines.push(`- Distance: ${state.camera.distance.replace(/_/g, ' ')}`);
    lines.push('');

    // Critical elements
    if (state.criticalElements.length > 0) {
        lines.push('CRITICAL ELEMENTS (MUST BE CORRECT):');
        state.criticalElements.forEach(elem => {
            lines.push(`⚠️ ${elem}`);
        });
        lines.push('');
    }

    lines.push('DO NOT DEVIATE FROM THESE REQUIREMENTS.');

    return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════
// CONTINUITY TRACKER
// ═══════════════════════════════════════════════════════════════

/**
 * Simple in-memory tracker for scene states within a session.
 * Can be persisted to scene objects for cross-session continuity.
 */
export class SceneStateTracker {
    private states: Map<string, SceneStateSnapshot> = new Map();
    private groupStates: Map<string, SceneStateSnapshot[]> = new Map();

    setSceneState(sceneId: string, groupId: string, state: SceneStateSnapshot): void {
        this.states.set(sceneId, state);

        const groupHistory = this.groupStates.get(groupId) || [];
        groupHistory.push(state);
        this.groupStates.set(groupId, groupHistory);
    }

    getSceneState(sceneId: string): SceneStateSnapshot | null {
        return this.states.get(sceneId) || null;
    }

    getPreviousStateInGroup(groupId: string): SceneStateSnapshot | null {
        const groupHistory = this.groupStates.get(groupId);
        if (!groupHistory || groupHistory.length === 0) return null;
        return groupHistory[groupHistory.length - 1];
    }

    resetGroup(groupId: string): void {
        this.groupStates.delete(groupId);
    }

    clear(): void {
        this.states.clear();
        this.groupStates.clear();
    }
}

// Singleton instance for the current session
export const sceneStateTracker = new SceneStateTracker();

console.log('[SceneStateAgent] Module loaded');
