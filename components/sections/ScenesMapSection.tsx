import React from 'react';
import { Table, LayoutGrid, Trash2, Plus, ImageMinus, ChevronDown, ChevronRight, Zap, Image as ImageIcon, Wind, Clock, Sun } from 'lucide-react';
import { SceneRow } from '../scenes/SceneRow';
import { StoryBoardCard } from '../scenes/StoryBoardCard';
import { Tooltip } from '../common/Tooltip';
import { Scene, Character, Product } from '../../types';
import { PRIMARY_GRADIENT, PRIMARY_GRADIENT_HOVER, VEO_PRESETS } from '../../constants/presets';

interface ScenesMapSectionProps {
    scenes: Scene[];
    viewMode: 'table' | 'storyboard';
    setViewMode: (mode: 'table' | 'storyboard') => void;
    characters: Character[];
    products: Product[];
    sceneGroups: any[];
    updateScene: (id: string, updates: Partial<Scene>) => void;
    removeScene: (id: string) => void;
    insertScene: (index: number) => void;
    moveScene: (fromIndex: number, toIndex: number) => void;
    performImageGeneration: (id: string, refinement?: string, isEndFrame?: boolean) => void;
    handleOpenImageViewer: (index: number) => void;
    handleGenerateAllImages: () => void;
    isBatchGenerating: boolean;
    isStopping: boolean;
    stopBatchGeneration: () => void;
    handleGenerateAllVeoPrompts: () => void;
    generateVeoPrompt: (sceneId: string) => void;
    suggestVeoPresets: () => void;
    applyPresetToAll: (preset: string) => void;
    isVeoGenerating: boolean;
    handleGenerateAllVideos: () => void;
    isVideoGenerating: boolean;
    addScene: () => void;
    detailedScript: string;
    onDetailedScriptChange: (val: string) => void;
    onCleanAll: () => void;
    createGroup: (name: string, description?: string) => string;
    updateGroup: (id: string, updates: Partial<{ name: string; description: string }>) => void;
    deleteGroup: (id: string) => void;
    assignSceneToGroup: (sceneId: string, groupId: string | undefined) => void;
    draggedSceneIndex: number | null;
    setDraggedSceneIndex: (idx: number | null) => void;
    dragOverIndex: number | null;
    setDragOverIndex: (idx: number | null) => void;
    onClearAllImages: () => void;
    onInsertAngles?: (sceneId: string, selections: { value: string; customPrompt?: string }[], sourceImage: string) => void;
    onGenerateGroupImages?: (groupId: string) => void;
    onClearGroupImages?: (groupId: string) => void;
}

export const ScenesMapSection: React.FC<ScenesMapSectionProps> = ({
    scenes,
    viewMode,
    setViewMode,
    characters,
    products,
    updateScene,
    removeScene,
    insertScene,
    moveScene,
    performImageGeneration,
    handleOpenImageViewer,
    handleGenerateAllImages,
    isBatchGenerating,
    isStopping,
    stopBatchGeneration,
    handleGenerateAllVeoPrompts,
    generateVeoPrompt,
    suggestVeoPresets,
    applyPresetToAll,
    isVeoGenerating,
    handleGenerateAllVideos,
    isVideoGenerating,
    addScene,
    detailedScript,
    onDetailedScriptChange,
    onCleanAll,
    createGroup,
    updateGroup,
    deleteGroup,
    assignSceneToGroup,
    sceneGroups,
    draggedSceneIndex,
    setDraggedSceneIndex,
    dragOverIndex,
    setDragOverIndex,
    onClearAllImages,
    onInsertAngles,
    onGenerateGroupImages,
    onClearGroupImages
}) => {
    const [collapsedGroups, setCollapsedGroups] = React.useState<Record<string, boolean>>({});
    const [activeGroupMenu, setActiveGroupMenu] = React.useState<string | null>(null);

    const toggleGroupCollapse = (groupId: string | undefined) => {
        const id = groupId || 'none';
        setCollapsedGroups(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const isGroupCollapsed = (groupId: string | undefined) => {
        return !!collapsedGroups[groupId || 'none'];
    };

    const toggleAllGroups = (collapse: boolean) => {
        const newCollapsed: Record<string, boolean> = {};
        sceneGroups.forEach(g => { newCollapsed[g.id] = collapse; });
        newCollapsed['none'] = collapse;
        setCollapsedGroups(newCollapsed);
    };
    return (
        <div className="my-16">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center space-x-6">
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-orange to-brand-red">Scenes Maps</h2>
                    <div className="flex bg-gray-900/50 p-1 rounded-lg border border-gray-700/50 h-10 items-center">
                        <button
                            onClick={() => setViewMode('table')}
                            className={`flex items-center space-x-2 px-3 h-full rounded-md transition-all ${viewMode === 'table' ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20' : 'text-gray-400 hover:text-gray-200'}`}
                        >
                            <Table size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest leading-none">Table</span>
                        </button>
                        <button
                            onClick={() => setViewMode('storyboard')}
                            className={`flex items-center space-x-2 px-3 h-full rounded-md transition-all ${viewMode === 'storyboard' ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20' : 'text-gray-400 hover:text-gray-200'}`}
                        >
                            <LayoutGrid size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest leading-none">Board</span>
                        </button>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={handleGenerateAllImages}
                        disabled={isBatchGenerating}
                        className={`h-11 w-48 font-black text-[11px] text-brand-cream rounded-xl bg-gradient-to-r ${PRIMARY_GRADIENT} hover:${PRIMARY_GRADIENT_HOVER} shadow-lg shadow-brand-orange/20 transition-all duration-300 transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest`}
                    >
                        {isBatchGenerating ? '1. Đang tạo...' : '1. Tạo ảnh hàng loạt'}
                    </button>

                    <button
                        onClick={handleGenerateAllVeoPrompts}
                        disabled={isVeoGenerating}
                        className={`h-11 w-48 font-black text-[11px] text-brand-cream rounded-xl bg-gradient-to-r from-brand-red to-brand-brown hover:from-brand-orange hover:to-brand-red shadow-lg shadow-brand-red/20 transition-all duration-300 transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 uppercase tracking-widest`}
                    >
                        {isVeoGenerating ? '2. Đang tạo...' : '2. Tạo Veo Prompts'}
                    </button>

                    <button
                        onClick={handleGenerateAllVideos}
                        disabled={isVideoGenerating}
                        className={`h-11 w-48 font-black text-[11px] text-brand-cream rounded-xl bg-gradient-to-r from-brand-brown to-brand-orange hover:from-brand-red hover:to-brand-orange shadow-lg shadow-brand-orange/20 transition-all duration-300 transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 uppercase tracking-widest`}
                    >
                        {isVideoGenerating ? '3. Đang tạo...' : '3. Tạo Video (Veo)'}
                    </button>

                    <button
                        onClick={addScene}
                        className={`h-11 w-32 font-black text-[11px] text-brand-cream rounded-xl bg-brand-orange hover:bg-brand-red shadow-lg shadow-brand-orange/20 transition-all duration-300 transform hover:scale-[1.02] active:scale-95 uppercase tracking-widest`}
                    >
                        + Scene
                    </button>

                    <button
                        onClick={() => {
                            const allVisual = scenes.map(s => s.contextDescription || '').filter(t => t).join('\n\n');
                            if (allVisual) {
                                navigator.clipboard.writeText(allVisual).then(() => alert('📋 Copied all Visual Prompts!'));
                            } else {
                                alert('⚠️ No Visual Prompts to copy.');
                            }
                        }}
                        className="h-11 w-11 flex items-center justify-center text-gray-400 hover:text-brand-cream bg-gray-900 border border-gray-700 rounded-xl transition-all shadow-xl active:scale-95"
                        title="Copy All Visual Prompts (Image Generation)"
                    >
                        📋
                    </button>

                    {isBatchGenerating && (
                        <button
                            onClick={stopBatchGeneration}
                            disabled={isStopping}
                            className="h-11 px-4 font-black text-[11px] text-white rounded-xl bg-red-600 hover:bg-red-700 shadow-lg shadow-red-900/20 transition-all uppercase tracking-widest"
                        >
                            {isStopping ? '...' : 'STOP'}
                        </button>
                    )}

                    <button
                        onClick={() => {
                            if (confirm('⚠️ Xóa TẤT CẢ ảnh đã tạo trong scenes? Hành động này không thể hoàn tác.')) {
                                onClearAllImages();
                            }
                        }}
                        className="h-11 px-4 flex items-center gap-2 font-black text-[11px] text-red-400 rounded-xl bg-red-900/20 hover:bg-red-900/40 border border-red-900/50 shadow-lg transition-all uppercase tracking-widest"
                        title="Xóa tất cả ảnh đã tạo trong scenes"
                    >
                        <ImageMinus size={16} />
                        Xóa hết ảnh
                    </button>

                    <div className="flex bg-gray-900/50 p-1 rounded-lg border border-gray-700/50 h-10 items-center">
                        <button
                            onClick={() => toggleAllGroups(true)}
                            className="flex items-center space-x-2 px-3 h-full rounded-md text-gray-400 hover:text-gray-200 transition-all text-[9px] font-bold uppercase"
                            title="Collapse All Groups"
                        >
                            <ChevronRight size={12} />
                            <span>Collapse</span>
                        </button>
                        <button
                            onClick={() => toggleAllGroups(false)}
                            className="flex items-center space-x-2 px-3 h-full rounded-md text-gray-400 hover:text-gray-200 transition-all text-[9px] font-bold uppercase"
                            title="Expand All Groups"
                        >
                            <ChevronDown size={12} />
                            <span>Expand</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* SECONDARY ROW: VEO PRESET CONTROLS */}
            <div className="flex justify-end mb-8">
                <div className="flex items-center gap-1 bg-gray-900/80 p-1.5 rounded-xl border border-gray-700/50 h-11 backdrop-blur-md shadow-2xl">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-3">Veo Expert Controls:</span>
                    <div className="w-px h-4 bg-gray-700 mx-1"></div>
                    <button
                        onClick={suggestVeoPresets}
                        disabled={isVeoGenerating}
                        className="h-full px-4 text-[10px] font-black text-blue-400 hover:text-blue-300 transition-all uppercase tracking-widest flex items-center gap-2 hover:bg-blue-500/10 rounded-lg"
                        title="AI sẽ tự động chọn Preset tốt nhất cho từng cảnh (Dựa trên hướng dẫn Veo 3.1)"
                    >
                        ✨ AI Suggest Presets
                    </button>
                    <div className="w-px h-4 bg-gray-700 mx-1"></div>
                    <div className="flex items-center px-4 gap-3">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Apply to All:</span>
                        <select
                            onChange={(e) => {
                                if (e.target.value) applyPresetToAll(e.target.value);
                            }}
                            className="bg-gray-800 border border-gray-700 text-[10px] font-black text-brand-cream outline-none cursor-pointer px-3 py-1 rounded-md focus:border-brand-orange transition-all uppercase tracking-wider"
                            defaultValue=""
                        >
                            <option value="" disabled>Select Preset...</option>
                            {VEO_PRESETS.map(p => (
                                <option key={p.value} value={p.value} className="bg-gray-900">{p.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="w-px h-4 bg-gray-700 mx-1"></div>
                    <button
                        onClick={() => {
                            const allVeo = scenes.map(s => s.veoPrompt || '').filter(t => t).join('\n\n');
                            if (allVeo) {
                                navigator.clipboard.writeText(allVeo).then(() => alert('📋 Copied all Veo Prompts!'));
                            } else {
                                alert('⚠️ No Veo Prompts to copy. Generate them first!');
                            }
                        }}
                        className="h-full px-4 text-[10px] font-black text-brand-orange hover:text-white transition-all uppercase tracking-widest flex items-center gap-2 hover:bg-brand-orange/10 rounded-lg"
                        title="Copy All Veo Prompts"
                    >
                        📋 Copy All Veo Prompts
                    </button>
                </div>
            </div>

            {/* === DETAILED SCRIPT SECTION === */}
            <div className="mb-8 p-6 bg-gray-800/40 rounded-xl border border-gray-700/50 backdrop-blur-sm">
                <div className="flex justify-between items-center mb-3">
                    <label className="flex items-center text-sm font-bold text-gray-200">
                        <span className="text-xl mr-2">📜</span> Kịch bản Chi tiết (Detailed Story)
                    </label>
                    <span className="text-xs text-brand-orange bg-brand-orange/10 px-2 py-1 rounded">Read-only / Reference</span>
                </div>
                <textarea
                    value={detailedScript}
                    onChange={(e) => onDetailedScriptChange(e.target.value)}
                    placeholder="Nội dung cốt truyện chi tiết sẽ được hiển thị ở đây giúp bạn nắm bắt mạch chuyện..."
                    className="w-full h-48 bg-gray-900/50 text-gray-300 px-4 py-3 rounded-lg border border-gray-700/50 focus:outline-none focus:ring-1 focus:ring-brand-orange text-sm leading-relaxed scrollbar-thin scrollbar-thumb-gray-600 font-mono"
                />
                <div className="flex justify-end mt-2">
                    <button
                        onClick={onCleanAll}
                        className="flex items-center space-x-2 px-3 py-1.5 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded border border-red-900/50 transition-colors"
                        title="Xóa toàn bộ kịch bản và scene để làm lại từ đầu"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa sạch & Làm mới (Clean All)</span>
                    </button>
                </div>
            </div>

            {viewMode === 'table' && (
                <div className="hidden md:grid grid-cols-12 gap-4 px-4 pb-2 text-sm font-bold text-gray-400 border-b-2 border-gray-700">
                    <div className="col-span-1 text-center relative group">Scene <span className="text-brand-orange">(?)</span><Tooltip text="Số thứ tự phân cảnh. Tên file ảnh sẽ được đặt theo cột này." /></div>
                    <div className="col-span-2">Script (Lang 1/Viet)</div>
                    <div className="col-span-2">Tên/Bối cảnh</div>
                    <div className="col-span-3">Veo Video Prompt <span className="text-blue-400">(New)</span></div>
                    <div className="col-span-1">Nhân vật</div>
                    <div className="col-span-3 text-center">Ảnh</div>
                </div>
            )}
            {/* === SCENES LIST WITH GROUPS === */}
            <div className={`mt-4 ${viewMode === 'storyboard' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6' : 'space-y-4'}`}>
                {(() => {
                    const renderedScenes: React.ReactNode[] = [];
                    let currentGroupId: string | undefined | 'initial' = 'initial';

                    scenes.forEach((scene, index) => {
                        // Check if we need to render a Group Header
                        if (scene.groupId !== currentGroupId) {
                            currentGroupId = scene.groupId;
                            const group = sceneGroups?.find(g => g.id === currentGroupId);
                            const groupScenes = scenes.filter(s => s.groupId === currentGroupId);
                            const scenesWithImages = groupScenes.filter(s => s.generatedImage).length;
                            const isCollapsed = isGroupCollapsed(currentGroupId);

                            const groupIdToDelete = currentGroupId;
                            const headerKey = `group-header-${currentGroupId || 'none'}-${index}`;
                            renderedScenes.push(
                                <div key={headerKey}
                                    onClick={() => toggleGroupCollapse(groupIdToDelete)}
                                    className={`col-span-full py-4 flex items-center justify-between border-b border-gray-700/50 mb-2 cursor-pointer hover:bg-white/5 transition-all group ${viewMode === 'table' ? 'px-4' : ''}`}
                                >
                                    <div className="flex items-center space-x-4 flex-1">
                                        {isCollapsed ? <ChevronRight size={18} className="text-gray-500" /> : <ChevronDown size={18} className="text-gray-400" />}

                                        {/* Group Concept Thumbnail */}
                                        {group?.conceptImage && (
                                            <div className="w-16 h-10 rounded border border-gray-700 overflow-hidden shadow-lg flex-shrink-0">
                                                <img src={group.conceptImage} alt="Concept" className="w-full h-full object-cover" />
                                            </div>
                                        )}

                                        <div className="flex-1">
                                            {group ? (
                                                <div className="space-y-1">
                                                    <div className="flex items-center space-x-3">
                                                        <input
                                                            value={group.name}
                                                            onClick={(e) => e.stopPropagation()}
                                                            onChange={(e) => updateGroup(group.id, { name: e.target.value })}
                                                            className="bg-transparent border-none text-lg font-bold text-white focus:ring-1 focus:ring-purple-500 rounded px-1 min-w-[200px]"
                                                            placeholder="Group Name"
                                                        />
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full uppercase tracking-wider font-black">Group</span>
                                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${scenesWithImages === groupScenes.length ? 'bg-green-500/20 text-green-400' : 'bg-gray-800 text-gray-400'}`}>
                                                                {scenesWithImages}/{groupScenes.length} scenes
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-[10px] text-gray-500">
                                                        {group.timeOfDay && (
                                                            <span className="flex items-center gap-1 bg-gray-800/50 px-2 py-0.5 rounded">
                                                                <Clock size={10} /> {group.timeOfDay}
                                                            </span>
                                                        )}
                                                        {group.weather && (
                                                            <span className="flex items-center gap-1 bg-gray-800/50 px-2 py-0.5 rounded">
                                                                <Wind size={10} /> {group.weather}
                                                            </span>
                                                        )}
                                                        {group.lightingMood && (
                                                            <span className="flex items-center gap-1 bg-gray-800/50 px-2 py-0.5 rounded">
                                                                <Sun size={10} /> {group.lightingMood}
                                                            </span>
                                                        )}
                                                        <span className="italic truncate max-w-sm">{group.description || 'No description...'}</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-lg font-bold text-gray-400">Default Group / Loose Scenes</h3>
                                                    <span className="text-[10px] bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full font-bold">
                                                        {groupScenes.length} scenes
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3" onClick={(e) => e.stopPropagation()}>
                                        {currentGroupId && (
                                            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => onGenerateGroupImages && onGenerateGroupImages(currentGroupId!)}
                                                    className="p-2 text-purple-400 hover:text-white bg-purple-500/10 hover:bg-purple-600 rounded-lg border border-purple-500/30 transition-all flex items-center gap-1.5 text-[9px] font-bold"
                                                    title="Tạo ảnh hàng loạt cho riêng nhóm này"
                                                >
                                                    <Zap size={10} /> Tạo ảnh nhóm
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (confirm(`Xóa toàn bộ ảnh trong nhóm "${group?.name || 'này'}"?`)) {
                                                            onClearGroupImages && onClearGroupImages(currentGroupId!);
                                                        }
                                                    }}
                                                    className="p-2 text-gray-500 hover:text-red-400 bg-gray-800 hover:bg-red-500/10 rounded-lg border border-gray-700 transition-all"
                                                    title="Flush group images"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        )}

                                        {!currentGroupId ? (
                                            <button
                                                onClick={() => {
                                                    const name = prompt("Enter Group Name (e.g., 'On Deck', 'Cabin'):");
                                                    if (name) {
                                                        const gId = createGroup(name);
                                                        assignSceneToGroup(scene.id, gId);
                                                    }
                                                }}
                                                className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg border border-gray-700 transition-all flex items-center gap-1.5"
                                            >
                                                <Plus size={12} /> New Group
                                            </button>
                                        ) : (
                                            <div className="relative">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveGroupMenu(activeGroupMenu === currentGroupId ? null : currentGroupId as string);
                                                    }}
                                                    className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg border border-transparent hover:border-gray-700 transition-all font-bold"
                                                >
                                                    •••
                                                </button>

                                                {activeGroupMenu === currentGroupId && (
                                                    <div className="absolute right-0 top-full mt-1 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl z-[60] overflow-hidden py-1 animate-fade-in" onClick={(e) => e.stopPropagation()}>
                                                        <button
                                                            onClick={() => {
                                                                if (confirm('Unassign this scene from group?')) {
                                                                    assignSceneToGroup(scene.id, undefined);
                                                                    setActiveGroupMenu(null);
                                                                }
                                                            }}
                                                            className="w-full text-left px-4 py-2 text-[10px] text-gray-300 hover:bg-gray-800 font-bold uppercase tracking-wider"
                                                        >
                                                            Unassign Scene
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                if (confirm('Delete this group? Scenes will be unassigned.')) {
                                                                    deleteGroup(groupIdToDelete!);
                                                                    setActiveGroupMenu(null);
                                                                }
                                                            }}
                                                            className="w-full text-left px-4 py-2 text-[10px] text-red-400 hover:bg-red-500/10 font-bold uppercase tracking-wider border-t border-gray-800"
                                                        >
                                                            Delete Group
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        }

                        // Skip rendering scenes if group is collapsed
                        if (isGroupCollapsed(currentGroupId)) return null;

                        // Render the Scene (Row or Card)
                        renderedScenes.push(
                            <React.Fragment key={scene.id}>
                                {viewMode === 'table' && (
                                    <>
                                        {/* Insert Button Before each row */}
                                        <div className="relative h-2 group/insert">
                                            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-brand-orange/0 group-hover/insert:border-brand-orange/30 transition-all"></div>
                                            <button
                                                onClick={() => insertScene(index)}
                                                className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-orange text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover/insert:opacity-100 transition-all shadow-xl z-20 hover:scale-125"
                                                title="Chèn phân cảnh mới vào đây"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>

                                        <SceneRow
                                            scene={scene}
                                            index={index}
                                            characters={characters}
                                            products={products}
                                            sceneGroups={sceneGroups}
                                            assignSceneToGroup={assignSceneToGroup}
                                            updateScene={updateScene}
                                            removeScene={removeScene}
                                            generateImage={() => performImageGeneration(scene.id)}
                                            generateEndFrame={() => performImageGeneration(scene.id, undefined, true)}
                                            generateVeoPrompt={generateVeoPrompt}
                                            openImageViewer={() => handleOpenImageViewer(index)}
                                            onCopyPreviousStyle={() => {
                                                if (index > 0) {
                                                    const prev = scenes[index - 1];
                                                    updateScene(scene.id, {
                                                        cameraAngleOverride: prev.cameraAngleOverride,
                                                        customCameraAngle: prev.customCameraAngle,
                                                        lensOverride: prev.lensOverride,
                                                        customLensOverride: prev.customLensOverride,
                                                        transitionType: prev.transitionType,
                                                        customTransitionType: prev.customTransitionType
                                                    });
                                                }
                                            }}
                                            onDragStart={(idx) => setDraggedSceneIndex(idx)}
                                            onDragOver={(idx) => {
                                                if (dragOverIndex !== idx) {
                                                    setDragOverIndex(idx);
                                                    (window as any).dragOverIndex = idx;
                                                }
                                            }}
                                            onDrop={(targetIdx) => {
                                                if (draggedSceneIndex !== null) {
                                                    moveScene(draggedSceneIndex, targetIdx);
                                                }
                                                setDraggedSceneIndex(null);
                                                setDragOverIndex(null);
                                                (window as any).dragOverIndex = null;
                                            }}
                                            onInsertAngles={onInsertAngles}
                                        />

                                        {/* Last Insert Button */}
                                        {index === scenes.length - 1 && (
                                            <div className="relative h-2 group/insert">
                                                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-brand-orange/0 group-hover/insert:border-brand-orange/30 transition-all"></div>
                                                <button
                                                    onClick={() => insertScene(index + 1)}
                                                    className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-orange text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover/insert:opacity-100 transition-all shadow-xl z-20 hover:scale-125"
                                                    title="Thêm phân cảnh mới vào cuối"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}

                                {viewMode === 'storyboard' && (
                                    <StoryBoardCard
                                        scene={scene}
                                        index={index}
                                        characters={characters}
                                        products={products}
                                        sceneGroups={sceneGroups}
                                        assignSceneToGroup={assignSceneToGroup}
                                        updateScene={updateScene}
                                        removeScene={removeScene}
                                        generateImage={() => performImageGeneration(scene.id)}
                                        generateEndFrame={() => performImageGeneration(scene.id, undefined, true)}
                                        openImageViewer={() => handleOpenImageViewer(index)}
                                        onDragStart={(idx) => setDraggedSceneIndex(idx)}
                                        onDragOver={(idx) => {
                                            if (dragOverIndex !== idx) {
                                                setDragOverIndex(idx);
                                                (window as any).dragOverIndex = idx;
                                            }
                                        }}
                                        onDrop={(targetIdx) => {
                                            if (draggedSceneIndex !== null) {
                                                moveScene(draggedSceneIndex, targetIdx);
                                            }
                                            setDraggedSceneIndex(null);
                                            setDragOverIndex(null);
                                            (window as any).dragOverIndex = null;
                                        }}
                                    />
                                )}
                            </React.Fragment>
                        );
                    });

                    return renderedScenes;
                })()}
            </div>
        </div>
    );
};
