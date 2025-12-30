import { GoogleGenAI } from "@google/genai";

export const callGeminiAPI = async (
    apiKey: string,
    prompt: string,
    aspectRatio: string,
    imageModel: string = 'gemini-2.5-flash-image',
    imageContext: string | null = null
): Promise<string | null> => {
    const trimmedKey = apiKey?.trim();
    if (!trimmedKey) return null;

    console.log('[Gemini Gen] 🎨 Calling Gemini API...');
    try {
        const ai = new GoogleGenAI({ apiKey: trimmedKey });
        const parts: any[] = [];

        if (imageContext) {
            console.log('[Gemini Gen] 📎 Using Reference Image...');
            let base64Data: string;
            let mimeType: string = 'image/jpeg';

            if (imageContext.startsWith('data:')) {
                // It's already a Base64 Data URI
                base64Data = imageContext.split('base64,')[1];
                mimeType = imageContext.startsWith('data:image/png') ? 'image/png' : 'image/jpeg';
            } else if (imageContext.startsWith('http')) {
                // It's a URL, we need to fetch and convert it
                console.log('[Gemini Gen] 🌐 Fetching image from URL...');
                try {
                    const imgRes = await fetch(imageContext);
                    if (!imgRes.ok) throw new Error('Failed to fetch image from URL');
                    const blob = await imgRes.blob();
                    mimeType = blob.type || 'image/jpeg';
                    base64Data = await new Promise<string>((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
                        reader.onerror = reject;
                        reader.readAsDataURL(blob);
                    });
                } catch (fetchError: any) {
                    console.error('[Gemini Gen] ❌ Failed to fetch URL image:', fetchError.message);
                    return null;
                }
            } else {
                // Assume it's raw base64 without the data URI prefix
                base64Data = imageContext;
            }
            parts.push({ inlineData: { data: base64Data, mimeType } });
        }

        parts.push({ text: prompt });

        const response = await ai.models.generateContent({
            model: imageModel === 'gemini-2.0-flash' ? 'gemini-2.5-flash-image' : imageModel,
            contents: { parts: parts },
            config: {
                imageConfig: {
                    aspectRatio: aspectRatio
                }
            }
        });

        const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
        if (imagePart?.inlineData) {
            return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
        }
        return null;
    } catch (err: any) {
        console.error('[Gemini Gen] ❌ Error:', err.message);
        return null;
    }
};

export const callGeminiText = async (
    apiKey: string,
    prompt: string,
    systemPrompt: string = '',
    model: string = 'gemini-1.5-flash',
    jsonMode: boolean = false
): Promise<string> => {
    const trimmedKey = apiKey?.trim();
    if (!trimmedKey) throw new Error('Missing API Key');

    try {
        const ai = new GoogleGenAI({ apiKey: trimmedKey });

        const response = await ai.models.generateContent({
            model: model,
            contents: [{
                role: 'user',
                parts: [{ text: `${systemPrompt}\n\nUSER COMMAND: ${prompt}` }]
            }],
            config: jsonMode ? { responseMimeType: "application/json" } : {}
        });

        return response.text;
    } catch (err: any) {
        console.error('[Gemini Text] ❌ Error:', err.message);
        throw err;
    }
};
