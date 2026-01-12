import { ProjectState } from '../types';
import { slugify } from './helpers';

// @ts-ignore
const JSZip = window.JSZip;

/**
 * Ensures we have a valid Blob/Base64 for zip insertion.
 * - If dataURI: returns it directly (JSZip handles it).
 * - If URL (blob/http): fetches it and returns the Blob.
 * - Extracts extension from MIME type.
 */
const prepareImageForZip = async (source: string): Promise<{ data: string | Blob; ext: string } | null> => {
    if (!source) return null;

    try {
        // CASE 1: Data URI (base64)
        if (source.startsWith('data:')) {
            const match = source.match(/^data:image\/(\w+);base64,(.+)$/);
            if (match) {
                let mimeExt = match[1];
                let ext = 'png';
                if (['jpeg', 'jpg'].includes(mimeExt)) ext = 'jpg';
                else if (mimeExt === 'webp') ext = 'webp';
                else if (mimeExt === 'gif') ext = 'gif';
                else if (mimeExt !== 'png') ext = mimeExt;

                return { data: match[2], ext };
            }
        }

        // CASE 2: URL (blob: or http:)
        const response = await fetch(source);
        const blob = await response.blob();
        const mimeType = blob.type;
        let ext = 'png';
        if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = 'jpg';
        else if (mimeType.includes('webp')) ext = 'webp';

        return { data: blob, ext };

    } catch (error) {
        console.warn('Failed to fetch image for ZIP:', source, error);
        return null;
    }
};

export const handleDownloadAll = async (state: ProjectState) => {
    if (!JSZip) {
        alert("JSZip not found. Please ensure it is loaded.");
        return;
    }

    const zip = new JSZip();
    const scenesFolder = zip.folder("Scenes");
    const assetsFolder = zip.folder("Assets");
    const charsFolder = assetsFolder?.folder("Characters");
    const productsFolder = assetsFolder?.folder("Products");
    const docsFolder = zip.folder("Docs");

    let fileCount = 0;

    // 0. Include Script Text
    const scriptContent = state.scenes.map(s => `[SCENE ${s.sceneNumber}] ${s.voiceOverText}`).join('\n\n');
    docsFolder?.file("script_voiceover.txt", scriptContent);

    // 1. SCENE MAP IMAGES
    const scenePromises = state.scenes.map(async (scene) => {
        if (scene.generatedImage) {
            const img = await prepareImageForZip(scene.generatedImage);
            if (img) {
                // If it's a string (base64), pass options. If blob, pass directly.
                const options = typeof img.data === 'string' ? { base64: true } : {};
                scenesFolder?.file(`${scene.sceneNumber}.${img.ext}`, img.data, options);
                fileCount++;
            }
        }
    });

    // 2. ASSETS - Characters
    const charPromises = state.characters.map(async (c) => {
        const cName = slugify(c.name) || c.id;
        const charImages = [
            { key: 'master', img: c.masterImage },
            { key: 'face', img: c.faceImage },
            { key: 'body', img: c.bodyImage },
            { key: 'side', img: c.sideImage },
            { key: 'back', img: c.backImage },
        ];

        for (const item of charImages) {
            if (item.img) {
                const img = await prepareImageForZip(item.img);
                if (img) {
                    const options = typeof img.data === 'string' ? { base64: true } : {};
                    charsFolder?.file(`${cName}_${item.key}.${img.ext}`, img.data, options);
                    fileCount++;
                }
            }
        }
    });

    // 3. ASSETS - Products
    const prodPromises = state.products.map(async (p) => {
        const pName = slugify(p.name) || p.id;

        // Master image
        if (p.masterImage) {
            const img = await prepareImageForZip(p.masterImage);
            if (img) {
                const options = typeof img.data === 'string' ? { base64: true } : {};
                productsFolder?.file(`${pName}_master.${img.ext}`, img.data, options);
                fileCount++;
            }
        }

        // Views
        if (p.views) {
            const viewImages = [
                { key: 'front', img: p.views.front },
                { key: 'back', img: p.views.back },
                { key: 'left', img: p.views.left },
                { key: 'right', img: p.views.right },
                { key: 'top', img: p.views.top },
            ];
            for (const item of viewImages) {
                if (item.img) {
                    const img = await prepareImageForZip(item.img);
                    if (img) {
                        const options = typeof img.data === 'string' ? { base64: true } : {};
                        productsFolder?.file(`${pName}_${item.key}.${img.ext}`, img.data, options);
                        fileCount++;
                    }
                }
            }
        }
    });

    // Wait for all fetches
    await Promise.all([...scenePromises, ...charPromises, ...prodPromises]);

    if (fileCount === 0) {
        alert("Không tìm thấy ảnh nào (Scenes/Characters/Products) để tải xuống.");
        return;
    }

    // Generate and download
    zip.generateAsync({ type: "blob" }).then(function (content: Blob) {
        const filename = state.projectName ? `${slugify(state.projectName)}_full.zip` : 'project-assets.zip';
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    });
};
