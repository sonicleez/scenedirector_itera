/**
 * DOP Raccord Validator
 * 
 * Validates visual continuity between consecutive shots.
 * Uses Gemini Vision to detect raccord breaks:
 * - Character identity changes
 * - Outfit/clothing changes
 * - Lighting direction changes
 * - Background inconsistencies
 */

import { GoogleGenAI } from "@google/genai";
import { safeGetImageData } from "./geminiUtils";

export interface RaccordValidationResult {
    isValid: boolean;
    score: number; // 0-1, higher = better match
    errors: {
        type: 'character_mismatch' | 'outfit_change' | 'lighting_change' | 'background_change' | 'style_change';
        description: string;
        severity: 'warning' | 'error';
    }[];
    decision: 'continue' | 'retry' | 'ask_user';
    correctionPrompt?: string;
}

interface ValidationOptions {
    strictMode?: boolean; // If true, any error = retry
    autoRetryThreshold?: number; // Score below this = auto retry (default 0.6)
    askUserThreshold?: number; // Score between autoRetry and this = ask user (default 0.8)
}

const RACCORD_VALIDATION_PROMPT = `You are a professional Director of Photography (DOP) reviewing two consecutive shots from the same scene.

TASK: Analyze the visual continuity (RACCORD) between these two images.

Check for these RACCORD BREAKS:
1. CHARACTER IDENTITY: Does the same person appear in both? Face structure, features, age, ethnicity must match.
2. OUTFIT CONTINUITY: Are they wearing the same clothes? Check colors, patterns, accessories.
3. LIGHTING DIRECTION: Does the key light come from the same direction? Check shadow directions.
4. BACKGROUND CONSISTENCY: Are environmental elements consistent?
5. STYLE MATCH: Is the artistic style (realistic, anime, etc.) the same?

RESPOND IN JSON FORMAT:
{
  "isValid": true/false,
  "score": 0.0-1.0,
  "errors": [
    {
      "type": "character_mismatch|outfit_change|lighting_change|background_change|style_change",
      "description": "Brief description of the issue",
      "severity": "warning|error"
    }
  ],
  "correctionPrompt": "If there are errors, suggest a prompt addition to fix the most critical issue"
}

IMPORTANT:
- score = 1.0 means perfect continuity
- score < 0.6 means serious raccord break
- error severity = "error" for things that MUST match (face, outfit)
- error severity = "warning" for things that can vary (lighting angle, background detail)

Respond ONLY with valid JSON, no markdown.`;

/**
 * Validate raccord between two consecutive images
 */
export async function validateRaccord(
    previousImage: string,
    currentImage: string,
    apiKey: string,
    options: ValidationOptions = {}
): Promise<RaccordValidationResult> {
    const {
        strictMode = false,
        autoRetryThreshold = 0.6,
        askUserThreshold = 0.8
    } = options;

    try {
        // Get image data
        const [prevData, currData] = await Promise.all([
            safeGetImageData(previousImage),
            safeGetImageData(currentImage)
        ]);

        if (!prevData || !currData) {
            console.warn('[DOP Raccord] Could not load images for validation');
            return {
                isValid: true,
                score: 1,
                errors: [],
                decision: 'continue'
            };
        }

        // Call Gemini Vision
        const ai = new GoogleGenAI({ apiKey });

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash-exp',
            contents: [{
                role: 'user',
                parts: [
                    { text: RACCORD_VALIDATION_PROMPT },
                    { text: "[PREVIOUS SHOT - Reference]:" },
                    { inlineData: { data: prevData.data, mimeType: prevData.mimeType } },
                    { text: "[CURRENT SHOT - Validate this]:" },
                    { inlineData: { data: currData.data, mimeType: currData.mimeType } }
                ]
            }]
        });

        const text = response.text?.trim() || '';

        // Parse JSON response
        let result: RaccordValidationResult;
        try {
            // Clean up response in case it has markdown
            const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            const parsed = JSON.parse(jsonStr);

            // Determine decision based on score
            let decision: 'continue' | 'retry' | 'ask_user' = 'continue';

            if (parsed.score < autoRetryThreshold) {
                decision = 'retry';
            } else if (parsed.score < askUserThreshold) {
                decision = 'ask_user';
            }

            // In strict mode, any error means retry
            if (strictMode && parsed.errors?.some((e: any) => e.severity === 'error')) {
                decision = 'retry';
            }

            result = {
                isValid: parsed.isValid ?? (parsed.score >= askUserThreshold),
                score: parsed.score ?? 0.5,
                errors: parsed.errors || [],
                decision,
                correctionPrompt: parsed.correctionPrompt
            };
        } catch (parseError) {
            console.error('[DOP Raccord] Failed to parse response:', text);
            result = {
                isValid: true,
                score: 0.7,
                errors: [],
                decision: 'continue'
            };
        }

        console.log(`[DOP Raccord] Validation: score=${result.score}, decision=${result.decision}, errors=${result.errors.length}`);

        return result;

    } catch (error) {
        console.error('[DOP Raccord] Validation failed:', error);
        // On error, continue (don't block generation)
        return {
            isValid: true,
            score: 1,
            errors: [],
            decision: 'continue'
        };
    }
}

/**
 * Format validation result for display
 */
export function formatValidationResult(result: RaccordValidationResult): string {
    if (result.isValid && result.errors.length === 0) {
        return `✅ Raccord OK (${Math.round(result.score * 100)}%)`;
    }

    const errorIcons = {
        character_mismatch: '👤',
        outfit_change: '👔',
        lighting_change: '💡',
        background_change: '🏞️',
        style_change: '🎨'
    };

    const issues = result.errors
        .filter(e => e.severity === 'error')
        .map(e => `${errorIcons[e.type] || '⚠️'} ${e.description}`)
        .join(', ');

    return `⚠️ Raccord Issues (${Math.round(result.score * 100)}%): ${issues || 'Minor issues detected'}`;
}

console.log('[DOP Raccord Validator] Module loaded');
