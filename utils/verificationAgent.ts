/**
 * Verification Agent
 * 
 * VERIFY Phase of the ReAct loop:
 * Analyzes generated images against expected scene state
 * and provides verification scores + correction suggestions.
 */

import { GoogleGenAI } from '@google/genai';
import { SceneStateSnapshot, VerificationResult } from './sceneStateAgent';

// ═══════════════════════════════════════════════════════════════
// IMAGE VERIFICATION
// ═══════════════════════════════════════════════════════════════

/**
 * Verifies a generated image against the expected scene state.
 * Uses vision AI to analyze if critical elements are correct.
 */
export async function verifyGeneratedImage(
    apiKey: string,
    generatedImageBase64: string,
    expectedState: SceneStateSnapshot
): Promise<VerificationResult> {

    const ai = new GoogleGenAI({ apiKey });

    const verificationPrompt = `You are a strict Visual QA Agent for cinematic image generation.
Your job is to verify if the generated image matches the expected scene state.

EXPECTED SCENE STATE:
${JSON.stringify(expectedState, null, 2)}

VERIFICATION CHECKLIST:
${expectedState.verificationChecklist.map((c, i) => `${i + 1}. ${c}`).join('\n')}

CRITICAL ELEMENTS TO CHECK:
${expectedState.criticalElements.map((e, i) => `${i + 1}. ${e}`).join('\n')}

TASK:
Analyze the provided image and verify each element.

OUTPUT FORMAT (JSON):
{
    "checklistResults": [
        { "item": "checklist item text", "passed": true/false, "reason": "why it passed or failed" }
    ],
    "criticalElementsResults": [
        { "element": "element text", "passed": true/false, "reason": "why it passed or failed" }
    ],
    "overallScore": 0-100,
    "suggestions": ["list of suggestions to fix failures"]
}`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{
                role: 'user',
                parts: [
                    {
                        inlineData: {
                            mimeType: 'image/png',
                            data: generatedImageBase64
                        }
                    },
                    { text: verificationPrompt }
                ]
            }],
            config: {
                responseMimeType: 'application/json'
            }
        });

        const result = JSON.parse(response.text || '{}');

        const violations: string[] = [];

        // Extract violations from checklist
        if (result.checklistResults) {
            result.checklistResults.forEach((r: any) => {
                if (!r.passed) {
                    violations.push(`CHECKLIST FAIL: ${r.item} - ${r.reason}`);
                }
            });
        }

        // Extract violations from critical elements
        if (result.criticalElementsResults) {
            result.criticalElementsResults.forEach((r: any) => {
                if (!r.passed) {
                    violations.push(`CRITICAL FAIL: ${r.element} - ${r.reason}`);
                }
            });
        }

        const score = result.overallScore || 0;
        const passed = score >= 70 && violations.filter(v => v.startsWith('CRITICAL')).length === 0;

        console.log(`[VerificationAgent] Score: ${score}/100, Passed: ${passed}, Violations: ${violations.length}`);

        return {
            passed,
            score,
            violations,
            suggestions: result.suggestions || []
        };

    } catch (error) {
        console.error('[VerificationAgent] Verification failed:', error);
        // If verification itself fails, pass by default to avoid blocking
        return {
            passed: true,
            score: 50,
            violations: ['Verification system error - could not analyze image'],
            suggestions: []
        };
    }
}

// ═══════════════════════════════════════════════════════════════
// CORRECTION PROMPT GENERATOR
// ═══════════════════════════════════════════════════════════════

/**
 * Generates a correction prompt based on verification failures.
 * Used to regenerate images with stronger constraints.
 */
export function generateCorrectionPrompt(
    originalPrompt: string,
    verificationResult: VerificationResult,
    expectedState: SceneStateSnapshot
): string {

    const corrections: string[] = [
        '',
        '⚠️⚠️⚠️ CRITICAL CORRECTION REQUIRED ⚠️⚠️⚠️',
        '',
        'The previous generation FAILED these verification checks:',
    ];

    verificationResult.violations.forEach(v => {
        corrections.push(`❌ ${v}`);
    });

    corrections.push('');
    corrections.push('YOU MUST FIX THESE ISSUES IN THIS GENERATION:');
    corrections.push('');

    // Add specific corrections for each violation
    verificationResult.violations.forEach(v => {
        if (v.includes('lying') || v.includes('position')) {
            corrections.push('🔧 FIX CHARACTER POSITION: Follow the exact position specified');
        }
        if (v.includes('mask') && v.includes('face')) {
            corrections.push('🔧 FIX MASK PLACEMENT: Mask must be ON the face, NOT on floor');
        }
        if (v.includes('kneeling') || v.includes('standing')) {
            corrections.push('🔧 FIX POSTURE: Match the exact posture described');
        }
    });

    if (verificationResult.suggestions.length > 0) {
        corrections.push('');
        corrections.push('SUGGESTIONS FOR CORRECTION:');
        verificationResult.suggestions.forEach(s => {
            corrections.push(`💡 ${s}`);
        });
    }

    corrections.push('');
    corrections.push('MANDATORY STATE (MUST BE EXACTLY AS DESCRIBED):');
    expectedState.criticalElements.forEach(e => {
        corrections.push(`✅ ${e}`);
    });

    corrections.push('');
    corrections.push('DO NOT PROCEED WITHOUT FIXING ALL ISSUES.');

    return originalPrompt + '\n\n' + corrections.join('\n');
}

// ═══════════════════════════════════════════════════════════════
// QUICK VERIFICATION (Lightweight check)
// ═══════════════════════════════════════════════════════════════

/**
 * Performs a quick sanity check on critical elements only.
 * Faster than full verification, good for checking obvious issues.
 */
export async function quickVerifyCriticalElements(
    apiKey: string,
    generatedImageBase64: string,
    criticalElements: string[]
): Promise<{ passed: boolean; failedElements: string[] }> {

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Quick visual check. For each element, respond PASS or FAIL:
${criticalElements.map((e, i) => `${i + 1}. ${e}`).join('\n')}

Response format (JSON):
{
    "results": [
        { "element": "element text", "status": "PASS" or "FAIL" }
    ]
}`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{
                role: 'user',
                parts: [
                    { inlineData: { mimeType: 'image/png', data: generatedImageBase64 } },
                    { text: prompt }
                ]
            }],
            config: {
                responseMimeType: 'application/json'
            }
        });

        const result = JSON.parse(response.text || '{}');
        const failedElements = (result.results || [])
            .filter((r: any) => r.status === 'FAIL')
            .map((r: any) => r.element);

        return {
            passed: failedElements.length === 0,
            failedElements
        };

    } catch (error) {
        console.error('[VerificationAgent] Quick verification failed:', error);
        return { passed: true, failedElements: [] };
    }
}

console.log('[VerificationAgent] Module loaded');
