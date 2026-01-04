/**
 * Location Library Utilities
 * 
 * Manages shared location concepts across scene groups.
 * Includes auto-detection for smart linking.
 */

import { Location, SceneGroup } from '../types';

// Common location keywords for auto-detection
const LOCATION_KEYWORDS_MAP: Record<string, string[]> = {
    'casino': ['casino', 'gambling', 'roulette', 'poker', 'chips', 'betting', 'blackjack', 'slot'],
    'office': ['office', 'desk', 'computer', 'meeting', 'corporate', 'workplace', 'cubicle'],
    'street': ['street', 'road', 'sidewalk', 'urban', 'city', 'alley', 'downtown'],
    'forest': ['forest', 'woods', 'trees', 'jungle', 'nature', 'wilderness'],
    'home': ['home', 'house', 'apartment', 'living room', 'bedroom', 'kitchen', 'bathroom'],
    'restaurant': ['restaurant', 'cafe', 'dining', 'bar', 'pub', 'eatery', 'bistro'],
    'hospital': ['hospital', 'clinic', 'medical', 'doctor', 'emergency', 'ward'],
    'warehouse': ['warehouse', 'factory', 'industrial', 'storage', 'depot'],
    'beach': ['beach', 'ocean', 'sea', 'shore', 'coast', 'sand', 'waves'],
    'mountain': ['mountain', 'hill', 'peak', 'cliff', 'rocky', 'highland'],
    'rooftop': ['rooftop', 'roof', 'terrace', 'balcony', 'penthouse'],
    'basement': ['basement', 'cellar', 'underground', 'bunker', 'vault'],
    'church': ['church', 'cathedral', 'chapel', 'temple', 'mosque', 'sacred'],
    'school': ['school', 'classroom', 'university', 'college', 'campus', 'library'],
    'prison': ['prison', 'jail', 'cell', 'correctional', 'detention'],
    'parking': ['parking', 'garage', 'lot', 'carpark'],
    'hotel': ['hotel', 'lobby', 'reception', 'suite', 'motel'],
    'airport': ['airport', 'terminal', 'gate', 'runway', 'hangar'],
    'train': ['train', 'station', 'platform', 'railway', 'metro', 'subway'],
    'ship': ['ship', 'boat', 'yacht', 'deck', 'cabin', 'port', 'harbor'],
};

/**
 * Extract location keywords from group name/description
 */
export function extractLocationKeywords(text: string): string[] {
    const normalizedText = text.toLowerCase();
    const foundKeywords: string[] = [];

    for (const [category, keywords] of Object.entries(LOCATION_KEYWORDS_MAP)) {
        for (const keyword of keywords) {
            if (normalizedText.includes(keyword)) {
                foundKeywords.push(category);
                break; // Move to next category after first match
            }
        }
    }

    return [...new Set(foundKeywords)];
}

/**
 * Find similar locations in library based on keywords
 */
export function findSimilarLocations(
    searchText: string,
    locations: Location[]
): { location: Location; score: number; matchedKeywords: string[] }[] {
    const searchKeywords = extractLocationKeywords(searchText);

    if (searchKeywords.length === 0 || locations.length === 0) {
        return [];
    }

    const results: { location: Location; score: number; matchedKeywords: string[] }[] = [];

    for (const location of locations) {
        const matchedKeywords = location.keywords.filter(kw =>
            searchKeywords.includes(kw)
        );

        if (matchedKeywords.length > 0) {
            const score = matchedKeywords.length / Math.max(searchKeywords.length, location.keywords.length);
            results.push({ location, score, matchedKeywords });
        }
    }

    // Sort by score descending
    return results.sort((a, b) => b.score - a.score);
}

/**
 * Create a new location from group
 */
export function createLocationFromGroup(group: SceneGroup): Location {
    const keywords = extractLocationKeywords(`${group.name} ${group.description}`);

    return {
        id: `loc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: extractLocationName(group.name),
        description: group.description,
        conceptImage: group.conceptImage,
        keywords,
        createdAt: new Date().toISOString(),
        usageCount: 1
    };
}

/**
 * Extract clean location name from group name
 * "ACT 1 - Casino Battle" -> "Casino"
 * "Scene 10-15: Grand Hall" -> "Grand Hall"
 */
function extractLocationName(groupName: string): string {
    // Remove common prefixes
    let name = groupName
        .replace(/^(ACT|SCENE|SC|PART|CHAPTER)\s*\d*[\s-:]*/gi, '')
        .replace(/^\d+[\s-:]*/g, '')
        .trim();

    // Try to extract location from remaining text
    const keywords = extractLocationKeywords(name);

    if (keywords.length > 0) {
        // Capitalize first letter
        const mainKeyword = keywords[0];
        return mainKeyword.charAt(0).toUpperCase() + mainKeyword.slice(1);
    }

    // If no keywords found, use first 2-3 significant words
    const words = name.split(/\s+/).filter(w => w.length > 2);
    return words.slice(0, 2).join(' ') || name;
}

/**
 * Get effective concept image for a group (checks location library first)
 */
export function getEffectiveConceptImage(
    group: SceneGroup,
    locations: Location[]
): string | null | undefined {
    // If group has locationId, use location's concept
    if (group.locationId) {
        const location = locations.find(l => l.id === group.locationId);
        if (location?.conceptImage) {
            return location.conceptImage;
        }
    }

    // Fallback to group's own concept
    return group.conceptImage;
}

/**
 * Count how many groups use a location
 */
export function countLocationUsage(
    locationId: string,
    groups: SceneGroup[]
): number {
    return groups.filter(g => g.locationId === locationId).length;
}

/**
 * Auto-detect and suggest location for a new group
 */
export function autoDetectLocation(
    groupName: string,
    groupDescription: string,
    existingLocations: Location[]
): {
    suggested: Location | null;
    matches: { location: Location; score: number; matchedKeywords: string[] }[];
    detectedKeywords: string[];
} {
    const searchText = `${groupName} ${groupDescription}`;
    const detectedKeywords = extractLocationKeywords(searchText);
    const matches = findSimilarLocations(searchText, existingLocations);

    return {
        suggested: matches.length > 0 && matches[0].score >= 0.5 ? matches[0].location : null,
        matches,
        detectedKeywords
    };
}

console.log('[Location Library] Module loaded');
