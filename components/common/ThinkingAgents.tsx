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
    if (!agents) return null;

    const { director, dop } = agents;

    const renderAgent = (
        side: 'left' | 'right',
        agent: AgentState,
        Icon: any,
        name: string,
        colorClass: string
    ) => {
        const isActive = agent.status !== 'idle';
        if (!isActive) return null;

        return (
            <div
                className={`fixed bottom-6 ${side === 'left' ? 'left-6' : 'right-6'} z-[200] flex flex-col items-${side === 'left' ? 'start' : 'end'} animate-in fade-in slide-in-from-bottom-10 duration-700`}
            >
                {/* Thought/Message Bubble */}
                {agent.message && (
                    <div className={`mb-4 max-w-xs p-4 rounded-2xl backdrop-blur-xl border ${side === 'left' ? 'rounded-bl-none' : 'rounded-br-none'} transition-all duration-500 shadow-2xl relative group ${agent.status === 'error' ? 'bg-red-900/20 border-red-500/40 text-red-200' :
                            agent.status === 'success' ? 'bg-green-900/20 border-green-500/40 text-green-200' :
                                'bg-gray-900/60 border-white/10 text-white'
                        }`}>
                        <div className="flex items-start gap-2">
                            <MessageSquare size={14} className="mt-1 opacity-50 shrink-0" />
                            <p className="text-xs font-bold leading-relaxed tracking-tight">{agent.message}</p>
                        </div>

                        {/* Thinking Dots if status is thinking */}
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
                    {side === 'right' && (
                        <div className="text-right">
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">{name}</p>
                            <p className={`text-[9px] font-bold ${colorClass.replace('bg-', 'text-')} uppercase`}>{agent.status}</p>
                        </div>
                    )}

                    <div className={`w-12 h-12 rounded-full ${colorClass} p-0.5 shadow-2xl relative animate-float`}>
                        {/* Glow effect */}
                        <div className={`absolute inset-0 rounded-full blur-md ${colorClass} opacity-30 animate-pulse`}></div>

                        <div className="w-full h-full rounded-full bg-gray-950 flex items-center justify-center relative z-10 border border-white/10">
                            <Icon size={20} className={agent.status === 'thinking' ? 'animate-pulse' : ''} />
                        </div>

                        {/* Status indicator dot */}
                        <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-950 z-20 ${agent.status === 'thinking' ? 'bg-blue-500 animate-pulse' :
                                agent.status === 'speaking' ? 'bg-brand-orange animate-pulse' :
                                    agent.status === 'success' ? 'bg-green-500' :
                                        'bg-gray-500'
                            }`}></div>
                    </div>

                    {side === 'left' && (
                        <div className="text-left">
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
            <div className="pointer-events-none">
                {renderAgent('left', director, Clapperboard, 'Director', 'bg-brand-red')}
                {renderAgent('right', dop, Camera, 'DOP Assistant', 'bg-blue-600')}
            </div>
        </>
    );
};

export default ThinkingAgents;
