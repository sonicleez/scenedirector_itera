/**
 * Determine optimal grid layout based on panel count
 */
export function getGridLayout(panelCount: number): { cols: number; rows: number } {
    if (panelCount === 1) return { cols: 1, rows: 1 };
    if (panelCount === 2) return { cols: 2, rows: 1 }; // Horizontal strip
    if (panelCount === 3) return { cols: 3, rows: 1 }; // Horizontal strip
    return { cols: 2, rows: 2 }; // Standard 2x2 for 4
}

/**
 * Split a storyboard image into individual panels
 * Automatically determines grid layout based on panelCount
 * @param fullImage Base64 encoded image
 * @param panelCount Number of panels to extract (1-4)
 * @returns Array of base64 encoded panel images
 */
export async function splitStoryboardImage(
    fullImage: string,
    panelCount: number = 4
): Promise<string[]> {
    return new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    reject(new Error('Could not get canvas context'));
                    return;
                }

                // Dynamic grid layout based on panel count
                const { cols, rows } = getGridLayout(panelCount);
                const panelWidth = Math.floor(img.width / cols);
                const panelHeight = Math.floor(img.height / rows);

                canvas.width = panelWidth;
                canvas.height = panelHeight;

                const panels: string[] = [];

                for (let row = 0; row < rows; row++) {
                    for (let col = 0; col < cols; col++) {
                        const panelIndex = row * cols + col;
                        if (panelIndex >= panelCount) break;

                        // Clear canvas
                        ctx.clearRect(0, 0, panelWidth, panelHeight);

                        // Draw panel section
                        ctx.drawImage(
                            img,
                            col * panelWidth, row * panelHeight, // Source position
                            panelWidth, panelHeight,             // Source size
                            0, 0,                                 // Destination position
                            panelWidth, panelHeight              // Destination size
                        );

                        // Convert to base64 (JPEG for smaller size)
                        const panelData = canvas.toDataURL('image/jpeg', 0.92);
                        panels.push(panelData);
                    }
                }

                console.log(`[ImageSplitter] Split into ${panels.length} panels (${cols}x${rows} grid, ${panelWidth}x${panelHeight} each)`);
                resolve(panels);
            } catch (error) {
                reject(error);
            }
        };

        img.onerror = () => {
            reject(new Error('Failed to load image for splitting'));
        };

        // Handle both base64 and URL formats
        if (fullImage.startsWith('data:')) {
            img.src = fullImage;
        } else {
            img.src = `data:image/jpeg;base64,${fullImage}`;
        }
    });
}
