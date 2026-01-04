/**
 * Concept Generation Progress
 * 
 * Shows progress while generating concept art for locations.
 */

import React from 'react';
import styles from './ConceptGenerationProgress.module.css';

interface ProgressData {
    current: number;
    total: number;
    currentLocationName: string;
    status: 'idle' | 'generating' | 'complete' | 'error';
    completedIds: string[];
    failedIds: string[];
    error?: string;
}

interface ConceptGenerationProgressProps {
    progress: ProgressData;
    onAbort?: () => void;
    onComplete?: () => void;
}

export const ConceptGenerationProgress: React.FC<ConceptGenerationProgressProps> = ({
    progress,
    onAbort,
    onComplete
}) => {
    const percentage = progress.total > 0
        ? Math.round((progress.current / progress.total) * 100)
        : 0;

    const isGenerating = progress.status === 'generating';
    const isComplete = progress.status === 'complete';

    if (progress.status === 'idle') {
        return null;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <span className={styles.icon}>
                    {isComplete ? '✅' : '🎨'}
                </span>
                <span className={styles.title}>
                    {isComplete
                        ? 'Concept Generation Complete'
                        : 'Generating Location Concepts...'}
                </span>
            </div>

            {/* Progress Bar */}
            <div className={styles.progressBar}>
                <div
                    className={styles.progressFill}
                    style={{ width: `${percentage}%` }}
                />
            </div>

            {/* Status */}
            <div className={styles.status}>
                {isGenerating && (
                    <>
                        <span className={styles.current}>
                            {progress.current} / {progress.total}
                        </span>
                        <span className={styles.locationName}>
                            {progress.currentLocationName}
                        </span>
                    </>
                )}
                {isComplete && (
                    <span className={styles.summary}>
                        ✓ {progress.completedIds.length} generated
                        {progress.failedIds.length > 0 && (
                            <span className={styles.failed}>
                                • {progress.failedIds.length} failed
                            </span>
                        )}
                    </span>
                )}
            </div>

            {/* Actions */}
            <div className={styles.actions}>
                {isGenerating && onAbort && (
                    <button className={styles.abortBtn} onClick={onAbort}>
                        ✕ Cancel
                    </button>
                )}
                {isComplete && onComplete && (
                    <button className={styles.completeBtn} onClick={onComplete}>
                        Continue →
                    </button>
                )}
            </div>
        </div>
    );
};

export default ConceptGenerationProgress;
