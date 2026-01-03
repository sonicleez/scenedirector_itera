import React, { useState, useEffect } from 'react';
import { X, FolderOpen, Image, RefreshCw, Download, Edit3, Plus, Grid, List, ArrowLeft } from 'lucide-react';
import { GommoAI, GommoSpace, GommoGenerationGroup, GommoImageItem } from '../../utils/gommoAI';

interface GommoLibraryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectImage: (imageUrl: string) => void;
    gommoDomain?: string;
    gommoAccessToken?: string;
}

export const GommoLibraryModal: React.FC<GommoLibraryModalProps> = ({
    isOpen,
    onClose,
    onSelectImage,
    gommoDomain,
    gommoAccessToken
}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [spaces, setSpaces] = useState<GommoSpace[]>([]);
    const [groups, setGroups] = useState<GommoGenerationGroup[]>([]);
    const [images, setImages] = useState<GommoImageItem[]>([]);
    const [activeTab, setActiveTab] = useState<'spaces' | 'groups' | 'images'>('images');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedGroup, setSelectedGroup] = useState<GommoGenerationGroup | null>(null);

    // Load data when modal opens
    useEffect(() => {
        if (isOpen && gommoDomain && gommoAccessToken) {
            loadLibrary();
        }
    }, [isOpen, gommoDomain, gommoAccessToken]);

    const loadLibrary = async () => {
        if (!gommoDomain || !gommoAccessToken) {
            setError('Gommo credentials chưa được cấu hình. Vào Profile → Gommo AI để thiết lập.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const client = new GommoAI(gommoDomain, gommoAccessToken);

            const [spacesData, groupsData, imagesData] = await Promise.all([
                client.listSpaces(),
                client.listGenerationGroups('IMAGE'),
                client.listImages() // Load all recent images
            ]);

            setSpaces(spacesData);
            setGroups(groupsData);
            setImages(imagesData);
            console.log('[GommoLibrary] Loaded:', { spaces: spacesData.length, groups: groupsData.length, images: imagesData.length });
        } catch (err: any) {
            console.error('[GommoLibrary] Error:', err);
            setError(err.message || 'Không thể tải thư viện Gommo');
        } finally {
            setLoading(false);
        }
    };

    const loadImagesFromGroup = async (group: GommoGenerationGroup) => {
        if (!gommoDomain || !gommoAccessToken) return;

        setLoading(true);
        setSelectedGroup(group);
        setActiveTab('images');

        try {
            const client = new GommoAI(gommoDomain, gommoAccessToken);
            const imagesData = await client.listImages(group.id_base);
            setImages(imagesData);
        } catch (err) {
            console.error('[GommoLibrary] Load group images error:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp * 1000).toLocaleDateString('vi-VN');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="relative w-[90vw] max-w-5xl h-[80vh] bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl border border-white/10 flex flex-col overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
                            <FolderOpen className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Gommo Library</h2>
                            <p className="text-xs text-gray-400">Chọn ảnh từ thư viện để chỉnh sửa</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* View Mode Toggle */}
                        <div className="flex bg-white/10 rounded-lg p-0.5">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white/20 text-white' : 'text-gray-400 hover:text-white'}`}
                            >
                                <Grid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white/20 text-white' : 'text-gray-400 hover:text-white'}`}
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Refresh Button */}
                        <button
                            onClick={loadLibrary}
                            disabled={loading}
                            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-gray-300 hover:text-white disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-white/10 px-6">
                    <button
                        onClick={() => { setActiveTab('images'); setSelectedGroup(null); loadLibrary(); }}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'images'
                            ? 'border-yellow-500 text-yellow-400'
                            : 'border-transparent text-gray-400 hover:text-white'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <Image className="w-4 h-4" />
                            <span>All Images ({images.length})</span>
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('groups')}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'groups'
                            ? 'border-yellow-500 text-yellow-400'
                            : 'border-transparent text-gray-400 hover:text-white'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <FolderOpen className="w-4 h-4" />
                            <span>Groups ({groups.length})</span>
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('spaces')}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'spaces'
                            ? 'border-yellow-500 text-yellow-400'
                            : 'border-transparent text-gray-400 hover:text-white'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <FolderOpen className="w-4 h-4" />
                            <span>Spaces ({spaces.length})</span>
                        </div>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Error State */}
                    {error && (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="text-red-400 text-lg mb-2">⚠️ {error}</div>
                            <button
                                onClick={loadLibrary}
                                className="mt-4 px-4 py-2 bg-yellow-600 hover:bg-yellow-500 rounded-lg text-white text-sm font-medium transition-colors"
                            >
                                Thử lại
                            </button>
                        </div>
                    )}

                    {/* Loading State */}
                    {loading && !error && (
                        <div className="flex flex-col items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mb-4"></div>
                            <p className="text-gray-400">Đang tải thư viện...</p>
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && !error && (
                        <>
                            {/* Images Grid */}
                            {activeTab === 'images' && (
                                <>
                                    {selectedGroup && (
                                        <div className="flex items-center gap-2 mb-4 p-3 bg-white/5 rounded-lg">
                                            <button
                                                onClick={() => { setSelectedGroup(null); loadLibrary(); }}
                                                className="p-1 hover:bg-white/10 rounded"
                                            >
                                                <ArrowLeft className="w-4 h-4 text-gray-400" />
                                            </button>
                                            <span className="text-white font-medium">{selectedGroup.name}</span>
                                        </div>
                                    )}

                                    {images.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full text-center">
                                            <Image className="w-16 h-16 text-gray-600 mb-4" />
                                            <p className="text-gray-400 text-lg">Chưa có ảnh nào</p>
                                            <p className="text-gray-500 text-sm mt-2">Tạo ảnh bằng Gommo để thấy chúng ở đây</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                            {images.map((img) => (
                                                <div
                                                    key={img.id_base}
                                                    className="group relative aspect-square bg-slate-800 rounded-xl overflow-hidden border border-white/10 hover:border-yellow-500 cursor-pointer transition-all hover:scale-[1.02]"
                                                    onClick={() => {
                                                        onSelectImage(img.url);
                                                        onClose();
                                                    }}
                                                >
                                                    <img
                                                        src={img.url}
                                                        alt={img.prompt || 'Gommo image'}
                                                        className="w-full h-full object-cover"
                                                        loading="lazy"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <div className="absolute bottom-2 left-2 right-2">
                                                            <p className="text-white text-xs line-clamp-2">{img.prompt || 'No prompt'}</p>
                                                        </div>
                                                        <div className="absolute top-2 right-2 flex gap-1">
                                                            <button className="p-1.5 bg-yellow-600 hover:bg-yellow-500 rounded-lg text-white">
                                                                <Edit3 className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}

                            {activeTab === 'groups' && groups.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <Image className="w-16 h-16 text-gray-600 mb-4" />
                                    <p className="text-gray-400 text-lg">Chưa có generation groups nào</p>
                                    <p className="text-gray-500 text-sm mt-2">Tạo ảnh bằng Gommo để thấy chúng ở đây</p>
                                </div>
                            )}

                            {activeTab === 'spaces' && spaces.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <FolderOpen className="w-16 h-16 text-gray-600 mb-4" />
                                    <p className="text-gray-400 text-lg">Chưa có spaces nào</p>
                                    <p className="text-gray-500 text-sm mt-2">Tạo space mới để tổ chức media của bạn</p>
                                </div>
                            )}

                            {/* Generation Groups Grid */}
                            {activeTab === 'groups' && groups.length > 0 && (
                                <div className={viewMode === 'grid'
                                    ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
                                    : 'flex flex-col gap-2'
                                }>
                                    {groups.map((group) => (
                                        <div
                                            key={group.id_base}
                                            className={`group relative ${viewMode === 'grid'
                                                ? 'aspect-video bg-slate-800 rounded-xl border border-white/10 overflow-hidden hover:border-yellow-500/50 cursor-pointer transition-all hover:scale-[1.02]'
                                                : 'flex items-center gap-4 p-4 bg-slate-800 rounded-xl border border-white/10 hover:border-yellow-500/50 cursor-pointer transition-all'
                                                }`}
                                            onClick={() => {
                                                // TODO: Load images from this group
                                                console.log('Selected group:', group);
                                            }}
                                        >
                                            <div className={viewMode === 'grid' ? 'absolute inset-0 bg-gradient-to-t from-black/80 to-transparent' : 'hidden'}></div>

                                            <div className={viewMode === 'grid'
                                                ? 'absolute bottom-0 left-0 right-0 p-3'
                                                : 'flex-1'
                                            }>
                                                <p className="text-white font-medium text-sm truncate">{group.name}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${group.status === 'ACTIVE'
                                                        ? 'bg-green-500/20 text-green-400'
                                                        : 'bg-gray-500/20 text-gray-400'
                                                        }`}>
                                                        {group.status}
                                                    </span>
                                                    <span className="text-[10px] text-gray-500">{formatDate(group.created_at)}</span>
                                                </div>
                                            </div>

                                            {viewMode === 'list' && (
                                                <button className="p-2 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Spaces Grid */}
                            {activeTab === 'spaces' && spaces.length > 0 && (
                                <div className={viewMode === 'grid'
                                    ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
                                    : 'flex flex-col gap-2'
                                }>
                                    {spaces.map((space) => (
                                        <div
                                            key={space.id_base}
                                            className={`group relative ${viewMode === 'grid'
                                                ? 'aspect-square bg-slate-800 rounded-xl border border-white/10 overflow-hidden hover:border-yellow-500/50 cursor-pointer transition-all hover:scale-[1.02] flex flex-col items-center justify-center p-4'
                                                : 'flex items-center gap-4 p-4 bg-slate-800 rounded-xl border border-white/10 hover:border-yellow-500/50 cursor-pointer transition-all'
                                                }`}
                                            onClick={() => {
                                                // TODO: Load images from this space
                                                console.log('Selected space:', space);
                                            }}
                                        >
                                            <FolderOpen className={`${viewMode === 'grid' ? 'w-12 h-12' : 'w-8 h-8'} text-yellow-500`} />

                                            <div className={viewMode === 'grid' ? 'text-center mt-3' : 'flex-1'}>
                                                <p className="text-white font-medium text-sm truncate">{space.name}</p>
                                                {space.description && (
                                                    <p className="text-gray-500 text-xs mt-1 truncate">{space.description}</p>
                                                )}
                                                <p className="text-[10px] text-gray-600 mt-1">{formatDate(space.created_time)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-white/10 px-6 py-4 bg-white/5 flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                        💡 Tip: Chọn một group để xem và sử dụng ảnh đã tạo từ Gommo
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GommoLibraryModal;
