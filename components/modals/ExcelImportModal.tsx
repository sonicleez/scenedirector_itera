/**
 * ExcelImportModal
 * 
 * Modal for importing scene data from Excel/CSV files.
 * Creates a new project skeleton with Scenes, Groups, and Characters.
 */

import React, { useState, useCallback, useRef } from 'react';
import { X, Upload, FileSpreadsheet, Check, AlertCircle, ChevronDown, Loader2 } from 'lucide-react';
import { useExcelImport, ColumnMapping, ExcelImportResult } from '../../hooks/useExcelImport';
import { Scene, SceneGroup, Character } from '../../types';

interface ExcelImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (result: ExcelImportResult) => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
    isOpen,
    onClose,
    onImport
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [rowCount, setRowCount] = useState(0);
    const [mapping, setMapping] = useState<ColumnMapping | null>(null);
    const [showMapping, setShowMapping] = useState(false);

    const {
        isProcessing,
        error,
        previewData,
        headers,
        loadPreview,
        importFile,
        autoDetectMapping,
        DEFAULT_MAPPING
    } = useExcelImport();

    const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSelectedFile(file);
        const result = await loadPreview(file);
        if (result) {
            setRowCount(result.rowCount);
            const autoMapping = autoDetectMapping(result.headers);
            setMapping(autoMapping);
        }
    }, [loadPreview, autoDetectMapping]);

    const handleImport = useCallback(async () => {
        if (!selectedFile || !mapping) return;

        const result = await importFile(selectedFile, mapping);
        if (result) {
            onImport(result);
            onClose();
        }
    }, [selectedFile, mapping, importFile, onImport, onClose]);

    const updateMapping = (field: keyof ColumnMapping, value: string) => {
        if (!mapping) return;
        setMapping({ ...mapping, [field]: value });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden border border-zinc-700 shadow-2xl flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                            <FileSpreadsheet className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-white">Import from Excel</h2>
                            <p className="text-sm text-zinc-400">Create a new project from spreadsheet data</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-zinc-800 transition-colors">
                        <X className="w-5 h-5 text-zinc-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* File Upload */}
                    <div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full border-2 border-dashed border-zinc-700 rounded-xl p-8 text-center hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-colors"
                        >
                            <Upload className="w-10 h-10 text-zinc-500 mx-auto mb-3" />
                            <p className="text-white font-medium">
                                {selectedFile ? selectedFile.name : 'Click to upload Excel or CSV file'}
                            </p>
                            <p className="text-sm text-zinc-500 mt-1">
                                {selectedFile ? `${rowCount} rows detected` : 'Supports .xlsx, .xls, .csv'}
                            </p>
                        </button>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Preview */}
                    {previewData && previewData.length > 0 && (
                        <div>
                            <h3 className="text-sm font-medium text-zinc-400 mb-3">Preview (First 5 rows)</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-zinc-700">
                                            {headers.slice(0, 5).map((h, i) => (
                                                <th key={i} className="px-3 py-2 text-left text-zinc-400 font-medium">
                                                    {h}
                                                </th>
                                            ))}
                                            {headers.length > 5 && (
                                                <th className="px-3 py-2 text-zinc-500">+{headers.length - 5} more</th>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {previewData.map((row, i) => (
                                            <tr key={i} className="border-b border-zinc-800">
                                                {headers.slice(0, 5).map((h, j) => (
                                                    <td key={j} className="px-3 py-2 text-zinc-300 truncate max-w-[150px]">
                                                        {String(row[h] || '-')}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Column Mapping */}
                    {headers.length > 0 && mapping && (
                        <div>
                            <button
                                onClick={() => setShowMapping(!showMapping)}
                                className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                            >
                                <ChevronDown className={`w-4 h-4 transition-transform ${showMapping ? 'rotate-180' : ''}`} />
                                Column Mapping
                            </button>

                            {showMapping && (
                                <div className="mt-4 grid grid-cols-2 gap-4">
                                    {Object.entries(mapping).map(([field, value]) => (
                                        <div key={field}>
                                            <label className="text-xs text-zinc-500 block mb-1">
                                                {field.replace(/([A-Z])/g, ' $1').trim()}
                                            </label>
                                            <select
                                                value={value}
                                                onChange={(e) => updateMapping(field as keyof ColumnMapping, e.target.value)}
                                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white"
                                            >
                                                <option value="">-- Not Mapped --</option>
                                                {headers.map(h => (
                                                    <option key={h} value={h}>{h}</option>
                                                ))}
                                            </select>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Summary */}
                    {selectedFile && rowCount > 0 && (
                        <div className="bg-zinc-800/50 rounded-xl p-4">
                            <h3 className="text-sm font-medium text-white mb-2">Import Summary</h3>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <div className="text-2xl font-bold text-emerald-400">{rowCount}</div>
                                    <div className="text-xs text-zinc-500">Scenes</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-violet-400">
                                        {previewData ? new Set(previewData.map(r => r[mapping?.group || ''])).size : '?'}
                                    </div>
                                    <div className="text-xs text-zinc-500">Groups</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-amber-400">
                                        {previewData ? new Set(previewData.flatMap(r => String(r[mapping?.characterNames || '']).split(',').map(n => n.trim())).filter(Boolean)).size : '?'}
                                    </div>
                                    <div className="text-xs text-zinc-500">Characters</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-zinc-800 bg-zinc-900/50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleImport}
                        disabled={!selectedFile || isProcessing || rowCount === 0}
                        className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Check className="w-4 h-4" />
                                Import {rowCount} Scenes
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExcelImportModal;
