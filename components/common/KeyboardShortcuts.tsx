import React, { useState, useEffect, useCallback } from 'react';
import { Keyboard, X } from 'lucide-react';

interface KeyboardShortcutsProps {
    onTableView: () => void;
    onBoardView: () => void;
    onScrollToSceneMap: () => void;
    onSaveProject: () => void;
    onOpenProject: () => void;
}

const SHORTCUTS = [
    { key: 'T', description: 'Chuyển sang Table View', mod: false },
    { key: 'B', description: 'Chuyển sang Board View', mod: false },
    { key: 'H', description: 'Về Scene Map', mod: false },
    { key: 'S', description: 'Lưu project về máy', mod: true },
    { key: 'O', description: 'Mở project từ máy', mod: true },
];

export function KeyboardShortcuts({
    onTableView,
    onBoardView,
    onScrollToSceneMap,
    onSaveProject,
    onOpenProject,
}: KeyboardShortcutsProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        // Ignore if typing in input/textarea
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
            return;
        }

        // Ctrl/Cmd + S: Save
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
            e.preventDefault();
            onSaveProject();
            return;
        }

        // Ctrl/Cmd + O: Open
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'o') {
            e.preventDefault();
            onOpenProject();
            return;
        }

        // Single key shortcuts (no modifiers)
        if (!e.ctrlKey && !e.metaKey && !e.altKey) {
            switch (e.key.toLowerCase()) {
                case 't':
                    onTableView();
                    break;
                case 'b':
                    onBoardView();
                    break;
                case 'h':
                    onScrollToSceneMap();
                    break;
            }
        }
    }, [onTableView, onBoardView, onScrollToSceneMap, onSaveProject, onOpenProject]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return (
        <div className="fixed bottom-4 left-4 z-[200]">
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${isOpen
                        ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/30'
                        : 'bg-gray-900/60 text-gray-500 hover:text-gray-300 hover:bg-gray-800/80 backdrop-blur-sm'
                    } border border-gray-700/50`}
                title="Phím tắt (Keyboard Shortcuts)"
            >
                {isOpen ? <X size={16} /> : <Keyboard size={16} />}
            </button>

            {/* Shortcuts Panel */}
            {isOpen && (
                <div className="absolute bottom-12 left-0 w-64 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl p-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Keyboard size={12} />
                        Phím tắt
                    </h4>
                    <div className="space-y-2">
                        {SHORTCUTS.map((shortcut) => (
                            <div
                                key={shortcut.key}
                                className="flex items-center justify-between text-xs"
                            >
                                <span className="text-gray-400">{shortcut.description}</span>
                                <kbd className={`px-2 py-0.5 rounded text-[10px] font-mono ${shortcut.mod
                                        ? 'bg-blue-900/50 text-blue-300 border border-blue-700/50'
                                        : 'bg-gray-800 text-gray-300 border border-gray-700'
                                    }`}>
                                    {shortcut.mod ? `Ctrl+${shortcut.key}` : shortcut.key}
                                </kbd>
                            </div>
                        ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-800 text-[9px] text-gray-500">
                        💡 Không hoạt động khi đang gõ văn bản
                    </div>
                </div>
            )}
        </div>
    );
}
