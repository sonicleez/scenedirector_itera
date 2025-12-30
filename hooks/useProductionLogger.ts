import { useCallback, useEffect, useRef } from 'react';
import { ProjectState, AgentStatus } from '../types';

export const useProductionLogger = (
    state: ProjectState,
    updateStateAndRecord: (fn: (s: ProjectState) => ProjectState) => void
) => {

    const lastLogRef = useRef<{ agent: string; message: string; time: number }>({ agent: '', message: '', time: 0 });

    const addProductionLog = useCallback((sender: 'director' | 'dop' | 'user' | 'system', message: string, type: 'info' | 'success' | 'warning' | 'error' | 'directive' = 'info', stage?: string) => {
        // Update lastLogRef for director/dop to prevent duplicate from setAgentState
        if (sender === 'director' || sender === 'dop') {
            lastLogRef.current = { agent: sender, message, time: Date.now() };
        }

        updateStateAndRecord(s => ({
            ...s,
            productionLogs: [
                ...(s.productionLogs || []),
                {
                    id: Math.random().toString(36).substring(7),
                    timestamp: Date.now(),
                    sender,
                    message,
                    type,
                    stage
                }
            ].slice(-100)
        }));
    }, [updateStateAndRecord]);

    const setAgentState = useCallback((agent: 'director' | 'dop', status: AgentStatus, message?: string, stage?: string) => {
        updateStateAndRecord(s => ({
            ...s,
            agents: {
                ...s.agents!,
                [agent]: { ...s.agents![agent], status, message, currentStage: stage, lastAction: Date.now() }
            }
        }));

        // Auto-log for non-idle status with message, but prevent rapid duplicates
        if (message && status !== 'idle') {
            const now = Date.now();
            const isDuplicate = lastLogRef.current.agent === agent &&
                lastLogRef.current.message === message &&
                (now - lastLogRef.current.time) < 2000;

            if (!isDuplicate) {
                lastLogRef.current = { agent, message, time: now };
                addProductionLog(agent, message, status === 'error' ? 'error' : status === 'success' ? 'success' : 'info', stage);
            }
        }
    }, [updateStateAndRecord, addProductionLog]);

    // Auto-dismissal for success messages
    useEffect(() => {
        const agents = state.agents;
        if (!agents) return;

        const timeout = setTimeout(() => {
            let changed = false;
            const newAgents = { ...agents };

            ['director', 'dop'].forEach((key) => {
                const agent = (agents as any)[key];
                if (agent.status === 'success' && Date.now() - agent.lastAction > 5000) {
                    newAgents[key as 'director' | 'dop'] = { ...agent, status: 'idle', message: '' };
                    changed = true;
                }
            });

            if (changed) {
                updateStateAndRecord(s => ({ ...s, agents: newAgents }));
            }
        }, 1000);

        return () => clearTimeout(timeout);
    }, [state.agents, updateStateAndRecord]);

    return { addProductionLog, setAgentState };
};
