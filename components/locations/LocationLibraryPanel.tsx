/**
 * Location Library Panel
 * 
 * Manage shared location concepts across scene groups.
 */

import React, { useState, useRef } from 'react';
import { Location, SceneGroup } from '../../types';
import { createLocationFromGroup, countLocationUsage, extractLocationKeywords } from '../../utils/locationLibrary';
import { QualityRating } from '../common/QualityRating';
import styles from './LocationLibraryPanel.module.css';

interface LocationLibraryPanelProps {
    locations: Location[];
    sceneGroups: SceneGroup[];
    isGenerating?: string | null;
    onAddLocation: (location: Location) => void;
    onUpdateLocation: (locationId: string, updates: Partial<Location>) => void;
    onDeleteLocation: (locationId: string) => void;
    onGenerateConcept?: (locationId: string) => void;
    onGenerateAll?: () => void;
    onAssignGroups?: (locationId: string, groupIds: string[]) => void;
    onEditImage?: (locationId: string, imageUrl: string) => void;
    onClose?: () => void;
}

export const LocationLibraryPanel: React.FC<LocationLibraryPanelProps> = ({
    locations,
    sceneGroups,
    isGenerating,
    onAddLocation,
    onUpdateLocation,
    onDeleteLocation,
    onGenerateConcept,
    onGenerateAll,
    onAssignGroups,
    onEditImage,
    onClose
}) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [assigningId, setAssigningId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadingLocationId, setUploadingLocationId] = useState<string | null>(null);

    const handleAddLocation = () => {
        if (!newName.trim()) return;

        const keywords = extractLocationKeywords(`${newName} ${newDescription}`);

        const newLocation: Location = {
            id: `loc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: newName.trim(),
            description: newDescription.trim(),
            keywords: keywords.length > 0 ? keywords : [newName.toLowerCase()],
            createdAt: new Date().toISOString(),
            usageCount: 0
        };

        onAddLocation(newLocation);
        setNewName('');
        setNewDescription('');
        setIsAdding(false);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, locationId: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            onUpdateLocation(locationId, { conceptImage: base64 });
            setUploadingLocationId(null);
        };
        reader.readAsDataURL(file);
    };

    const triggerUpload = (locationId: string) => {
        setUploadingLocationId(locationId);
        fileInputRef.current?.click();
    };

    return (
        <div className={styles.panel}>
            <div className={styles.header}>
                <div className={styles.headerText}>
                    <h2>📍 Location Library</h2>
                    <p className={styles.subtitle}>
                        Shared concept art across multiple scene groups
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginRight: '32px' }}>
                    {onGenerateAll && locations.some(l => !l.conceptImage) && (
                        <button
                            className={styles.generateAllBtn}
                            onClick={onGenerateAll}
                            disabled={Boolean(isGenerating)}
                        >
                            {isGenerating ? '⌛ Processing...' : '✨ Generate All Missing'}
                        </button>
                    )}
                </div>

                {onClose && (
                    <button className={styles.closeBtn} onClick={onClose}>✕</button>
                )}
            </div>

            <div className={styles.content}>
                {/* Add New Location */}
                {!isAdding ? (
                    <button className={styles.addBtn} onClick={() => setIsAdding(true)}>
                        + Add Location
                    </button>
                ) : (
                    <div className={styles.addForm}>
                        <input
                            type="text"
                            placeholder="Location name (e.g., Casino Interior)"
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            className={styles.input}
                            autoFocus
                        />
                        <textarea
                            placeholder="Description (optional)"
                            value={newDescription}
                            onChange={e => setNewDescription(e.target.value)}
                            className={styles.textarea}
                            rows={2}
                        />
                        <div className={styles.formActions}>
                            <button
                                className={styles.saveBtn}
                                onClick={handleAddLocation}
                                disabled={!newName.trim()}
                            >
                                Create Location
                            </button>
                            <button
                                className={styles.cancelBtn}
                                onClick={() => {
                                    setIsAdding(false);
                                    setNewName('');
                                    setNewDescription('');
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* Location List */}
                <div className={styles.locationList}>
                    {locations.length === 0 ? (
                        <div className={styles.empty}>
                            <span className={styles.emptyIcon}>🗺️</span>
                            <p>No locations yet</p>
                            <p className={styles.emptyHint}>
                                Create locations to share concept art across multiple scene groups
                            </p>
                        </div>
                    ) : (
                        locations.map(location => {
                            const usageCount = countLocationUsage(location.id, sceneGroups);
                            const isEditing = editingId === location.id;

                            return (
                                <div key={location.id} className={styles.locationCard}>
                                    {/* Concept Image */}
                                    <div
                                        className={styles.conceptImage}
                                        onClick={() => triggerUpload(location.id)}
                                    >
                                        {(isGenerating === location.id) && (
                                            <div className={styles.loadingOverlay}>
                                                <div className={styles.spinner} />
                                            </div>
                                        )}
                                        {location.conceptImage ? (
                                            <img src={location.conceptImage} alt={location.name} />
                                        ) : (
                                            <div className={styles.noImage}>
                                                <span>🖼️</span>
                                                <span>{isGenerating === location.id ? 'Generating...' : 'No image'}</span>
                                            </div>
                                        )}
                                        <div className={styles.imageOverlay}>
                                            <span onClick={(e) => {
                                                e.stopPropagation();
                                                triggerUpload(location.id);
                                            }}>📤 Upload</span>
                                            {onGenerateConcept && (
                                                <span
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onGenerateConcept(location.id);
                                                    }}
                                                >
                                                    ✨ {location.conceptImage ? 'Regen' : 'Generate'}
                                                </span>
                                            )}
                                            {location.conceptImage && onEditImage && (
                                                <span
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onEditImage(location.id, location.conceptImage!);
                                                    }}
                                                >
                                                    🎨 Edit
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className={styles.locationInfo}>
                                        {isEditing ? (
                                            <>
                                                <input
                                                    type="text"
                                                    value={location.name}
                                                    onChange={e => onUpdateLocation(location.id, { name: e.target.value })}
                                                    className={styles.editInput}
                                                />
                                                <textarea
                                                    value={location.description}
                                                    onChange={e => onUpdateLocation(location.id, { description: e.target.value })}
                                                    className={styles.editTextarea}
                                                    rows={2}
                                                />
                                                <button
                                                    className={styles.doneBtn}
                                                    onClick={() => setEditingId(null)}
                                                >
                                                    Done
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <h3 className={styles.locationName}>
                                                    {location.name}
                                                    {location.conceptImage && (
                                                        <QualityRating
                                                            dopRecordId={location.dopRecordId}
                                                            onRate={(rating) => onUpdateLocation(location.id, { rating })}
                                                            className="ml-2 inline-flex"
                                                        />
                                                    )}
                                                </h3>
                                                {location.description && (
                                                    <p className={styles.locationDesc}>{location.description}</p>
                                                )}

                                                {/* Keywords */}
                                                <div className={styles.keywords}>
                                                    {location.keywords.map(kw => (
                                                        <span key={kw} className={styles.keyword}>{kw}</span>
                                                    ))}
                                                </div>

                                                {/* Usage & Assignment */}
                                                <div className={styles.usage}>
                                                    <div className={styles.usageCount}>
                                                        <span>🔗</span>
                                                        <span>{usageCount} group{usageCount !== 1 ? 's' : ''}</span>
                                                    </div>

                                                    <button
                                                        className={styles.assignBtn}
                                                        onClick={() => setAssigningId(assigningId === location.id ? null : location.id)}
                                                    >
                                                        {assigningId === location.id ? 'Close' : '🔗 Assign Groups'}
                                                    </button>
                                                </div>

                                                {assigningId === location.id && onAssignGroups && (
                                                    <div className={styles.groupSelector}>
                                                        <h4>Assign to Groups</h4>
                                                        <div className={styles.groupOptions}>
                                                            {sceneGroups.map(group => (
                                                                <label key={group.id} className={styles.groupOption}>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={group.locationId === location.id}
                                                                        onChange={(e) => {
                                                                            const currentAssigned = sceneGroups
                                                                                .filter(g => g.locationId === location.id)
                                                                                .map(g => g.id);

                                                                            let newAssigned;
                                                                            if (e.target.checked) {
                                                                                newAssigned = [...currentAssigned, group.id];
                                                                            } else {
                                                                                newAssigned = currentAssigned.filter(id => id !== group.id);
                                                                            }
                                                                            onAssignGroups(location.id, newAssigned);
                                                                        }}
                                                                    />
                                                                    <span>{group.name}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className={styles.actions}>
                                        <button
                                            className={styles.actionBtn}
                                            onClick={() => setEditingId(location.id)}
                                            title="Edit"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                            onClick={() => {
                                                if (usageCount > 0) {
                                                    if (confirm(`This location is used by ${usageCount} group(s). Delete anyway?`)) {
                                                        onDeleteLocation(location.id);
                                                    }
                                                } else {
                                                    onDeleteLocation(location.id);
                                                }
                                            }}
                                            title="Delete"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Hidden file input */}
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={(e) => uploadingLocationId && handleImageUpload(e, uploadingLocationId)}
            />
        </div>
    );
};

export default LocationLibraryPanel;
