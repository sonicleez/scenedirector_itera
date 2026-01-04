/**
 * Quality Rating Component
 * 
 * Allows user to rate generated images for DOP learning.
 * Shows 👍 for approval and 👎 with rejection reasons in glassmorphism popup.
 */

import React, { useState, useRef, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, AlertTriangle, X, CheckCircle2 } from 'lucide-react';
import { approvePrompt, rejectPrompt, RejectReason } from '../../utils/dopLearning';

interface QualityRatingProps {
    dopRecordId?: string;
    onRate?: (rating: 'good' | 'bad', reasons?: RejectReason[]) => void;
    size?: 'sm' | 'md';
    className?: string;
}

// Rejection reasons with Vietnamese labels
const REJECTION_OPTIONS: { value: RejectReason; label: string; emoji: string }[] = [
    { value: 'raccord_error', label: 'Sai Raccord/Continuity', emoji: '🔗' },
    { value: 'character_mismatch', label: 'Nhân vật không khớp', emoji: '👤' },
    { value: 'wrong_outfit', label: 'Sai trang phục', emoji: '👔' },
    { value: 'wrong_pose', label: 'Sai tư thế', emoji: '🧍' },
    { value: 'wrong_angle', label: 'Sai góc camera', emoji: '📷' },
    { value: 'wrong_lighting', label: 'Sai ánh sáng', emoji: '💡' },
    { value: 'wrong_background', label: 'Sai background', emoji: '🏞️' },
    { value: 'quality_issue', label: 'Chất lượng kém', emoji: '📉' },
    { value: 'prompt_ignored', label: 'AI bỏ qua prompt', emoji: '🚫' },
    { value: 'nsfw_content', label: 'NSFW/Không phù hợp', emoji: '⚠️' },
    { value: 'other', label: 'Lý do khác', emoji: '❓' },
];

export function QualityRating({
    dopRecordId,
    onRate,
    size = 'sm',
    className = ''
}: QualityRatingProps) {
    const [rated, setRated] = useState<'good' | 'bad' | null>(null);
    const [isRating, setIsRating] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedReasons, setSelectedReasons] = useState<RejectReason[]>([]);

    const handleApprove = async () => {
        if (rated || isRating) return;
        setIsRating(true);

        try {
            if (dopRecordId) {
                await approvePrompt(dopRecordId, {
                    overall: 0.95,
                    match: 0.95
                });
                console.log('[QualityRating] Approved:', dopRecordId);
            }
            setRated('good');
            onRate?.('good');
        } catch (e) {
            console.error('[QualityRating] Approve failed:', e);
        } finally {
            setIsRating(false);
        }
    };

    const handleReject = async () => {
        if (selectedReasons.length === 0) {
            return;
        }

        setIsRating(true);
        try {
            if (dopRecordId) {
                await rejectPrompt(dopRecordId, selectedReasons);
                console.log('[QualityRating] Rejected:', dopRecordId, selectedReasons);
            }
            setRated('bad');
            setShowRejectModal(false);
            onRate?.('bad', selectedReasons);
        } catch (e) {
            console.error('[QualityRating] Reject failed:', e);
        } finally {
            setIsRating(false);
        }
    };

    const toggleReason = (reason: RejectReason) => {
        setSelectedReasons(prev =>
            prev.includes(reason)
                ? prev.filter(r => r !== reason)
                : [...prev, reason]
        );
    };

    const iconSize = size === 'sm' ? 14 : 18;
    const buttonSize = size === 'sm' ? 'p-1' : 'p-1.5';

    // Already rated - show result
    if (rated) {
        return (
            <div className={`flex items-center gap-1 ${className}`}>
                {rated === 'good' ? (
                    <span className="text-green-500 text-xs flex items-center gap-0.5">
                        <ThumbsUp size={iconSize} fill="currentColor" /> Đã đánh giá tốt
                    </span>
                ) : (
                    <span className="text-red-400 text-xs flex items-center gap-0.5">
                        <ThumbsDown size={iconSize} fill="currentColor" /> Đã báo lỗi ({selectedReasons.length})
                    </span>
                )}
            </div>
        );
    }

    const isDisabled = isRating || !dopRecordId;

    return (
        <>
            <div className={`flex items-center gap-1 ${className}`}>
                <span className="text-gray-500 text-xs mr-1">
                    {dopRecordId ? 'Đánh giá:' : '⏳'}
                </span>

                {/* Approve button */}
                <button
                    onClick={handleApprove}
                    disabled={isDisabled}
                    className={`${buttonSize} rounded hover:bg-green-500/20 text-gray-400 hover:text-green-500 
                        transition-colors disabled:opacity-50`}
                    title="Ảnh tốt - DOP sẽ học pattern này"
                >
                    <ThumbsUp size={iconSize} />
                </button>

                {/* Reject button - opens modal */}
                <button
                    onClick={() => setShowRejectModal(true)}
                    disabled={isDisabled}
                    className={`${buttonSize} rounded hover:bg-red-500/20 text-gray-400 hover:text-red-400 
                        transition-colors disabled:opacity-50`}
                    title="Báo lỗi - Chọn lý do"
                >
                    <ThumbsDown size={iconSize} />
                </button>
            </div>

            {/* Glassmorphism Modal */}
            {showRejectModal && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    onClick={() => setShowRejectModal(false)}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                    {/* Modal Content */}
                    <div
                        className="relative w-full max-w-md bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700/50 bg-gradient-to-r from-red-900/30 to-orange-900/20">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-500/20 rounded-lg">
                                    <AlertTriangle size={20} className="text-red-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Chọn lý do lỗi</h3>
                                    <p className="text-xs text-gray-400">DOP sẽ học để tránh lỗi này</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowRejectModal(false)}
                                className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
                            >
                                <X size={18} className="text-gray-400 hover:text-white" />
                            </button>
                        </div>

                        {/* Options Grid */}
                        <div className="p-4">
                            <div className="grid grid-cols-2 gap-2">
                                {REJECTION_OPTIONS.map(opt => {
                                    const isSelected = selectedReasons.includes(opt.value);
                                    return (
                                        <button
                                            key={opt.value}
                                            onClick={() => toggleReason(opt.value)}
                                            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all ${isSelected
                                                    ? 'bg-red-500/20 border-2 border-red-500/50 text-red-300 shadow-lg shadow-red-500/10'
                                                    : 'bg-gray-800/50 border-2 border-transparent text-gray-300 hover:bg-gray-700/50 hover:border-gray-600'
                                                }`}
                                        >
                                            <span className="text-lg">{opt.emoji}</span>
                                            <span className="text-sm font-medium flex-1">{opt.label}</span>
                                            {isSelected && (
                                                <CheckCircle2 size={16} className="text-red-400" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-5 py-4 border-t border-gray-700/50 bg-gray-900/50 flex gap-3">
                            <button
                                onClick={handleReject}
                                disabled={selectedReasons.length === 0 || isRating}
                                className={`flex-1 px-4 py-3 rounded-xl font-bold text-sm transition-all ${selectedReasons.length > 0
                                        ? 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white shadow-lg shadow-red-500/25'
                                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                {isRating ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="animate-spin">⏳</span> Đang gửi...
                                    </span>
                                ) : (
                                    `Báo lỗi (${selectedReasons.length})`
                                )}
                            </button>
                            <button
                                onClick={() => {
                                    setSelectedReasons([]);
                                    setShowRejectModal(false);
                                }}
                                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium text-sm transition-colors"
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default QualityRating;
