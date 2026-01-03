/**
 * Prompt Normalizer
 * Optimizes prompts for each specific AI model
 * Called by DOP before sending to API
 */

export type ModelType =
    | 'gemini'
    | 'imagen'
    | 'banana_pro'
    | 'seedream'
    | 'midjourney'
    | 'kling'
    | 'dreamina'
    | 'z_image'
    | 'hailuo';

// Detect model type from model ID
export function detectModelType(modelId: string): ModelType {
    if (modelId.includes('gemini')) return 'gemini';
    if (modelId.includes('midjourney')) return 'midjourney';
    if (modelId.includes('seedream')) return 'seedream';
    if (modelId.includes('kling') || modelId.includes('colors') || modelId === 'o1') return 'kling';
    if (modelId.includes('dreamina')) return 'dreamina';
    if (modelId.includes('z_image')) return 'z_image';
    if (modelId.includes('hailuo')) return 'hailuo';
    if (modelId.includes('imagen') || modelId.includes('google_image_gen')) return 'imagen';
    if (modelId.includes('banana')) return 'banana_pro';
    return 'gemini'; // Default
}

// Model-specific limits and preferences
const MODEL_CONFIG: Record<ModelType, {
    maxLength: number;
    language: 'en' | 'multilingual';
    styleFirst: boolean;
    supportsNegative: boolean;
    format: 'verbose' | 'concise' | 'keyword' | 'danbooru';
    suffix?: string;
}> = {
    gemini: {
        maxLength: 8000,
        language: 'multilingual',
        styleFirst: false,
        supportsNegative: true,
        format: 'verbose'
    },
    imagen: {
        maxLength: 500,
        language: 'en',
        styleFirst: true,
        supportsNegative: false,
        format: 'concise'
    },
    banana_pro: {
        maxLength: 1000,
        language: 'en',
        styleFirst: true,
        supportsNegative: false,
        format: 'concise'
    },
    seedream: {
        maxLength: 800,
        language: 'multilingual',
        styleFirst: true,
        supportsNegative: false,
        format: 'danbooru'
    },
    midjourney: {
        maxLength: 350,
        language: 'en',
        styleFirst: false,
        supportsNegative: false,
        format: 'keyword',
        suffix: ' --v 7 --style raw'
    },
    kling: {
        maxLength: 600,
        language: 'en',
        styleFirst: true,
        supportsNegative: false,
        format: 'concise'
    },
    dreamina: {
        maxLength: 500,
        language: 'en',
        styleFirst: true,
        supportsNegative: false,
        format: 'concise'
    },
    z_image: {
        maxLength: 500,
        language: 'en',
        styleFirst: true,
        supportsNegative: false,
        format: 'concise'
    },
    hailuo: {
        maxLength: 500,
        language: 'en',
        styleFirst: true,
        supportsNegative: false,
        format: 'concise'
    }
};

export interface NormalizedPrompt {
    original: string;
    normalized: string;
    modelType: ModelType;
    changes: string[];
    truncated: boolean;
}

/**
 * Extract key components from a verbose prompt
 */
function extractComponents(prompt: string): {
    style: string;
    subject: string;
    action: string;
    camera: string;
    negative: string;
    extras: string;
} {
    let style = '';
    let subject = '';
    let action = '';
    let camera = '';
    let negative = '';
    let extras = '';

    // Extract style
    const styleMatch = prompt.match(/(?:AUTHORITATIVE STYLE|STYLE[:\s]+)([^.!]+)/i);
    if (styleMatch) style = styleMatch[1].trim();

    // Extract negative
    const negMatch = prompt.match(/(?:NEGATIVE[:\s]+|AVOID[:\s]+|!!! STRICT NEGATIVE:)([^!!!]+)/i);
    if (negMatch) negative = negMatch[1].trim();

    // Extract camera
    const camMatch = prompt.match(/(?:CAMERA|SHOT SCALE|TECHNICAL)[:\s]+([^.]+)/i);
    if (camMatch) camera = camMatch[1].trim();

    // Extract core action
    const actionMatch = prompt.match(/CORE ACTION[:\s]+([^.]+)/i);
    if (actionMatch) action = actionMatch[1].trim();

    // Extract subject/characters
    const charMatch = prompt.match(/(?:Appearing Characters|CHARACTERS)[:\s]+([^\]]+\])/i);
    if (charMatch) subject = charMatch[1].trim();

    // Everything else
    const sceneMatch = prompt.match(/(?:FULL SCENE VISUALS|SCENE)[:\s]+([^.]+)/i);
    if (sceneMatch) extras = sceneMatch[1].trim();

    return { style, subject, action, camera, negative, extras };
}

/**
 * Normalize prompt for specific model
 */
export function normalizePrompt(
    rawPrompt: string,
    modelId: string,
    aspectRatio: string = '16:9'
): NormalizedPrompt {
    const modelType = detectModelType(modelId);
    const config = MODEL_CONFIG[modelType];
    const changes: string[] = [];
    let normalized = rawPrompt;

    // 1. Extract components for restructuring
    const components = extractComponents(rawPrompt);

    // 2. Format based on model type
    switch (config.format) {
        case 'verbose':
            // Gemini: Keep mostly as-is, just clean up
            normalized = rawPrompt
                .replace(/\s+/g, ' ')
                .trim();
            break;

        case 'concise':
            // Imagen/Banana/Kling: Style first, short phrases
            const conciseParts = [
                components.style,
                components.subject,
                components.action,
                components.extras,
                components.camera
            ].filter(Boolean);

            normalized = conciseParts.join('. ').replace(/\s+/g, ' ').trim();
            changes.push('Restructured: Style → Subject → Action → Camera');
            break;

        case 'keyword':
            // Midjourney: Keywords with commas
            const keywords = [
                components.style,
                components.subject,
                components.action,
                components.extras,
                components.camera
            ].filter(Boolean).join(', ');

            // Add aspect ratio for MJ
            const arMJ = aspectRatio.replace(':', '_');
            normalized = `${keywords} --ar ${aspectRatio}${config.suffix || ''}`;
            changes.push('Converted to MJ keyword format');
            changes.push(`Added --ar ${aspectRatio} --v 7 --style raw`);
            break;

        case 'danbooru':
            // Seedream: Tag-style, quality prefixes
            const tags = [];
            tags.push('masterpiece', 'best quality', '8k uhd');

            if (components.subject) {
                tags.push(...components.subject.split(/[,.]/).map(s => s.trim().toLowerCase()));
            }
            if (components.action) {
                tags.push(components.action.toLowerCase());
            }
            if (components.extras) {
                tags.push(...components.extras.split(/[,.]/).map(s => s.trim().toLowerCase()));
            }
            if (components.style) {
                tags.push(components.style.toLowerCase());
            }
            if (components.camera) {
                tags.push(components.camera.toLowerCase());
            }

            normalized = tags.filter(Boolean).slice(0, 30).join(', ');
            changes.push('Converted to Danbooru tag format');
            changes.push('Added quality prefixes');
            break;
    }

    // 3. Remove negative prompts if not supported
    if (!config.supportsNegative && components.negative) {
        normalized = normalized.replace(/(?:NEGATIVE|AVOID|!!! STRICT NEGATIVE)[^!]*!!!/gi, '');
        changes.push('Removed negative prompts (not supported)');
    }

    // 4. Truncate if needed
    let truncated = false;
    if (normalized.length > config.maxLength) {
        normalized = normalized.substring(0, config.maxLength - 3) + '...';
        truncated = true;
        changes.push(`Truncated to ${config.maxLength} chars`);
    }

    // 5. Language check (basic - could use translation API)
    if (config.language === 'en') {
        // Check for Vietnamese characters
        const hasVN = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(normalized);
        if (hasVN) {
            changes.push('⚠️ Vietnamese detected - consider English for better results');
        }
    }

    // 6. Style-first reorder if needed
    if (config.styleFirst && components.style && !normalized.startsWith(components.style)) {
        // Already handled in format switch
    }

    return {
        original: rawPrompt,
        normalized,
        modelType,
        changes,
        truncated
    };
}

/**
 * Generate a human-readable summary of normalization changes
 */
export function formatNormalizationLog(result: NormalizedPrompt): string {
    const lines = [
        `🔧 [DOP] Prompt normalized for ${result.modelType.toUpperCase()}`,
        `📏 Length: ${result.original.length} → ${result.normalized.length} chars`
    ];

    if (result.changes.length > 0) {
        lines.push(`📝 Changes:`);
        result.changes.forEach(c => lines.push(`   • ${c}`));
    }

    if (result.truncated) {
        lines.push(`⚠️ Prompt was truncated to fit model limit`);
    }

    return lines.join('\n');
}

/**
 * Quick check if prompt needs normalization
 */
export function needsNormalization(modelId: string): boolean {
    const modelType = detectModelType(modelId);
    return modelType !== 'gemini'; // Gemini handles verbose well
}
