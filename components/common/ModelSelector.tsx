import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface ModelOption {
    value: string;
    label: string;
    description?: string;
    provider?: string;
}

interface ModelSelectorProps {
    models: ModelOption[];
    value: string;
    onChange: (value: string) => void;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
    models,
    value,
    onChange,
    className = '',
    size = 'md'
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedModel = models.find(m => m.value === value);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const sizeClasses = {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-1.5 text-sm',
        lg: 'px-4 py-2 text-base'
    };

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-600 text-white transition-colors w-full justify-between ${sizeClasses[size]}`}
            >
                <span className="truncate">
                    {selectedModel?.label || 'Select Model'}
                </span>
                <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 max-h-72 overflow-y-auto bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50">
                    {models.map(model => (
                        <button
                            key={model.value}
                            onClick={() => {
                                onChange(model.value);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 hover:bg-gray-800 transition-colors ${value === model.value ? 'bg-purple-600/20 text-purple-300' : 'text-white'
                                }`}
                        >
                            <div className="font-medium text-sm">{model.label}</div>
                            {model.description && (
                                <div className="text-[10px] text-gray-500">{model.description}</div>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
