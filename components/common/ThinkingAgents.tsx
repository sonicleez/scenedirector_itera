import React from 'react';
import { AgentState } from '../../types';
import { Camera, Clapperboard, MessageSquare } from 'lucide-react';

interface ThinkingAgentsProps {
    agents?: {
        director: AgentState;
        dop: AgentState;
    };
}

const ThinkingAgents: React.FC<ThinkingAgentsProps> = ({ agents }) => {
    // Persistent state for positions (using snapped side and Y)
    const [positions, setPositions] = React.useState(() => {
        const saved = localStorage.getItem('agent_positions_v2');
        return saved ? JSON.parse(saved) : {
            director: { y: 80, side: 'left' as const },
            dop: { y: 80, side: 'right' as const }
        };
    });

    // Temp screen X during drag
    const [dragX, setDragX] = React.useState<number | null>(null);

    // Persistent state for minimized state
    const [minimized, setMinimized] = React.useState(() => {
        const saved = localStorage.getItem('agent_minimized');
        return saved ? JSON.parse(saved) : { director: false, dop: false };
    });

    const [dragging, setDragging] = React.useState<'director' | 'dop' | null>(null);
    const dragOffset = React.useRef({ x: 0, y: 0 });

    React.useEffect(() => {
        localStorage.setItem('agent_positions_v2', JSON.stringify(positions));
    }, [positions]);

    React.useEffect(() => {
        localStorage.setItem('agent_minimized', JSON.stringify(minimized));
    }, [minimized]);

    const handleMouseDown = (e: React.MouseEvent, agent: 'director' | 'dop') => {
        setDragging(agent);
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        dragOffset.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
        e.preventDefault();
    };

    React.useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!dragging) return;

            // Constrain Y to viewport
            const yFromBottom = window.innerHeight - e.clientY - (48 - dragOffset.current.y);
            const clampedY = Math.max(20, Math.min(window.innerHeight - 100, yFromBottom));

            setPositions(prev => ({
                ...prev,
                [dragging]: { ...prev[dragging], y: clampedY }
            }));

            setDragX(e.clientX - dragOffset.current.x);
        };

        const handleMouseUp = (e: MouseEvent) => {
            if (!dragging) return;

            // Snap to nearest side
            const threshold = window.innerWidth / 2;
            const finalSide = e.clientX < threshold ? 'left' : 'right';

            setPositions(prev => ({
                ...prev,
                [dragging]: { ...prev[dragging], side: finalSide }
            }));

            setDragging(null);
            setDragX(null);
        };

        if (dragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [dragging]);

    if (!agents) return null;

    const { director, dop } = agents;

    const renderAgent = (
        agentKey: 'director' | 'dop',
        agent: AgentState,
        Icon: any,
        name: string,
        colorClass: string
    ) => {
        const pos = positions[agentKey];
        const isMinimized = minimized[agentKey];
        const isActive = agent.status !== 'idle';
        const side = pos.side;
        const isCurrentlyDragging = dragging === agentKey;

        // Calculate dynamic style
        const style: React.CSSProperties = {
            bottom: `${pos.y}px`,
            zIndex: isCurrentlyDragging ? 1000 : 300,
            cursor: isCurrentlyDragging ? 'grabbing' : 'grab',
            transition: isCurrentlyDragging ? 'none' : 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)'
        };

        if (isCurrentlyDragging && dragX !== null) {
            style.left = `${dragX}px`;
        } else {
            style[side] = '24px';
        }

        return (
            <div
                onMouseDown={(e) => handleMouseDown(e, agentKey)}
                style={style}
                className={`fixed flex flex-col items-${side === 'left' ? 'start' : 'end'} select-none group`}
            >
                {/* Thought/Message Bubble */}
                {!isMinimized && agent.message && (
                    <div className={`mb-4 max-w-xs p-4 rounded-2xl backdrop-blur-xl border ${side === 'left' ? 'rounded-bl-none' : 'rounded-br-none'} transition-all duration-500 shadow-2xl relative ${agent.status === 'error' ? 'bg-red-900/20 border-red-500/40 text-red-200' :
                        agent.status === 'success' ? 'bg-green-900/20 border-green-500/40 text-green-200' :
                            'bg-gray-900/60 border-white/10 text-white'
                        }`}>
                        <div className="flex items-start gap-2">
                            <MessageSquare size={14} className="mt-1 opacity-50 shrink-0" />
                            <p className="text-xs font-bold leading-relaxed tracking-tight">{agent.message}</p>
                        </div>

                        {/* Thinking Dots */}
                        {agent.status === 'thinking' && (
                            <div className="flex gap-1 mt-2">
                                <div className="w-1 h-1 bg-current rounded-full animate-bounce"></div>
                                <div className="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                <div className="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:0.4s]"></div>
                            </div>
                        )}

                        {/* Pointer */}
                        <div className={`absolute -bottom-2 ${side === 'left' ? 'left-4' : 'right-4'} w-4 h-4 transform rotate-45 border-r border-b ${agent.status === 'error' ? 'bg-red-900/20 border-red-500/20' :
                            agent.status === 'success' ? 'bg-green-900/20 border-green-500/20' :
                                'bg-gray-950/40 border-white/5'
                            }`}></div>
                    </div>
                )}

                {/* Avatar Container */}
                <div className="flex items-center gap-3">
                    {side === 'right' && !isMinimized && (
                        <div className="text-right pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">{name}</p>
                            <p className={`text-[9px] font-bold ${colorClass.replace('bg-', 'text-')} uppercase`}>{agent.status}</p>
                        </div>
                    )}

                    <div
                        className={`relative transition-all duration-300 ${isMinimized ? 'scale-75 opacity-50 hover:opacity-100' : 'scale-100 hover:scale-110'}`}
                        onClick={(e) => {
                            // Only toggle if not dragging (threshold check)
                            if (!isCurrentlyDragging) {
                                setMinimized(prev => ({ ...prev, [agentKey]: !prev[agentKey] }));
                            }
                        }}
                    >
                        <div className={`w-12 h-12 rounded-full ${colorClass} p-0.5 shadow-2xl relative animate-float`}>
                            {/* Glow effect */}
                            <div className={`absolute inset-0 rounded-full blur-md ${colorClass} opacity-30 animate-pulse`}></div>

                            <div className="w-full h-full rounded-full bg-gray-950 flex items-center justify-center relative z-10 border border-white/10 overflow-hidden">
                                {isMinimized ? (
                                    <Icon size={16} className="opacity-40" />
                                ) : (
                                    <Icon size={20} className={agent.status === 'thinking' ? 'animate-pulse' : ''} />
                                )}
                            </div>

                            {/* Status indicator dot */}
                            <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-950 z-20 ${agent.status === 'thinking' ? 'bg-blue-500 animate-pulse' :
                                agent.status === 'speaking' ? 'bg-brand-orange animate-pulse' :
                                    agent.status === 'success' ? 'bg-green-500' :
                                        'bg-gray-500'
                                }`}></div>

                            {/* Hint Overlay */}
                            <div className="absolute inset-0 z-30 opacity-0 group-hover:opacity-100 flex items-center justify-center bg-black/40 backdrop-blur-[2px] rounded-full transition-opacity pointer-events-none">
                                <span className="text-[8px] font-black text-white uppercase">{isMinimized ? 'Show' : 'Hide'}</span>
                            </div>
                        </div>
                    </div>

                    {side === 'left' && !isMinimized && (
                        <div className="text-left pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">{name}</p>
                            <p className={`text-[9px] font-bold ${colorClass.replace('bg-', 'text-')} uppercase`}>{agent.status}</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <>
            <style>
                {`
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }
                .animate-float {
                    animation: float 4s ease-in-out infinite;
                }
                `}
            </style>
            <div className="fixed inset-0 pointer-events-none z-[999]">
                <div className="pointer-events-auto contents">
                    {renderAgent('director', director, Clapperboard, 'Director', 'bg-brand-red')}
                    {renderAgent('dop', dop, Camera, 'DOP Assistant', 'bg-blue-600')}
                </div>
            </div>
        </>
    );
};

export default ThinkingAgents;
